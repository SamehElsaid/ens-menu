import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

/** Legacy URL — staff no longer sign in to the web dashboard here. */
export default async function StaffLoginRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/auth/login`);
}
