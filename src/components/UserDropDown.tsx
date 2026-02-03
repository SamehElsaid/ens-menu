import { FiLogOut, FiSettings } from "react-icons/fi";
import LinkTo from "./Global/LinkTo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { REMOVE_USER } from "@/store/authSlice/authSlice";
import { MdOutlineDashboard } from "react-icons/md";
import { useRouter } from "@/i18n/navigation";
function UserDropDown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const profile = useAppSelector((state) => state.auth);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const userInitial = profile.data?.email?.charAt(0).toUpperCase() ?? "U";
  const userName = profile.data?.name ?? "John Doe";
  const userRole = profile.data?.kind ?? "Admin";
  const profileMenuItems = [
    { label: "Dashboard", href: "/specialist/", icon: <MdOutlineDashboard  /> },
    {
      label: "Settings",
      href: "/specialist/personal/settings",
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
        className="flex bg-primary/10 items-center w-10 h-10 justify-center rounded-full border border-transparent px-2 py-1 text-sm font-medium text-primary transition hover:border-secondary hover:text-secondary"
      >
        {userInitial.split("").map((char) => (
          <span key={char} className="text-sm font-medium text-primary">
            {char}
          </span>
        ))}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      </button>

      <div
        className={` ${
          isProfileMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        } absolute right-0 mt-2 w-64 rounded-2xl duration-200 border border-slate-100 bg-white shadow-2xl`}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-base font-semibold text-secondary">
              {userInitial}
            </span>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              {(userName as string) ?? "John Doe"}
            </span>
            <span className="text-xs capitalize text-slate-500">
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
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <span className="text-base text-slate-500">{item.icon}</span>
              <span>{item.label}</span>
            </LinkTo>
          ))}
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
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
