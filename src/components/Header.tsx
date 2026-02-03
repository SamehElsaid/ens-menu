"use client";
import LinkTo from "@/components/Global/LinkTo";
import { homeLinks } from "@/modules/Header";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { useRouter } from "@/i18n/navigation";

function Header() {
  const t = useTranslations("");
  const router = useRouter();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-5 bg-white">
      <div className="container flex justify-between items-center">
        <button onClick={() => router.push("/")} className="text-2xl font-bold">
          Logo
        </button>

        <div className="">
          <ul className="flex items-center gap-4">
            {homeLinks.map((link) => (
              <li key={link.href}>
                <LinkTo href={link.href}>
                  {t(link.title as keyof typeof t)}
                </LinkTo>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex  gap-2">
          <LanguageSwitcher />
          <LinkTo href="/auth/register">
            <button className="bg-secondary text-white px-4 py-2 rounded-md">
              Let&apos;s Started
            </button>
          </LinkTo>
        </div>
      </div>
    </header>
  );
}

export default Header;
