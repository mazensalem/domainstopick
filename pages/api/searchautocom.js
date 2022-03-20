import client from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const { search } = JSON.parse(req.body);
  const cl = await client;
  const colp = await cl.db().collection("posts");
  const cursur = await colp
    .find({ title: new RegExp(search, "i") })
    .project({ _id: 0, title: 1 });
  const result = await cursur.toArray();
  console.log(result);
  res.json({ content: "done", result: JSON.stringify(result) });
};
