import { useSession } from "next-auth/react";

export default function Profile({ url }) {
  const { status } = useSession({
    required: true,
  });
  if (status === "loading") {
    return "Loading or not authenticated...";
  }

  return "User is logged in";
}
