import { ObjectId } from "mongodb";
import { useSession, getSession } from "next-auth/react";
import Link from "next/link";
import client from "../lib/mongodb";
import { useState } from "react";
import Router from "next/router";

export default function Profile({
  id,
  img,
  ubio,
  uname,
  email,
  ufollowed,
  ufollowing,
  uposts,
}) {
  const [loading, setloading] = useState("");
  const [followed, setfollowed] = useState(ufollowed);
  const [following, setfollowing] = useState(ufollowing);
  const [posts, setposts] = useState(uposts);
  const [massage, setmassage] = useState("");
  const { status } = useSession({
    required: true,
  });
  if (status === "loading") {
    return "Loading or not authenticated...";
  }
  return (
    <>
      {loading}
      {massage}
      <img src={img} />
      <strong>{uname}</strong>
      {ubio}
      logged in as {email}
      <Link href="/signup">
        <a>edit</a>
      </Link>
      <Link href={"/user/" + id}>
        <a>see who the people see it</a>
      </Link>
      <Link href="/addpost">
        <a>add post</a>
      </Link>
      <div>
        <h5>followed</h5> {followed.length}
        {followed.map((value) => (
          <>
            {value} <br />
          </>
        ))}
      </div>
      <div>
        <h5>following</h5> {following.length}
        {following.map((value) => (
          <div>
            {value.name} <br />
            <button
              onClick={async () => {
                setloading("loading");
                const rdata = await fetch("/api/follow", {
                  method: "POST",
                  body: JSON.stringify({
                    from: id,
                    to: value.id,
                    follow: false,
                  }),
                });
                const data = await rdata.json();
                const newfollwing = following.filter(
                  (value1) => value1.id != value.id
                );
                setmassage(data.content);
                setfollowing(newfollwing);
                setloading("");
              }}
            >
              unfollow
            </button>
          </div>
        ))}
      </div>
      <div>
        <h5>posts</h5> {posts.length}
        {posts.map((value) => (
          <>
            <Link href={"/post/" + value.id}>
              <a>
                {value.name} <br />
              </a>
            </Link>
            <button
              onClick={() => {
                Router.push("/editpost?id=" + value.id);
              }}
            >
              edit
            </button>
            <button
              onClick={async () => {
                setloading("loading");
                setmassage("");
                const rdata = await fetch("/api/deletepost", {
                  method: "POST",
                  body: JSON.stringify({ post: value.id }),
                });
                const data = await rdata.json();
                if (data.content == "done") {
                  const newposts = posts.filter((e) => e.id != value.id);
                  setposts(newposts);
                  setmassage("post deleted");
                } else {
                  setmassage(data.content);
                }
                setloading("");
              }}
            >
              delete
            </button>
          </>
        ))}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const session = await getSession({ req });
  let props = {};
  if (session) {
    const email = session.user.email;
    const cl = await client;
    const col = await cl.db().collection("users");
    const pcol = await cl.db().collection("posts");
    const user = await col.findOne({ email });
    const id = JSON.stringify(user._id).slice(
      1,
      JSON.stringify(user._id).length - 1
    );
    const followed = [];
    const following = [];
    const posts = [];

    for (let i in user.followers) {
      const id = user.followers[i].slice(1, user.followers[i].length - 1);
      const follower = await col.findOne({ _id: new ObjectId(id) });
      followed.push(follower.name);
    }

    for (let i in user.following) {
      const id = user.following[i].slice(1, user.following[i].length - 1);
      const follower = await col.findOne({ _id: new ObjectId(id) });
      following.push({ name: follower.name, id });
    }

    for (let i in user.posts) {
      const id = user.posts[i].slice(1, user.posts[i].length - 1);
      const post = await pcol.findOne({ _id: new ObjectId(id) });
      posts.push({ id, name: post.title });
    }

    props = {
      img: user.image_url || "/user.png",
      ubio: user.bio || "",
      uname: user.name || "",
      email,
      id,
      ufollowed: followed,
      ufollowing: following,
      uposts: posts,
    };
  }
  return { props };
}
