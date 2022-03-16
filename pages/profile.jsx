import { useSession, getSession } from "next-auth/react";
import Link from "next/link";
import client from "../lib/mongodb";

export default function Profile({ id, img, ubio, uname, email }) {
  const { status } = useSession({
    required: true,
  });
  if (status === "loading") {
    return "Loading or not authenticated...";
  }
  return (
    <>
      <img src={img} />
      <strong>{uname}</strong>
      {ubio}
      logged in as {email}
      <Link href="/signup">
        <a>edit</a>
      </Link>
      <Link href={"/user/" + id}>
        <a>see who the people see it</a>
      </Link>
      {/* list of following */}
      {/* list of followed */}
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const session = await getSession({ req });
  let props = {};
  if (session) {
    const email = session.user.email;
    const cl = await client;
    const col = await cl.db().collection("users");
    const user = await col.findOne({ email });
    const id = JSON.stringify(user._id).slice(
      1,
      JSON.stringify(user._id).length - 1
    );

    props = {
      img: user.image_url || "/user.png",
      ubio: user.bio || "",
      uname: user.name || "",
      email,
      id,
    };
  }
  return { props };
}
