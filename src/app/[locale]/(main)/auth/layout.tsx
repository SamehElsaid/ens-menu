import GoogleAuthProvider from "@/components/Global/GoogleAuthProvider";
import NoBfcache from "@/components/Global/NoBfcache";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleAuthProvider>
      <NoBfcache />
      {children}
    </GoogleAuthProvider>
  );
}
