import { FiLogOut, FiSettings } from "react-icons/fi";
import LinkTo from "./Global/LinkTo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { REMOVE_USER } from "@/store/authSlice/authSlice";
import { MdOutlineDashboard } from "react-icons/md";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
function UserDropDown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useLocale();
  const profile = useAppSelector((state) => state.auth);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const userInitial = profile.data?.email?.charAt(0).toUpperCase() ?? "U";
  const userName = profile.data?.name ?? "John Doe";
  const userRole = profile.data?.kind ?? "Admin";
  const profileMenuItems = [
    {
      label: "Dashboard",
      href: profile.data?.kind === "specialist" ? "/specialist/" : "/parent/",
      icon: <MdOutlineDashboard />,
    },
    {
      label: "Settings",
      href:
        profile.data?.kind === "specialist"
          ? "/specialist/personal/settings"
          : "/parent/personal/settings",
      icon: <FiSettings />,
    },
  ];

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const handleLogout = () => {
    Cookies.remove("sub");
    dispatch(REMOVE_USER());
    setIsProfileMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        type="button"
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        className=" flex items-center justify-center w-10 h-10 rounded-full border border-transparent bg-purple-50 dark:bg-purple-500/20 px-2 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 transition-all duration-300 hover:bg-purple-100 dark:hover:bg-purple-500/30 hover:border-purple-200 dark:hover:border-purple-500/40"
      >
        {userInitial.split("").map((char) => (
          <span
            key={char}
            className="text-sm font-bold text-purple-600 dark:text-purple-400"
          >
            {char}
          </span>
        ))}
        <span
          className={`absolute right-0 bottom-0  h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 `}
        />
      </button>

      <div
        className={`absolute ${
          locale === "ar" ? "left-0" : "right-0"
        } mt-2 w-64 rounded-2xl border border-purple-100 dark:border-purple-500/30 bg-white dark:bg-slate-800 shadow-2xl backdrop-blur-xl duration-200 z-[60] ${
          isProfileMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-purple-100 dark:border-purple-500/30 px-4 py-3">
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20 text-base font-bold text-purple-600 dark:text-purple-400">
              {userInitial}
            </span>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {(userName as string) ?? "John Doe"}
            </span>
            <span className="text-xs capitalize text-slate-500 dark:text-slate-400">
              {(userRole as string) ?? "Admin"}
            </span>
          </div>
        </div>

        <div className="flex flex-col px-2 py-2">
          {profileMenuItems.map((item) => (
            <LinkTo
              key={item.label}
              href={item.href}
              onClick={() => setIsProfileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <span className="text-base text-purple-500 dark:text-purple-400">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </LinkTo>
          ))}
        </div>

        <div className="border-t border-purple-100 dark:border-purple-500/30 px-2 py-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 dark:text-red-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-500/20"
          >
            <span className="text-base">
              <FiLogOut />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDropDown;
