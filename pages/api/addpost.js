import client from "../../lib/mongodb";
import { getSession } from "next-auth/react";

export default async (req, res) => {
  const cl = await client;
  const colp = await cl.db().collection("posts");
  const colu = await cl.db().collection("users");
  const session = await getSession({ req });
  const email = session.user.email;
  if (session) {
    const duser = await colu.findOne({ email });
    const post = JSON.parse(req.body);
    const dpost = await colp.insertOne(post);
    colu.updateOne(
      { email: session.user.email },
      {
        $set: { posts: [...duser.posts, JSON.stringify(dpost.insertedId)] },
      }
    );
    res.json({ content: "done" });
  } else {
    res.json({ error: "you aren't signed in'" });
  }
};
