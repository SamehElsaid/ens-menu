import type { Config, DriveStep, Driver, PopoverDOM, State } from "driver.js";

const MAX_WAIT_ATTEMPTS = 40;
const WAIT_MS = 200;

const POPOVER_CLASS = "ensmenu-onboarding-popover";

function waitForElement(selector: string): Promise<Element | null> {
  return new Promise((resolve) => {
    let attempts = 0;
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      attempts += 1;
      if (attempts >= MAX_WAIT_ATTEMPTS) {
        resolve(null);
        return;
      }
      setTimeout(tick, WAIT_MS);
    };
    tick();
  });
}

export type OnboardingDriverLabels = {
  next: string;
  prev: string;
  done: string;
  skip: string;
  progress: string;
};

function decoratePopover(
  popover: PopoverDOM,
  state: State,
  config: Config,
  labels: OnboardingDriverLabels,
  onSkip: () => void,
  isRtl: boolean,
): void {
  const steps = config.steps ?? [];
  const current = (state.activeIndex ?? 0) + 1;
  const total = steps.length;

  popover.footer.classList.add("ensmenu-tour-footer");
  if (isRtl) {
    popover.footer.classList.add("ensmenu-tour-footer-rtl");
  }

  let header = popover.wrapper.querySelector(
    ".ensmenu-tour-popover-header",
  ) as HTMLElement | null;

  if (!header) {
    header = document.createElement("div");
    header.className = "ensmenu-tour-popover-header";
    popover.wrapper.insertBefore(header, popover.wrapper.firstChild);
  }

  header.innerHTML = `<span class="ensmenu-tour-step-badge">${current} / ${total}</span>`;

  if (popover.progress) {
    popover.progress.classList.add("ensmenu-tour-progress-hidden");
  }

  let skipBtn = popover.footer.querySelector(
    ".ensmenu-tour-skip-btn",
  ) as HTMLButtonElement | null;

  if (!skipBtn) {
    skipBtn = document.createElement("button");
    skipBtn.type = "button";
    skipBtn.className = "ensmenu-tour-skip-btn";
    popover.footer.insertBefore(skipBtn, popover.footer.firstChild);
  }

  skipBtn.textContent = labels.skip;
  skipBtn.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onSkip();
  };
}

export async function runOnboardingDriver(options: {
  steps: DriveStep[];
  isRtl: boolean;
  labels: OnboardingDriverLabels;
  onSkip: () => void;
  onDestroyed?: () => void;
}): Promise<Driver | null> {
  const firstSelector =
    typeof options.steps[0]?.element === "string"
      ? options.steps[0].element
      : null;

  if (firstSelector) {
    const found = await waitForElement(firstSelector);
    if (!found) return null;
  }

  const { driver } = await import("driver.js");

  const popoverClasses = [
    POPOVER_CLASS,
    options.isRtl ? "driver-popover-rtl" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const driverObj = driver({
    showProgress: true,
    allowClose: false,
    animate: true,
    smoothScroll: true,
    disableActiveInteraction: false,
    stagePadding: 10,
    stageRadius: 12,
    popoverOffset: 12,
    overlayOpacity: 0.5,
    overlayColor: "#0f172a",
    overlayClickBehavior: () => {},
    popoverClass: popoverClasses,
    progressText: options.labels.progress,
    nextBtnText: options.labels.next,
    prevBtnText: options.labels.prev,
    doneBtnText: options.labels.done,
    showButtons: ["previous", "next"],
    disableButtons: ["close"],
    steps: options.steps,
    onPopoverRender: (popover, { state, config, driver }) => {
      decoratePopover(
        popover,
        state,
        config,
        options.labels,
        () => {
          options.onSkip();
          driver.destroy();
        },
        options.isRtl,
      );
    },
    onDestroyed: () => {
      options.onDestroyed?.();
    },
  });

  driverObj.drive();
  return driverObj;
}
