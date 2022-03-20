import client from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const { search, catagory } = JSON.parse(req.body);
  const cl = await client;
  const colp = await cl.db().collection("posts");
  const colu = await cl.db().collection("users");
  if (catagory.trim() == "posts") {
    const cursur = await colp.find({ title: new RegExp(search, "i") });
    const result = await cursur.toArray();
    res.json({ content: "done", result: JSON.stringify(result) });
  } else {
    const cursur = await colu.find({ name: new RegExp(search, "i") });
    const result = await cursur.toArray();
    res.json({ content: "done", result: JSON.stringify(result) });
  }
};
