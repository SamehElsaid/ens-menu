import GoogleAuthProvider from "@/components/Global/GoogleAuthProvider";
import NoBfcache from "@/components/Global/NoBfcache";
import { localizeHref } from "@/i18n/routing";
import { DecryptedToken } from "@/proxy";
import { decryptData } from "@/shared/encryption";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const cookieStore = await cookies();
  const { locale } = await params;

  const token = cookieStore.get("sub");
  const tokenDecrypted = token ? decryptData(token.value) as DecryptedToken : null;

  console.log(tokenDecrypted);
  if (tokenDecrypted) {
    return redirect(
      localizeHref(
        tokenDecrypted?.role === "admin" ? "/admin" : "/dashboard",
        locale,
      ),
    );
  }

  return (
    <GoogleAuthProvider>
      <NoBfcache />
      {children}
    </GoogleAuthProvider>
  );
}
