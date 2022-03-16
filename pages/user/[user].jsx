import React from "react";
import { useState } from "react";
import client from "../../lib/mongodb";
import { getSession } from "next-auth/react";
import { ObjectId } from "mongodb";

export default function User({
  error,
  img,
  ubio,
  uname,
  cuser,
  user,
  buttontext,
}) {
  const [message, setmessage] = useState("");
  const [textvalue, settextvalue] = useState(buttontext);
  if (error) {
    return <div>{error}</div>;
  }
  const submit = async (e) => {
    e.preventDefault();
    const rresbond = await fetch("/api/follow", {
      method: "POST",
      body: JSON.stringify({
        from: e.target.from.value,
        to: e.target.to.value,
        follow: textvalue,
      }),
    });
    const resbond = await rresbond.json();
    if (resbond.content == "followed" || resbond.content == "unfollowed") {
      settextvalue(!textvalue);
    }
    setmessage(resbond.content);
  };

  return (
    <div>
      {message}
      <img src={img} />
      <strong>{uname}</strong>
      {ubio}
      <form onSubmit={submit}>
        <input type="hidden" value={cuser} name="from" />
        <input type="hidden" value={user} name="to" />
        {cuser == user ? (
          "you can't follow your self"
        ) : cuser ? (
          <input type="submit" value={textvalue ? "follow" : "unfollow"} />
        ) : (
          "you aren't signed in"
        )}
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  let props = { error: null };
  const { req } = context;
  const cl = await client;
  const col = await cl.db().collection("users");
  const user = await col.findOne({ _id: new ObjectId(context.query.user) });
  const session = await getSession({ req });
  let cuser;
  let muser;
  if (session) {
    muser = await col.findOne({ email: session.user.email });
    cuser = JSON.stringify(muser._id).slice(
      1,
      JSON.stringify(muser._id).length - 1
    );
  }
  if (user) {
    props = {
      buttontext: !muser.following.includes(`"` + context.query.user + `"`),
      img: user.image_url || "/user.png",
      ubio: user.bio || "",
      uname: user.name || "",
      cuser: cuser || "",
      user:
        JSON.stringify(user._id).slice(
          1,
          JSON.stringify(user._id).length - 1
        ) || "",
    };
  } else {
    props = { error: "user not found" };
  }
  return { props };
}
