import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import RenderInProvider from "@/components/Global/RenderInProvider";
import ProgressBar from "@/components/Global/ProgressBar";
import { mergeSeoKeywords } from "@/lib/seo";
import "react-phone-number-input/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "suneditor/dist/css/suneditor.min.css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "react-lazy-load-image-component/src/effects/blur.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: appUrl ? new URL(appUrl) : undefined,
    title: {
      default: t("home.title"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("home.description"),
    keywords: mergeSeoKeywords(t("coreKeywords"), t("home.keywords")),
    applicationName: t("siteName"),
  };
}

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default async function RootLayout({
  children,
  params,
}: Readonly<LayoutProps>) {
  const { locale } = await params;
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <ProgressBar />
        <ToastContainer
          position={locale === "ar" ? "top-left" : "top-right"}
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={locale === "ar"}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <NextIntlClientProvider>
          <RenderInProvider>{children}</RenderInProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
