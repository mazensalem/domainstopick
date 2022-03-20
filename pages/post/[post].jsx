import React from "react";
import client from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";

export default function post({
  title,
  description,
  image,
  postid,
  ucomments,
  ulikes,
  owned,
  user,
  erorr,
}) {
  const [errors, seterrors] = useState("");
  const [loading, setloading] = useState("");
  const [comment, setcomment] = useState("");
  const [comments, setcomments] = useState(ucomments);
  let likes = ulikes;
  return (
    <div>
      {errors}
      {erorr}
      {loading}
      {title} {description} <img src={image} />
      {likes.length}
      {user && (
        <button
          onClick={async () => {
            const rdata = await fetch("/api/like", {
              method: "POST",
              body: JSON.stringify({ from: user, to: postid }),
            });
            const data = await rdata.json();
            if (data.content == "liked") {
              likes.push(user);
              setloading("loading");
            } else if (data.content == "unliked") {
              likes.splice(
                likes.findIndex((e) => e == user),
                1
              );
              setloading("loading");
            } else {
              seterrors(data.content);
            }
            setloading("");
          }}
        >
          {likes.includes(user) ? "unlike" : "like"}
        </button>
      )}
      {owned ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              Router.push("/editpost/?id=" + postid);
            }}
          >
            <input type="submit" value="edit" />
          </form>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setloading("loading");
              seterrors("");
              const rdata = await fetch("/api/deletepost", {
                method: "POST",
                body: JSON.stringify({ post: postid }),
              });
              const data = await rdata.json();
              if (data.content == "done") {
                Router.push("/profile");
              } else {
                seterrors(data.content);
                setloading("");
              }
            }}
          >
            <input type="submit" value="delete" />
          </form>
        </>
      ) : (
        <></>
      )}
      <div>
        {user && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setloading("loading");
              seterrors("");
              const rdata = await fetch("/api/sendcomment", {
                method: "POST",
                body: JSON.stringify({ text: comment, from: user, to: postid }),
              });
              const data = await rdata.json();
              if (data.content != "done") {
                seterrors(data.content);
              }
              setloading("");
              setcomment("");
              setcomments([...comments, { text: data.text, from: data.from }]);
            }}
          >
            <input
              type="text"
              value={comment}
              onChange={(e) => setcomment(e.target.value)}
            />
            <input type="submit" />
          </form>
        )}
        {comments.map((value) => (
          <div>
            <strong>{value.from}</strong> {value.text}
            {value.owned && (
              <button
                onClick={async () => {
                  setloading("loading");
                  const rdata = await fetch("/api/deletecomments", {
                    method: "POST",
                    body: JSON.stringify({ id: value.id, postid }),
                  });
                  const data = await rdata.json();
                  if (data.content != "done") {
                    seterrors(data.content);
                  } else {
                    const newcomments = comments.filter(
                      (value1) => value1.id != value.id
                    );
                    setcomments(newcomments);
                  }
                  setloading("");
                }}
              >
                delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const props = {
    owned: false,
  };
  const cl = await client;
  const pcol = await cl.db().collection("posts");
  const ucol = await cl.db().collection("users");
  const ccol = await cl.db().collection("comments");
  const dpost = await pcol.findOne({ _id: new ObjectId(context.query.post) });
  const session = await getSession({ req });
  let user = { _id: "" };
  if (session) {
    user = await ucol.findOne({ email: session.user.email });
  }
  if (!dpost) {
    props.erorr = "we can't find this post it could be deleted";
    return { props };
  } else {
    const comments = [];
    for (let i in dpost.comments) {
      const dcomment = await ccol.findOne({
        _id: new ObjectId(
          dpost.comments[i].slice(1, dpost.comments[i].length - 1)
        ),
      });
      const ucomment = await ucol.findOne({
        _id: new ObjectId(dcomment.from.slice(1, dcomment.from.length - 1)),
      });
      comments.push({
        text: dcomment.text,
        from: ucomment.name,
        owned: `"` + user.id + `"` == dcomment.from,
        id: JSON.stringify(dcomment._id),
      });
    }

    props.title = dpost.title || "";
    props.description = dpost.text || "";
    props.image = dpost.image_url || "";
    props.ulikes = dpost.likes || "";
    props.ucomments = comments;
    props.postid = context.query.post || "";
  }
  if (session) {
    if (user.posts.includes(`"` + context.query.post + `"`)) {
      props.owned = true;
    }
    props.user = JSON.stringify(user._id);
  }
  return {
    props: props,
  };
}
