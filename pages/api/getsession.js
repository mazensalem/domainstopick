import { getSession } from "next-auth/react";

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    res.send({ content: "wellcome" });
  } else {
    res.send({ content: "you aren't signed in" });
  }
};
