import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import RenderInProvider from "@/components/Global/RenderInProvider";
import ContactFab from "@/components/Global/ContactFab";
import SupportChatwoot from "@/components/Global/SupportChatwoot";
import ProgressBar from "@/components/Global/ProgressBar";
import GoogleGtag from "@/components/Global/GoogleGtag";
import GoogleTagManager from "@/components/Global/GoogleTagManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "suneditor/dist/css/suneditor.min.css";

import { getSiteOrigin } from "@/lib/sitemap/data";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/organizationSchema";
import JsonLd from "@/components/Global/JsonLd";

const appUrl = getSiteOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "ENSmenu",
    template: "ENSmenu - %s",
  },
  description:
    "ENSmenu is a platform for creating digital menus for restaurants and cafes",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
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
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
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
          <ContactFab />
          <SupportChatwoot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
