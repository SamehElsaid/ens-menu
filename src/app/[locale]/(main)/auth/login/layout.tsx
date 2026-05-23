import GoogleAuthProvider from "@/components/Global/GoogleAuthProvider";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoogleAuthProvider>{children}</GoogleAuthProvider>;
}
