import type { DriveStep } from "driver.js";
import type { OnboardingPhase, OnboardingTourId } from "./onboardingStorage";

type OnboardingT = (key: string) => string;

function isDashboardRoot(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.endsWith("/dashboard");
}

function isMenuOverview(pathname: string): boolean {
  return /^\/dashboard\/[^/]+$/.test(pathname);
}

function isDesignCustomize(pathname: string): boolean {
  return /\/dashboard\/[^/]+\/settings\/design\/[^/]+/.test(pathname);
}

function isDesignPicker(pathname: string): boolean {
  return /\/dashboard\/[^/]+\/settings\/design\/?$/.test(pathname);
}

function isSettingsMedia(pathname: string): boolean {
  return pathname.includes("/settings/media");
}

function isSettingsRoot(pathname: string): boolean {
  return /\/dashboard\/[^/]+\/settings\/?$/.test(pathname);
}

export type PageTour = {
  tourId: OnboardingTourId;
  phase: OnboardingPhase;
};

/** Tour for the current page only (independent per screen). */
export function resolveTourForPage(pathname: string): PageTour | null {
  if (isDesignCustomize(pathname)) {
    return null;
  }

  if (isDesignPicker(pathname)) {
    return { tourId: "settings-design", phase: "choose-design" };
  }

  if (pathname.includes("/subscription")) {
    return { tourId: "subscription-plans", phase: "go-to-menu" };
  }

  if (pathname.includes("/personal")) {
    return { tourId: "personal-profile", phase: "go-to-menu" };
  }

  if (isSettingsMedia(pathname)) {
    return { tourId: "settings-media", phase: "go-to-design" };
  }

  if (isSettingsRoot(pathname)) {
    return { tourId: "settings-page", phase: "go-to-design" };
  }

  if (pathname.includes("/categories")) {
    return { tourId: "categories-page", phase: "go-to-menu" };
  }

  if (pathname.includes("/items")) {
    return { tourId: "items-page", phase: "add-item" };
  }

  if (pathname.includes("/table")) {
    return { tourId: "tables-page", phase: "go-to-menu" };
  }

  if (pathname.includes("/staff")) {
    return { tourId: "staff-page", phase: "go-to-menu" };
  }

  if (pathname.includes("/advertisements")) {
    return { tourId: "advertisements-page", phase: "go-to-menu" };
  }

  if (pathname.includes("/history")) {
    return { tourId: "activity-history-page", phase: "go-to-menu" };
  }

  if (isMenuOverview(pathname)) {
    return { tourId: "menu-overview", phase: "go-to-menu" };
  }

  if (isDashboardRoot(pathname)) {
    if (typeof document !== "undefined") {
      if (document.getElementById("onboarding-create-menu-modal")) {
        return { tourId: "create-menu-modal", phase: "create-menu-modal" };
      }
      if (document.getElementById("onboarding-manage-menu")) {
        return { tourId: "go-to-menu-manage", phase: "go-to-menu" };
      }
    }
    return { tourId: "create-menu", phase: "create-menu" };
  }

  return null;
}

function pageSteps(
  t: OnboardingT,
  translationKey: string,
  elementSlug: string,
  sections: readonly string[],
): DriveStep[] {
  return sections.map((section) => ({
    element: `#onboarding-${elementSlug}-${section}`,
    popover: {
      title: t(`steps.${translationKey}.${section}.title`),
      description: t(`steps.${translationKey}.${section}.description`),
      side: section === "header" ? "bottom" : "top",
      align: "start" as const,
    },
  }));
}

