import { ObjectId } from "mongodb";
import client from "../../lib/mongodb";

export default async (req, res) => {
  const { from, to, follow } = JSON.parse(req.body);
  if (from == to) {
    res.json({ content: "you can't follow your self" });
  } else if (!from || !to) {
    res.json({ content: "some thing wrong happend " });
  } else {
    const cl = await client;
    const col = await cl.db().collection("users");
    const tuser = await col.findOne({ _id: new ObjectId(to) });
    const fuser = await col.findOne({ _id: new ObjectId(from) });
    if (follow) {
      await col.updateOne(
        { _id: tuser._id },
        { $set: { followers: [...tuser.followers, JSON.stringify(fuser._id)] } }
      );
      await col.updateOne(
        { _id: fuser._id },
        { $set: { following: [...fuser.following, JSON.stringify(tuser._id)] } }
      );
      res.json({ content: "followed" });
    } else {
      const followers = tuser.followers.filter((value) => {
        if (value == JSON.stringify(fuser._id)) {
          return false;
        }
        return true;
      });
      const following = fuser.following.filter((value) => {
        if (value == JSON.stringify(tuser._id)) {
          return false;
        }
        return true;
      });

      await col.updateOne({ _id: tuser._id }, { $set: { followers } });
      await col.updateOne({ _id: fuser._id }, { $set: { following } });
      res.json({ content: "unfollowed" });
    }
  }
};
