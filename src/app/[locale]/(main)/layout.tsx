import MainChrome from "@/components/Global/MainChrome";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainChrome>{children}</MainChrome>;
}
