import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function IndexPage() {
  const { data, status } = useSession();
  if (status == "loading") {
    return <h1>loading</h1>;
  }
  return (
    <>
      {data ? (
        <>
          <h1>
            <Link href={"profile"}>
              <a>hi, {data.user.email}</a>
            </Link>
          </h1>
          <button onClick={() => signOut()}>sign out</button>
        </>
      ) : (
        <>
          <button onClick={() => signIn()}>sign in</button>
        </>
      )}
    </>
  );
}
