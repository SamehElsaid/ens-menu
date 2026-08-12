"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import LoadImage from "@/components/ImageLoad";
import { templatesInfo } from "@/modules/TemplateShow/data";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import TemplateDesignCustomizePanel from "@/components/Settings/TemplateDesignCustomizePanel";
import { FiEye, FiSettings, FiChevronDown, FiTool } from "react-icons/fi";
import { HiOutlineHand, HiOutlineColorSwatch } from "react-icons/hi";
import { axiosPatch } from "@/shared/axiosCall";
import type { Menu } from "@/types/Menu";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { FaCheck, FaCrown } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  menuRefFromRouteParam,
  menuDashboardPath,
} from "@/lib/menuDashboardPath";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { isFreePlanUser } from "@/lib/subscription";
import ProUpgradeModal from "@/components/Dashboard/ProUpgradeModal";
import { useCurrentPlanCapabilities } from "@/hooks/useCurrentPlanCapabilities";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardFooter,
  PageShell,
  SectionHeader,
} from "@/components/ui";
import { cn } from "@/lib/cn";

export default function DesignPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const routeParams = useParams<{ menu: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const t = useTranslations("settingsDesignPage");

  const dispatch = useAppDispatch();
  const { menu } = useAppSelector((state) => state.menuData);
  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = !userData || isFreePlanUser(userData);
  const capabilities = useCurrentPlanCapabilities();
  const allowedThemes = capabilities.allowedThemes;
  const canCustomizeDesign = !isFreePlan;
  const subscriptionHref = menuDashboardPath(menu, "subscription");
  const resolvedMenuId =
    menuRefFromRouteParam(routeParams?.menu) ||
    (typeof menu?.uuid === "string" && menu.uuid.length > 0
      ? menu.uuid
      : menu?.id != null
        ? String(menu.id)
        : undefined);
  const templatesForMenu = templatesInfo.filter((template) => {
    if (template.showInPickerOnlyWhenThemeMatches) {
      return menu?.theme === template.id;
    }
    return true;
  });
  const [isLoading, setIsLoading] = useState<boolean | string>(false);
  const customizingSlug = searchParams.get("customize");
  const [customizeLoadingSlug, setCustomizeLoadingSlug] = useState<
    string | null
  >(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    typeof menu?.theme === "string" && menu.theme !== ""
      ? (menu.theme as string)
      : "default",
  );

  useEffect(() => {
    if (menu?.theme) {
      setActiveTemplateId(menu.theme as string);
    }
  }, [menu?.theme]);

  const handleSelectTemplate = async (
    templateId: string,
    options?: { skipLoadingUi?: boolean },
  ): Promise<boolean> => {
    if (!resolvedMenuId) {
      return false;
    }

    if (!allowedThemes.includes(templateId)) {
      setUpgradeModalOpen(true);
      return false;
    }

    const isSwitchingTheme = templateId !== activeTemplateId;

    if (!options?.skipLoadingUi) {
      setIsLoading(templateId);
    }
    try {
      const payload = { theme: templateId };
      const result = await axiosPatch<typeof payload, Menu>(
        `/menus/${resolvedMenuId}`,
        locale,
        payload,
      );

      if (result.status) {
        setActiveTemplateId(templateId);
        if (menu) {
          dispatch(
            SET_ACTIVE_USER({
              ...menu,
              theme: templateId,
            }),
          );
        }

        if (isSwitchingTheme) {
          const newTemplate = templatesInfo.find((t) => t.id === templateId);
          const defaultColors = newTemplate?.defaultColors ??
            newTemplate?.colors ?? ["#9333EA", "#7C3AED"];
          const [primaryColor, secondaryColor] = defaultColors;
          await axiosPatch(`/menus/${resolvedMenuId}/customizations`, locale, {
            primaryColor: primaryColor ?? "#9333EA",
            secondaryColor: secondaryColor ?? primaryColor ?? "#7C3AED",
            backgroundColor: "#ffffff",
            textColor: "#0f172a",
          });
        }

        return true;
      }
      return false;
    } finally {
      if (!options?.skipLoadingUi) {
        setIsLoading(false);
      }
    }
  };

  const handleOpenCustomize = async (template: {
    id: string;
    slug: string;
  }) => {
    if (!canCustomizeDesign) {
      setUpgradeModalOpen(true);
      return;
    }

    if (!resolvedMenuId) {
      toast.error(t("cards.noMenuSelected"));
      return;
    }

    setCustomizeLoadingSlug(template.slug);
    try {
      if (template.id !== activeTemplateId) {
        const activated = await handleSelectTemplate(template.id, {
          skipLoadingUi: true,
        });
        if (!activated) {
          toast.error(t("cards.activateFailed"));
          return;
        }
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("customize", template.slug);
      router.push(`?${params.toString()}`);
    } finally {
      setCustomizeLoadingSlug(null);
    }
  };

  const handleCloseCustomize = () => {
    router.back();
  };

  if (customizingSlug) {
    return (
      <TemplateDesignCustomizePanel
        tempSlug={customizingSlug}
        embedded
        onClose={handleCloseCustomize}
      />
    );
  }

  const scrollToTemplatePicker = () => {
    document
      .getElementById("onboarding-design-templates")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageShell
      kind="wide"
      header={
        <PageTitleWithHelp
          id="onboarding-design-header"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            {
              label: t("breadcrumbs.dashboard"),
              href: menuDashboardPath(menu),
            },
            {
              label: t("breadcrumbs.settings"),
              href: menuDashboardPath(menu, "settings"),
            },
            { label: t("title") },
          ]}
          breadcrumbsLabel={t("title")}
          actions={
            <Button
              type="button"
              id="onboarding-choose-design-cta"
              size="sm"
              onClick={scrollToTemplatePicker}
              startIcon={<HiOutlineColorSwatch aria-hidden />}
              endIcon={<FiChevronDown aria-hidden />}
            >
              {t("headerCta")}
            </Button>
          }
        />
      }
    >
      <Alert tone="info" title={t("tips.title")}>
        <ul className="mt-1 flex list-disc flex-col gap-1 ps-4">
          <li>{t("tips.tip1")}</li>
          <li>{t("tips.tip2")}</li>
          <li>{t("tips.tip3")}</li>
        </ul>
      </Alert>

      <section
        id="onboarding-design-templates"
        aria-label={t("gallery.title")}
        className="flex scroll-mt-24 flex-col gap-3"
      >
        <SectionHeader
          ruled
          eyebrow={t("gallery.eyebrow")}
          title={t("gallery.title")}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {templatesForMenu.map((template, templateIndex) => {
            const isActive = template.id === activeTemplateId;
            const linkView =
              "https://" + template.slug + process.env.NEXT_PUBLIC_MENU_URL;
            const isCustomizeLoading = customizeLoadingSlug === template.slug;
            const isLocked = !allowedThemes.includes(template.id);
            const isSelecting =
              typeof isLoading === "string" && isLoading === template.id;
            const showNew =
              template.isNew &&
              !isActive &&
              !template.isUnderConstruction &&
              !isLocked;
            const showDefault = template.id === "default";
            const showCustomize = Boolean(template.canEdit) && !isLocked;
            const hasStatus =
              isActive ||
              showDefault ||
              showNew ||
              Boolean(template.isUnderConstruction) ||
              isLocked;

            return (
              <Card
                key={template.id}
                as="article"
                padded="none"
                interactive={!isActive}
                active={isActive}
                className="flex h-full min-w-0 flex-col overflow-hidden"
              >
                <div className="relative aspect-4/3 overflow-hidden border-b border-line bg-surface-3">
                  {template.hidePreviewImage ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-surface-3 text-fg-subtle"
                      aria-hidden
                    >
                      <HiOutlineColorSwatch className="text-2xl" />
                    </div>
                  ) : (
                    <LoadImage
                      src={template.image}
                      disableLazy
                      alt={isRTL ? template.nameAr : template.name}
                      className="w-full auto-scroll-image"
                    />
                  )}

                  {/* The lock veils the preview in the panel's own surface
                      colour rather than a black scrim, so the badge on top of
                      it keeps its contrast in both themes. */}
                  {isLocked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface/70 backdrop-blur-[2px]">
                      <Badge
                        tone="warning"
                        size="md"
                        icon={<FaCrown aria-hidden />}
                      >
                        {t("badges.pro")}
                      </Badge>
                    </div>
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
                  {isActive ? (
                    <p className="ui-label mb-1.5">
                      {t("badges.currentTemplate")}
                    </p>
                  ) : null}

                  {hasStatus ? (
                    <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                      {isActive ? (
                        <Badge tone="accent" dot>
                          {t("badges.activeNow")}
                        </Badge>
                      ) : null}
                      {showDefault ? (
                        <Badge>{t("badges.default")}</Badge>
                      ) : null}
                      {showNew ? (
                        <Badge tone="info">{t("badges.new")}</Badge>
                      ) : null}
                      {template.isUnderConstruction ? (
                        <Badge icon={<FiTool aria-hidden />}>
                          {t("badges.underConstruction")}
                        </Badge>
                      ) : null}
                      {isLocked ? (
                        <Badge tone="warning" icon={<FaCrown aria-hidden />}>
                          {t("badges.pro")}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}

                  <h3 className="truncate text-sm font-semibold text-fg">
                    {isRTL ? template.nameAr : template.name}
                  </h3>
                  <p className="mt-1 text-xs text-fg-subtle">
                    {showDefault
                      ? t("cards.defaultHelper")
                      : t("cards.templateHelper")}
                  </p>
                  <p className="mt-2 line-clamp-2 text-start text-xs leading-relaxed text-fg-muted">
                    {isRTL ? template.descriptionAr : template.description}
                  </p>

                  <div className="flex-1" />

                  <CardFooter className="flex-col items-stretch gap-2">
                    <Button
                      type="button"
                      id={
                        templateIndex === 0
                          ? "onboarding-select-template"
                          : undefined
                      }
                      variant={isActive ? "secondary" : "primary"}
                      size="sm"
                      fullWidth
                      loading={isSelecting}
                      disabled={
                        isLocked
                          ? false
                          : typeof isLoading === "string"
                            ? isLoading !== template.id
                            : false
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLocked) {
                          setUpgradeModalOpen(true);
                          return;
                        }
                        handleSelectTemplate(template.id);
                      }}
                      startIcon={
                        isLocked ? (
                          <FaCrown aria-hidden />
                        ) : isActive ? (
                          <FaCheck aria-hidden />
                        ) : (
                          <HiOutlineHand aria-hidden />
                        )
                      }
                    >
                      {isLocked
                        ? t("cards.buttonUpgrade")
                        : isActive
                          ? t("cards.buttonActive")
                          : t("cards.buttonUse")}
                    </Button>

                    <div
                      className={cn(
                        "grid gap-2",
                        showCustomize ? "grid-cols-2" : "grid-cols-1",
                      )}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(linkView, "_blank");
                        }}
                        startIcon={<FiEye aria-hidden />}
                      >
                        {t("cards.preview")}
                      </Button>
                      {showCustomize ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          fullWidth
                          loading={isCustomizeLoading}
                          disabled={Boolean(customizeLoadingSlug)}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleOpenCustomize(template);
                          }}
                          startIcon={<FiSettings aria-hidden />}
                        >
                          {t("cards.customize")}
                        </Button>
                      ) : null}
                    </div>
                  </CardFooter>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <ProUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        subscriptionHref={subscriptionHref}
      />
    </PageShell>
  );
}
