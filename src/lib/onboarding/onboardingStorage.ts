export const ONBOARDING_COMPLETED_KEY = "ensmenu_onboarding_completed";
export const ONBOARDING_PHASE_KEY = "ensmenu_onboarding_phase";
export const ONBOARDING_SEEN_TOURS_KEY = "ensmenu_onboarding_seen_tours";

export type OnboardingPhase =
  | "create-menu"
  | "create-menu-modal"
  | "go-to-menu"
  | "add-item"
  | "go-to-design"
  | "choose-design";

export type OnboardingTourId =
  | "create-menu"
  | "create-menu-modal"
  | "go-to-menu-manage"
  | "menu-overview"
  | "personal-profile"
  | "subscription-plans"
  | "categories-page"
  | "items-page"
  | "tables-page"
  | "staff-page"
  | "settings-page"
  | "settings-media"
  | "settings-design"
  | "advertisements-page"
  | "activity-history-page";

export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}

export function completeOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  localStorage.removeItem(ONBOARDING_PHASE_KEY);
}

export function getSeenTours(): Set<OnboardingTourId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ONBOARDING_SEEN_TOURS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed as OnboardingTourId[]);
  } catch {
    return new Set();
  }
}

export function hasSeenTour(tourId: OnboardingTourId): boolean {
  const seen = getSeenTours();
  if (seen.has(tourId)) return true;
  if (tourId === "settings-design" && seen.has("choose-design" as OnboardingTourId)) {
    return true;
  }
  return false;
}

export function markTourSeen(tourId: OnboardingTourId): void {
  if (typeof window === "undefined") return;
  const seen = getSeenTours();
  seen.add(tourId);
  localStorage.setItem(
    ONBOARDING_SEEN_TOURS_KEY,
    JSON.stringify([...seen]),
  );
}

export function unmarkTourSeen(tourId: OnboardingTourId): void {
  if (typeof window === "undefined") return;
  const seen = getSeenTours();
  seen.delete(tourId);
  seen.delete("choose-design" as OnboardingTourId);
  localStorage.setItem(
    ONBOARDING_SEEN_TOURS_KEY,
    JSON.stringify([...seen]),
  );
}

export function restartTourForPage(tourId: OnboardingTourId): void {
  if (typeof window === "undefined") return;
  unmarkTourSeen(tourId);
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
}

export function getOnboardingPhase(): OnboardingPhase | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(ONBOARDING_PHASE_KEY);
  if (
    value === "create-menu" ||
    value === "create-menu-modal" ||
    value === "go-to-menu" ||
    value === "add-item" ||
    value === "go-to-design" ||
    value === "choose-design"
  ) {
    return value;
  }
  return null;
}

export function setOnboardingPhase(phase: OnboardingPhase): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_PHASE_KEY, phase);
}

export function ensureOnboardingStarted(): OnboardingPhase {
  const existing = getOnboardingPhase();
  if (existing) return existing;
  setOnboardingPhase("create-menu");
  return "create-menu";
}

export const ONBOARDING_RESTART_EVENT = "ensmenu-onboarding-restart";
export const ONBOARDING_REFRESH_EVENT = "ensmenu-onboarding-refresh";

export type OnboardingRestartDetail = { tourId: OnboardingTourId };

export function restartOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  localStorage.removeItem(ONBOARDING_SEEN_TOURS_KEY);
  setOnboardingPhase("create-menu");
}

export function clearSeenTours(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_SEEN_TOURS_KEY);
}
