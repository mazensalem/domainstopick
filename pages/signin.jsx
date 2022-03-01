import React from "react";
import { getCsrfToken, getProviders, signIn } from "next-auth/react";

export default function Signin({ providers, csrfToken }) {
  return (
    <>
      {Object.values(providers).map((provider) =>
        provider.name != "Email" ? (
          <div key={provider.name}>
            <button onClick={() => signIn(provider.id)}>
              Sign in with {provider.name}
            </button>
          </div>
        ) : (
          <form
            key={provider.name}
            method="post"
            action="/api/auth/signin/email"
          >
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <label>
              Email address
              <input type="email" id="email" name="email" />
            </label>
            <button type="submit">Sign in with Email</button>
          </form>
        )
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);
  return {
    props: { providers, csrfToken },
  };
}
