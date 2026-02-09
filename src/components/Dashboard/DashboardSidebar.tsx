"use client";
import { usePathname } from "@/i18n/navigation";
import LinkTo from "../Global/LinkTo";
import { navSections } from "./data";
import Drawer from "../Global/Drawer";
import { useLocale, useTranslations } from "next-intl";
import LoadImage from "../ImageLoad";
import { useAppSelector } from "@/store/hooks";

export function DashboardSidebar({
  isMenuOpen,
  segment,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  segment: string | null;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const navSectionsData = navSections;

  const { menu, loading } = useAppSelector((state) => state.menuData);


  const activeLink = (link: string) => {
    console.log(pathname, link);

    if (link === "") {
      return pathname === "/dashboard/" + segment;
    }
    return pathname.includes(link);
  }

  console.log(menu);

  const sidebarSections = (hidden = false) => (
    <aside
      className={`${hidden ? "hidden w-[270px]" : " w-full"
        }  flex flex-col border-e border-slate-100 bg-white lg:flex h-dvh fixed top-0 start-0`}
    >
      <LinkTo
        href="/"
        className="flex items-center gap-3 px-6 py-6 max-w-[200px]!"
      >
        {loading || !menu ? (
          <div className="flex items-center gap-3 w-full">
            <div className="h-11 w-11 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {menu.logo ? (
              <LoadImage
                src={menu.logo}
                alt={locale === "ar" ? menu.nameAr ?? "" : menu.nameEn ?? ""}
                className="w-11 h-11 rounded-2xl"
                width={44}
                height={44}
              />
            ) : (
              <span className="flex capitalize h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                {locale === "ar"
                  ? menu.nameAr?.charAt(0) ?? ""
                  : menu.nameEn?.charAt(0) ?? ""}
              </span>
            )}
            <div className="flex flex-col">
              <p className="text-lg font-semibold capitalize truncate">
                {locale === "ar" ? menu.nameAr : menu.nameEn}
              </p>
            </div>
          </>
        )}
      </LinkTo>
      <nav className="flex-1 space-y-8 overflow-y-auto px-4 pb-10">
        {navSectionsData.map((section) => (
          <div key={section.title}>
            <p className="px-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              {t(section.title)}
            </p>
            <div className="mt-3 space-y-1">
              {section.items.map((item) => (
                <LinkTo
                  href={
                    "/dashboard/" +
                    segment + "/" +
                    item.link || ""
                  }
                  key={item.label}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex w-full items-center  justify-between rounded-xl px-3 py-3 text-sm font-semibold transition 
                    
                    ${activeLink(item.link || "") ? "bg-accent-purple text-white shadow" : "text-slate-500  hover:bg-slate-50"}
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="text-xl" />
                    {t(item.label)}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </LinkTo>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">Need more features?</p>
        <p className="text-slate-500">Upgrade your workspace in one click.</p>
      </div>
    </aside>
  );

  return (
    <>
      {sidebarSections(true)}
      <Drawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Menu"
        right={locale === "ar" ? true : false}
      >
        {sidebarSections()}
      </Drawer>
    </>
  );
}