export function buildOnboardingStepsForTour(
  tourId: OnboardingTourId,
  t: OnboardingT,
  options?: { isRtl?: boolean },
): DriveStep[] {
  const isRtl = options?.isRtl ?? false;
  switch (tourId) {
    case "create-menu":
      return [
        {
          element: "#onboarding-create-menu",
          popover: {
            title: t("steps.createMenu.title"),
            description: t("steps.createMenu.description"),
            side: "bottom",
            align: "center",
          },
        },
      ];
    case "create-menu-modal":
      return [
        {
          element: "#onboarding-create-menu-modal",
          popover: {
            title: t("steps.createMenuForm.title"),
            description: t("steps.createMenuForm.description"),
            side: "left",
            align: "start",
          },
        },
        {
          element: "#onboarding-create-actions",
          popover: {
            title: t("steps.createMenuSubmit.title"),
            description: t("steps.createMenuSubmit.description"),
            side: isRtl ? "right" : "left",
            align: "end",
          },
        },
      ];
    case "go-to-menu-manage":
      return [
        {
          element: "#onboarding-manage-menu",
          popover: {
            title: t("steps.manageMenu.title"),
            description: t("steps.manageMenu.description"),
            side: "top",
            align: "center",
          },
        },
      ];
    case "subscription-plans":
      return [
        {
          element: "#onboarding-subscription-plans",
          popover: {
            title: t("steps.subscriptionPlans.title"),
            description: t("steps.subscriptionPlans.description"),
            side: "top",
            align: "start",
          },
        },
      ];
    case "personal-profile":
      return [
        {
          element: "#onboarding-personal-header",
          popover: {
            title: t("steps.personalProfile.header.title"),
            description: t("steps.personalProfile.header.description"),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#onboarding-personal-info",
          popover: {
            title: t("steps.personalProfile.personalInfo.title"),
            description: t("steps.personalProfile.personalInfo.description"),
            side: "top",
            align: "start",
          },
        },
        {
          element: "#onboarding-personal-password",
          popover: {
            title: t("steps.personalProfile.password.title"),
            description: t("steps.personalProfile.password.description"),
            side: "top",
            align: "start",
          },
        },
        {
          element: "#onboarding-personal-subscription-link",
          popover: {
            title: t("steps.personalProfile.subscription.title"),
            description: t("steps.personalProfile.subscription.description"),
            side: "top",
            align: "center",
          },
        },
      ];
    case "menu-overview":
      return [
        {
          element: "#onboarding-overview-header",
          popover: {
            title: t("steps.menuOverview.header.title"),
            description: t("steps.menuOverview.header.description"),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#onboarding-overview-nav",
          popover: {
            title: t("steps.menuOverview.nav.title"),
            description: t("steps.menuOverview.nav.description"),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#onboarding-overview-stats",
          popover: {
            title: t("steps.menuOverview.stats.title"),
            description: t("steps.menuOverview.stats.description"),
            side: "top",
            align: "center",
          },
        },
        {
          element: "#onboarding-overview-qr",
          popover: {
            title: t("steps.menuOverview.qr.title"),
            description: t("steps.menuOverview.qr.description"),
            side: "right",
            align: "center",
          },
        },
        {
          element: "#onboarding-overview-quick-actions",
          popover: {
            title: t("steps.menuOverview.quickActions.title"),
            description: t("steps.menuOverview.quickActions.description"),
            side: "left",
            align: "start",
          },
        },
        {
          element: "#onboarding-overview-activity",
          popover: {
            title: t("steps.menuOverview.activity.title"),
            description: t("steps.menuOverview.activity.description"),
            side: "top",
            align: "center",
          },
        },
      ];
    case "categories-page":
      return pageSteps(t, "categoriesPage", "categories", [
        "header",
        "actions",
        "table",
      ]);
    case "items-page":
      return pageSteps(t, "itemsPage", "items", [
        "header",
        "filters",
        "table",
        "add",
      ]).map((step, i) =>
        i === 3
          ? { ...step, element: "#onboarding-add-item", popover: { ...step.popover!, side: "bottom", align: "end" } }
          : step,
      );
    case "tables-page":
      return [
        {
          element: "#onboarding-tables-upgrade",
          popover: {
            title: t("steps.tablesPage.upgrade.title"),
            description: t("steps.tablesPage.upgrade.description"),
            side: "bottom",
            align: "center",
          },
        },
        ...pageSteps(t, "tablesPage", "tables", ["header", "actions", "table"]),
      ];
    case "staff-page":
      return [
        {
          element: "#onboarding-staff-upgrade",
          popover: {
            title: t("steps.staffPage.upgrade.title"),
            description: t("steps.staffPage.upgrade.description"),
            side: "bottom",
            align: "center",
          },
        },
        ...pageSteps(t, "staffPage", "staff", ["header", "actions", "table"]),
      ];
    case "advertisements-page":
      return [
        {
          element: "#onboarding-ads-upgrade",
          popover: {
            title: t("steps.advertisementsPage.upgrade.title"),
            description: t("steps.advertisementsPage.upgrade.description"),
            side: "bottom",
            align: "center",
          },
        },
        ...pageSteps(t, "advertisementsPage", "advertisements", [
          "header",
          "actions",
          "table",
        ]),
      ];
    case "activity-history-page":
      return pageSteps(t, "activityHistoryPage", "history", [
        "header",
        "search",
        "table",
      ]);
    case "settings-page":
      return pageSteps(t, "settingsPage", "settings", [
        "general",
        "branding",
        "status",
        "save",
      ]);
    case "settings-media":
      return pageSteps(t, "settingsMedia", "media", [
        "header",
        "social",
        "contact",
        "hours",
      ]);
    case "settings-design":
      return pageSteps(t, "settingsDesign", "design", ["header", "templates"]);
    default:
      return [];
  }
}

/** Skip steps whose target is not in the DOM (e.g. cashier-only hidden sections). */
export function filterStepsWithElements(steps: DriveStep[]): DriveStep[] {
  if (typeof document === "undefined") return steps;
  return steps.filter((step) => {
    const selector =
      typeof step.element === "string" ? step.element : undefined;
    if (!selector) return true;
    return Boolean(document.querySelector(selector));
  });
}
