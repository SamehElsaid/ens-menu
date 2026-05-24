import Header from "@/components/Global/Header";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="home-main min-h-screen w-full overflow-x-hidden">
        {children}
      </main>
    </>
  );
}
