import { ObjectId } from "mongodb";
import { getSession } from "next-auth/react";
import client from "../../lib/mongodb";

export default async (req, res) => {
  const session = await getSession({ req });
  const cl = await client;
  const ucol = await cl.db().collection("users");
  const pcol = await cl.db().collection("posts");
  if (session) {
    const duser = await ucol.findOne({ email: session.user.email });
    if (duser.posts.includes(`"` + JSON.parse(req.body).post) + `"`) {
      const post = await pcol.findOne({
        _id: new ObjectId(JSON.parse(req.body).post),
      });
      if (post.image_public_id) {
        await fetch("http://localhost:3000/api/deleteimage", {
          method: "POST",
          body: JSON.stringify({ public_id: post.image_public_id }),
        });
      }
      await pcol.deleteOne({ _id: new ObjectId(JSON.parse(req.body).post) });
      const posts = duser.posts.filter(
        (value) => value != `"` + JSON.parse(req.body).post + `"`
      );
      await ucol.updateOne(
        { email: session.user.email },
        {
          $set: {
            posts,
          },
        }
      );
      res.json({ content: "done" });
    } else {
      res.json({ error: "this is not your post" });
    }
  } else {
    res.json({ error: "you aren't signed in" });
  }
};
