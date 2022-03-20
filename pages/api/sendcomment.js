import { ObjectId } from "mongodb";
import client from "../../lib/mongodb";

export default async (req, res) => {
  const { text, from, to } = JSON.parse(req.body);
  const cl = await client;
  const pcol = await cl.db().collection("posts");
  const ccol = await cl.db().collection("comments");
  const ucol = await cl.db().collection("users");
  if (!text) {
    res.json({ content: "you can't upload a blank comment" });
    return;
  }
  if (!from) {
    res.json({ content: "you aren't signed in" });
  }
  const dcomment = await ccol.insertOne({ text, from, to });
  const post = await pcol.findOne({ _id: new ObjectId(to) });
  const uuser = await ucol.findOne({
    _id: new ObjectId(from.slice(1, from.length - 1)),
  });
  await pcol.updateOne(
    { _id: new ObjectId(to) },
    {
      $set: {
        comments: [...post.comments, JSON.stringify(dcomment.insertedId)],
      },
    }
  );
  res.json({ content: "done", text, from: uuser.name });
};
