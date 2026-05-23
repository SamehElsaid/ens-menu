import GoogleAuthProvider from "@/components/Global/GoogleAuthProvider";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GoogleAuthProvider>{children}</GoogleAuthProvider>;
}
