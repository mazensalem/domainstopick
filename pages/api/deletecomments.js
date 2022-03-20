import { ObjectId } from "mongodb";
import client from "../../lib/mongodb";

export default async (req, res) => {
  const { id, postid } = JSON.parse(req.body);
  const cl = await client;
  const ccol = await cl.db().collection("comments");
  const pcol = await cl.db().collection("posts");
  const result1 = await ccol.deleteOne({
    _id: new ObjectId(id.slice(1, id.length - 1)),
  });
  const post = await pcol.findOne({ _id: new ObjectId(postid) });
  const newcomments = post.comments.filter((value) => value != id);
  const result2 = await pcol.updateOne(
    {
      _id: new ObjectId(postid),
    },
    { $set: { comments: newcomments } }
  );

  if (result1.acknowledged && result2.acknowledged) {
    res.json({ content: "done" });
  } else {
    res.json({ content: "there is a problem" });
  }
};
