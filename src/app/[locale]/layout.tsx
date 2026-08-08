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
import 'suneditor/dist/css/suneditor.min.css'

import { getSiteOrigin } from "@/lib/sitemap/data";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/organizationSchema";
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
        {/*
          THESIS: the working surface of a live venue, read every day by the
          person who runs it. It refuses the airy marketing-grade dashboard:
          nothing is spaced for a screenshot.
          OWN-WORLD: true-graphite neutrals, one indigo accent spent only on
          decisions, hairlines over shadows, 13px base, 32px controls, tabular
          figures, Readex Pro across Arabic and Latin.
          STORY: the owner sees what guests see, changes it, and knows it
          published — without leaving the menu they are holding.
          FIRST VIEWPORT: 240px rail with a menu switcher at its head, 48px
          header carrying search and account, then the page's own title row and
          its primary action at the inline end.
          FORM: the category standard, played straight (canon; grounded list
          candidate 3 declined by the user); seed key 199dcbcb.
          FINISH: unreviewed and undocumented is unfinished; this build ends
          with the finish review, the verdict, and DESIGN.md
        */}
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
