"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "@/i18n/navigation";

type ChatwootWindow = Window & {
  $chatwoot?: {
    toggleBubbleVisibility: (state: "hide" | "show") => void;
  };
};

export default function SupportChatwoot() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    const chatwoot = (window as ChatwootWindow).$chatwoot;
    if (!chatwoot?.toggleBubbleVisibility) return;
    chatwoot.toggleBubbleVisibility(isAdminRoute ? "hide" : "show");
  }, [isAdminRoute]);

  if (isAdminRoute) return null;

  return (
    <>
      <Script id="chatwoot-settings" strategy="afterInteractive">
        {`window.chatwootSettings = { position: "left" };`}
      </Script>
      <Script
        src="https://support.ens.eg/widget.js?key=ste_b9498147b00024bae6f9102153fa03e6"
        strategy="lazyOnload"
      />
    </>
  );
}
