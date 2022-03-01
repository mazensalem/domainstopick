import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

export default function IndexPage() {
  const { data: session } = useSession();

  return <button onClick={() => signIn()}>Sign in</button>;
}
