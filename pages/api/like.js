import { ObjectId } from "mongodb";
import client from "../../lib/mongodb";

export default async (req, res) => {
  const { from, to } = JSON.parse(req.body);
  const cl = await client;
  const pcol = await cl.db().collection("posts");
  const post = await pcol.findOne({ _id: new ObjectId(to) });
  if (!from) {
    res.josn({ content: "you aren't signed in" });
    return;
  }
  if (post.likes.includes(from)) {
    const newlikes = post.likes.filter((value) => value != from);
    await pcol.updateOne(
      { _id: new ObjectId(to) },
      { $set: { likes: newlikes } }
    );
    res.json({ content: "unliked" });
  } else {
    await pcol.updateOne(
      { _id: new ObjectId(to) },
      { $set: { likes: [...post.likes, from] } }
    );
    res.json({ content: "liked" });
  }
};
