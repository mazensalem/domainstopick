import { getSession } from "next-auth/react";
import client from "../../lib/mongodb";

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    const email = session.user.email;
    const cl = await client;
    const col = await cl.db().collection("users");
    const user = await col.findOne({ email });
    const users = {
      ...user,
      ...JSON.parse(req.body),
      followers: [],
      following: [],
      posts: [],
    };
    await col.replaceOne({ email }, users);
    res.json({ content: "wellcome" });
  } else {
    res.json({ error: "you aren't signed in" });
  }
};
