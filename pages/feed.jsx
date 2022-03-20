import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import client from "../lib/mongodb";
import Link from "next/link";
import { useState } from "react";

export default function feed({ uposts, page, isend }) {
  const [posts, setposts] = useState(uposts);
  const [users, setusers] = useState([]);
  const [state, setstate] = useState("posts");
  const [loading, setloading] = useState("");
  const [autocompletetext, setautocompletetext] = useState("");
  const search = async (e) => {
    e.preventDefault();
    setloading("loading");
    const rdata = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({
        catagory: e.target.catagory.value,
        search: e.target.search.value,
      }),
    });
    const data = await rdata.json();
    if (e.target.catagory.value != "posts") {
      setstate("users");
      setusers(JSON.parse(data.result));
    } else {
      setposts(data.result);
      setstate("posts");
    }
    setloading("");
  };
  return (
    <div>
      {loading}
      <div>
        <form onSubmit={search}>
          <input
            name="search"
            onChange={async (e) => {
              if (e.target.value) {
                const rdata = await fetch("/api/searchautocom", {
                  method: "POST",
                  // don't forget to change it to accept users search
                  body: JSON.stringify({ search: e.target.value }),
                });
                const data = await rdata.json();
                const titles = JSON.parse(data.result);
                for (let i in titles) {
                  setautocompletetext(
                    autocompletetext + "\n" + titles[i].title
                  );
                }
              }
            }}
            type="text"
            placeholder="enter search"
          />
          <div>{autocompletetext}</div>
          <input name="catagory" type="text" placeholder="enter the catagory" />
          <input type="submit" />
        </form>
      </div>
      {state == "posts"
        ? JSON.parse(posts).map((value) => (
            <div>
              <img width={200} height={200} src={value.image_url} />
              <Link href={"/post/" + value._id}>{value.title}</Link>
              <strong>{value.likes.length}</strong>
            </div>
          ))
        : users.map((value) => (
            <div>
              <img
                width={200}
                height={200}
                src={value.image_url || "/user.png"}
              />
              <Link href={"/user/" + value._id}>{value.name}</Link>
            </div>
          ))}
      {isend &&
        "you have reached the end of the posts\n\nfollow more people to see more posts"}
      {Number(page) > 1 && (
        <Link href={"/feed?page=" + (Number(page) - 1)}>back</Link>
      )}{" "}
      {page}{" "}
      {!isend && <Link href={"/feed?page=" + (Number(page) + 1)}>next</Link>}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const page = context.query.page || "1";
  const session = await getSession({ req });
  let props = {};

  const cl = await client;
  const pcol = await cl.db().collection("posts");
  let posts;
  if (session) {
    const email = session.user.email;
    const ucol = await cl.db().collection("users");
    const user = await ucol.findOne({ email });
    posts = [];
    for (let i in user.following) {
      const puser = await ucol.findOne({
        _id: new ObjectId(
          user.following[i].slice(1, user.following[i].length - 1)
        ),
      });
      for (let i in puser.posts) {
        const post = await pcol.findOne({
          _id: new ObjectId(puser.posts[i].slice(1, puser.posts[i].length - 1)),
        });
        posts.push(post);
      }
    }
  } else {
    const rposts = await pcol.find();
    posts = await rposts.toArray();
  }
  posts = posts.sort((a, b) => a.title > b.title);
  props.isend = page * 20 >= posts.length;
  posts = posts.slice(page * 20 - 20, page * 20);
  props.uposts = JSON.stringify(posts);
  props.page = page;
  return { props };
}
