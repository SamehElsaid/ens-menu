import { FiLogOut } from "react-icons/fi";
import LinkTo from "./Global/LinkTo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useMemo, useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import Loader from "./Global/Loader";
import { decryptData } from "@/shared/encryption";
import { REMOVE_USER } from "@/store/authSlice/authSlice";
import { MdOutlineDashboard } from "react-icons/md";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import LoadImage from "./ImageLoad";
import { IoRestaurantOutline } from "react-icons/io5";
import { useDashboardSession } from "@/hooks/useDashboardSession";
import { axiosPost } from "@/shared/axiosCall";
import {
  finalizeFcmLogout,
  resolveFcmTokenForLogout,
} from "@/shared/syncFcmToken";
import { publicMenuLinkUrl } from "@/lib/publicMenuUrl";
import {
  Menu,
  MenuItem,
  MenuItemBody,
  MenuSeparator,
  focusRing,
  menuItemClasses,
} from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Account menu in the dashboard header.
 *
 * Built on the `Menu` primitive, which owns the elevation, the outside-click
 * and Escape dismissal and the arrow-key walk — this was previously a panel
 * toggled by opacity, so it stayed in the tab order while invisible and had no
 * keyboard route through its rows.
 *
 * The identity block is a header inside the panel rather than a tinted card of
 * its own: the name is the only thing set in UI weight and the role sits under
 * it as a quiet label, so the panel reads as one list with a heading instead of
 * two stacked surfaces. The "online" dot is gone — it was always green and
 * reported nothing.
 *
 * The two destination rows keep `LinkTo`, because it carries the locale prefix
 * and the same-route guard the header depends on; they take the row recipe from
 * the primitive so they are identical to the rows that do not.
 */
function UserDropDown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const session = useDashboardSession();
  const menu = useAppSelector((s) => s.menuData.menu);
  const menuSlug = menu?.slug;
  const profile = useAppSelector((state) => state.auth) as unknown as {
    data: {
      user: { email: string; name: string; role: string; profileImage: string };
    };
  };
  const t = useTranslations();
  const userInitial = profile.data?.user?.email?.charAt(0).toUpperCase() ?? "U";
  const userName = profile.data?.user?.name ?? "John Doe";
  const isStaff = session?.role === "staff";
  const userRole =
    isStaff && session?.roleName
      ? session.roleName
      : profile.data?.user?.role
        ? t("roles." + profile.data?.user?.role)
        : t("roles.admin");

  const publicMenuUrl = publicMenuLinkUrl(menuSlug);
  const isDashboardMenuRoute = /^\/dashboard\/[^/]+/.test(pathname);
  const showRestaurantLink = isDashboardMenuRoute && Boolean(publicMenuUrl);

  const profileMenuItems = useMemo(() => {
    const items: {
      label: string;
      href: string;
      icon: ReactNode;
      external?: boolean;
    }[] = [];

    // Staff and owners share the account dashboard; only admins go elsewhere.
    items.push({
      label: t("userProfile.dashboard"),
      href:
        !isStaff && profile.data?.user?.role === "admin"
          ? "/admin"
          : "/dashboard",
      icon: <MdOutlineDashboard />,
    });

    if (showRestaurantLink) {
      items.push({
        label: t("userProfile.restaurantMenu"),
        href: publicMenuUrl,
        icon: <IoRestaurantOutline />,
        external: true,
      });
    }

    return items;
  }, [isStaff, profile.data?.user?.role, publicMenuUrl, showRestaurantLink, t]);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsProfileMenuOpen(false);
    const sub = Cookies.get("sub");
    if (sub) {
      try {
        const decrypted = decryptData(sub) as { refreshToken?: string };
        const fcmToken = await resolveFcmTokenForLogout();
        await axiosPost("/auth/logout", locale, {
          refreshToken: decrypted?.refreshToken ?? "",
          ...(fcmToken ? { fcmToken } : {}),
        });
        await finalizeFcmLogout(locale, fcmToken);
      } catch {
        // logout locally even if the API call fails
        await finalizeFcmLogout(locale, null);
      }
    } else {
      await finalizeFcmLogout(locale, null);
    }
    Cookies.remove("sub");
    dispatch(REMOVE_USER());
    router.push("/");
  };

  const avatar = (box: string) =>
    profile.data?.user?.profileImage ? (
      <LoadImage
        src={profile.data?.user?.profileImage as string}
        alt=""
        width={150}
        height={150}
        className={cn(box, "object-cover")}
      />
    ) : (
      <span className="text-[13px] font-semibold text-brand-soft-fg">
        {userInitial}
      </span>
    );

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-app">
          <Loader />
        </div>
      )}

      <Menu
        label={userName as string}
        align="end"
        open={isProfileMenuOpen}
        onOpenChange={setIsProfileMenuOpen}
        panelClassName="w-60"
        trigger={(props) => (
          <button
            {...props}
            type="button"
            aria-label={userName as string}
            className={cn(
              "flex size-8 items-center justify-center overflow-hidden rounded-full border border-brand-line bg-brand-soft uppercase row-settle",
              "hover:border-brand hover:bg-brand-soft-hover",
              focusRing,
            )}
          >
            {avatar("size-8")}
          </button>
        )}
      >
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-2">
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-line bg-brand-soft uppercase">
            {avatar("size-9")}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-semibold text-fg">
              {(userName as string) ?? "John Doe"}
            </span>
            <span className="ui-label truncate">
              {(userRole as string) ?? "Admin"}
            </span>
          </span>
        </div>

        <MenuSeparator />

        {profileMenuItems.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setIsProfileMenuOpen(false)}
              className={menuItemClasses()}
            >
              <MenuItemBody icon={item.icon}>{item.label}</MenuItemBody>
            </a>
          ) : (
            <LinkTo
              key={item.label}
              href={item.href}
              role="menuitem"
              onClick={() => setIsProfileMenuOpen(false)}
              className={menuItemClasses()}
            >
              <MenuItemBody icon={item.icon}>{item.label}</MenuItemBody>
            </LinkTo>
          ),
        )}

        <MenuSeparator />

        <MenuItem tone="danger" icon={<FiLogOut />} onClick={handleLogout}>
          {t("userProfile.singOut")}
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserDropDown;
