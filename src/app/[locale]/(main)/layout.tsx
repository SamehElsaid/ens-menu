import ChatWidget from "@/components/ChatWidget";
import Header from "@/components/Global/Header";
import SiteFooter from "@/components/Global/SiteFooter";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="site-layout flex flex-col">
        <main className="home-main flex w-full flex-1 flex-col overflow-x-clip overflow-y-visible bg-white  text-start text-slate-900 sm:pb-6 dark:bg-[#0d1117] dark:text-slate-100">
          {children}
        </main>
        <SiteFooter />
      </div>
      <ChatWidget />
    </>
  );
}
