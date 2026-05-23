import GoogleAuthProvider from "@/components/Global/GoogleAuthProvider";
import AuthSessionGate from "@/components/Global/AuthSessionGate";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleAuthProvider>
      <AuthSessionGate>{children}</AuthSessionGate>
    </GoogleAuthProvider>
  );
}
