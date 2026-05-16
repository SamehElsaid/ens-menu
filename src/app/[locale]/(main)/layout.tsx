import Header from "@/components/Global/Header";
import SeoJsonLd from "@/components/Seo/SeoJsonLd";

export default async function MainLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <>
      <SeoJsonLd locale={locale} />
      <Header />
      {children}
    </>
  );
}
