import client from "../../lib/mongodb";
import { getSession } from "next-auth/react";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const cl = await client;
  const colp = await cl.db().collection("posts");
  const colu = await cl.db().collection("users");
  const session = await getSession({ req });
  const email = session.user.email;
  if (session) {
    const duser = await colu.findOne({ email });
    const post = JSON.parse(req.body);
    if (duser.posts.includes(`"` + post.id + `"`)) {
      const opost = await colp.findOne({ _id: new ObjectId(post.id) });
      const fpost = {
        title: post.title,
        text: post.text,
        image_url: post.image_url,
        image_public_id: post.image_public_id,
      };
      await colp.replaceOne(
        { _id: new ObjectId(post.id) },
        { ...opost, ...fpost }
      );
      res.json({ content: "done" });
    } else {
      res.json({ content: "you aren't the owner of this post" });
    }
  } else {
    res.json({ error: "you aren't signed in'" });
  }
};
