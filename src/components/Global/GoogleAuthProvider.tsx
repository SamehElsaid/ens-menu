"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

// Loaded only on /auth/* routes (see auth/layout.tsx).
// Support both NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_AUTH_URL.
const clientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ||
  "placeholder.apps.googleusercontent.com";

export default function GoogleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
