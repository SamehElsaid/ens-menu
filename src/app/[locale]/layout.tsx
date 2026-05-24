import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { cairo, fontVariables } from "@/lib/fonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import RenderInProvider from "@/components/Global/RenderInProvider";
import ProgressBar from "@/components/Global/ProgressBar";
import GoogleGtag from "@/components/Global/GoogleGtag";
import GoogleTagManager from "@/components/Global/GoogleTagManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: appUrl ? new URL(appUrl) : undefined,
  title: "ENSmenu",
  description:
    "ENSmenu is a platform for creating digital menus for restaurants and cafes",
};

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
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${fontVariables} ${cairo.className}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <GoogleTagManager />
          <GoogleGtag />
        </Suspense>
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RenderInProvider>{children}</RenderInProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
