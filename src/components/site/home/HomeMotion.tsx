"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Home page motion director.
 *
 * One coordinated GSAP system for the marketing home — cinematic entrance,
 * pinned paper→phone scroll story, and section continuity. CSS view-timeline
 * reveals remain as progressive enhancement; when this mounts on a capable
 * desktop they are overridden so the choreography owns the clock.
 *
 * Mobile gets a dedicated lighter path (no pin, shorter entrance, depth cards
 * only). Reduced motion: this component no-ops entirely.
 */

const DESKTOP_MQ = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

function q<T extends Element>(root: ParentNode, sel: string) {
  return root.querySelector(sel) as T | null;
}

function qa<T extends Element>(root: ParentNode, sel: string) {
  return Array.from(root.querySelectorAll(sel)) as T[];
}

export default function HomeMotion() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;

    const desktop = window.matchMedia(DESKTOP_MQ).matches;
    /* Set early so CSS can kill competing s-enter / s-reveal before GSAP loads. */
    document.documentElement.dataset.homeMotion = desktop
      ? "desktop"
      : "mobile";

    let killed = false;
    let ctx: { revert: () => void } | null = null;

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const hero = q<HTMLElement>(document, "#hero");
        if (!hero) return;

        /* ------------------------------------------------------------------ */
        /* 1. Cinematic entrance                                              */
        /* ------------------------------------------------------------------ */
        const eyebrow = q(hero, "[data-home='eyebrow']");
        const title = q(hero, "[data-home='title']");
        const titleAccent = q(hero, "[data-home='title-accent']");
        const lead = q(hero, "[data-home='lead']");
        const ctas = q(hero, "[data-home='ctas']");
        const paper = q(hero, "[data-home='paper']");
        const phone = q(hero, "[data-home='phone']");
        const badge = q(hero, "[data-home='badge']");
        const afterLabel = q(hero, "[data-home='after-label']");
        const assurances = qa(hero, "[data-home='assurance']");
        const dishRows = qa(hero, "[data-home='dish-row']");
        const aurora = q<HTMLElement>(hero, ".s-aurora");
        const seam = q(hero, ".s-home-seam");

        const enter = gsap.timeline({
          defaults: { ease: "power3.out" },
          /* Sit behind the Prism glass arrival so type never leads the light. */
          delay: desktop ? 0.22 : 0.12,
        });

        /* Aurora is owned by PrismStage during the WebGL handoff. HomeMotion
           only settles it during the pin scrub below. */

        if (eyebrow) {
          gsap.set(eyebrow, { autoAlpha: 0, y: 14 });
          enter.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.15);
        }

        if (title) {
          /* Clip reveal — opacity stays 1 for LCP; motion is the mask. */
          gsap.set(title, {
            clipPath: "inset(0 0 100% 0)",
            y: 22,
          });
          enter.to(
            title,
            {
              clipPath: "inset(0 0 0% 0)",
              y: 0,
              duration: 1.05,
              ease: "power4.out",
            },
            0.28,
          );
        }

        if (titleAccent) {
          gsap.set(titleAccent, {
            backgroundSize: "0% 100%",
            backgroundPosition: document.dir === "rtl" ? "100% 0" : "0% 0",
          });
          enter.to(
            titleAccent,
            {
              backgroundSize: "100% 100%",
              duration: 0.95,
              ease: "power2.out",
            },
            0.55,
          );
        }

        if (lead) {
          gsap.set(lead, { autoAlpha: 0, y: 18 });
          enter.to(lead, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.48);
        }

        if (ctas) {
          gsap.set(ctas, { autoAlpha: 0, y: 16 });
          enter.to(ctas, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.62);
        }

        if (afterLabel) {
          gsap.set(afterLabel, { autoAlpha: 0, y: 10 });
          enter.to(afterLabel, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.55);
        }

        if (phone) {
          gsap.set(phone, {
            autoAlpha: 1,
            y: desktop ? 48 : 28,
            rotateY: desktop ? (document.dir === "rtl" ? -8 : 8) : 0,
            transformPerspective: 900,
          });
          enter.to(
            phone,
            {
              y: 0,
              rotateY: 0,
              duration: 1.05,
              ease: "power3.out",
            },
            0.4,
          );
        }

        if (paper && desktop) {
          gsap.set(paper, {
            autoAlpha: 0,
            x: document.dir === "rtl" ? 36 : -36,
            rotate: document.dir === "rtl" ? 4 : -4,
            scale: 0.94,
          });
          enter.to(
            paper,
            {
              autoAlpha: 1,
              x: 0,
              rotate: 0,
              scale: 1,
              duration: 0.95,
              ease: "power3.out",
            },
            0.55,
          );
        }

        if (badge && desktop) {
          gsap.set(badge, { autoAlpha: 0, scale: 0.55 });
          enter.to(
            badge,
            { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
            0.85,
          );
        }

        if (dishRows.length) {
          gsap.set(dishRows, { autoAlpha: 0, y: 10 });
          enter.to(
            dishRows,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.07,
              ease: "power2.out",
            },
            0.85,
          );
        }

        if (assurances.length) {
          gsap.set(assurances, { autoAlpha: 0, y: 16 });
          enter.to(
            assurances,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
            },
            1.05,
          );
        }

        /* ------------------------------------------------------------------ */
        /* 2. Desktop pin — paper becomes phone                               */
        /* ------------------------------------------------------------------ */
        if (desktop && paper && phone) {
          const pinTarget = q<HTMLElement>(hero, "[data-home='proof']");
          const story = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "+=130%",
              pin: true,
              pinSpacing: true,
              scrub: 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          story
            .to(
              paper,
              {
                autoAlpha: 0.2,
                scale: 0.88,
                y: -28,
                filter: "saturate(0.35)",
                duration: 1,
                ease: "none",
              },
              0,
            )
            .to(
              badge,
              {
                scale: 1.25,
                autoAlpha: 0,
                duration: 0.45,
                ease: "none",
              },
              0.25,
            )
            .to(
              phone,
              {
                y: -18,
                scale: 1.06,
                boxShadow:
                  "0 32px 80px -20px color-mix(in oklab, var(--s-brand) 45%, transparent)",
                duration: 1,
                ease: "none",
              },
              0.15,
            );

          if (dishRows.length) {
            story.fromTo(
              dishRows,
              { autoAlpha: 0.35, x: document.dir === "rtl" ? -8 : 8 },
              {
                autoAlpha: 1,
                x: 0,
                stagger: 0.12,
                duration: 0.5,
                ease: "none",
              },
              0.4,
            );
          }

          if (pinTarget) {
            /* Keep TypeScript happy — pin is the hero section itself. */
            void pinTarget;
          }

          /* Aurora settles into the seam as the pin releases. */
          if (aurora) {
            story.to(
              aurora,
              { "--s-aurora-opacity": 0.4, duration: 0.6, ease: "none" },
              0.7,
            );
          }

          if (seam) {
            story.fromTo(
              seam,
              { scaleX: 0.2, autoAlpha: 0.2 },
              { scaleX: 1, autoAlpha: 1, duration: 0.5, ease: "none" },
              0.75,
            );
          }
        }

        /* ------------------------------------------------------------------ */
        /* 3. Section continuity — depth enters, not fade-ins                 */
        /* ------------------------------------------------------------------ */
        const sections = qa<HTMLElement>(
          document,
          "[data-home-section]",
        );

        sections.forEach((section) => {
          const kind = section.dataset.homeSection;
          const heading = q(section, "[data-home='section-heading']");
          const cards = qa(section, "[data-home='card']");
          const steps = qa(section, "[data-home='step']");
          const media = qa(section, "[data-home='media']");

          if (heading) {
            gsap.from(heading, {
              autoAlpha: 0,
              y: desktop ? 36 : 20,
              duration: desktop ? 0.9 : 0.55,
              ease: "power3.out",
              scrollTrigger: {
                trigger: heading,
                start: "top 82%",
                once: true,
              },
            });
          }

          if (kind === "how" && steps.length) {
            steps.forEach((step, i) => {
              const medallion = q(step, "[data-home='step-mark']");
              const line = q(step, "[data-home='step-line']");
              const body = q(step, "[data-home='step-body']");

              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: step,
                  start: "top 78%",
                  end: "top 40%",
                  toggleActions: "play none none reverse",
                },
              });

              if (medallion) {
                tl.fromTo(
                  medallion,
                  { scale: 0.7, autoAlpha: 0.4 },
                  {
                    scale: 1,
                    autoAlpha: 1,
                    duration: 0.45,
                    ease: "power2.out",
                  },
                  0,
                );
              }
              if (body) {
                tl.fromTo(
                  body,
                  { autoAlpha: 0, x: document.dir === "rtl" ? -18 : 18 },
                  {
                    autoAlpha: 1,
                    x: 0,
                    duration: 0.55,
                    ease: "power3.out",
                  },
                  0.08,
                );
              }
              if (line) {
                gsap.fromTo(
                  line,
                  { scaleY: 0, transformOrigin: "top center" },
                  {
                    scaleY: 1,
                    duration: 0.7,
                    ease: "power2.out",
                    scrollTrigger: {
                      trigger: step,
                      start: "top 70%",
                      end: "bottom 55%",
                      scrub: 0.4,
                    },
                  },
                );
              }

              /* Active step glow while in the middle of the viewport. */
              if (medallion && desktop) {
                ScrollTrigger.create({
                  trigger: step,
                  start: "top 55%",
                  end: "bottom 45%",
                  onEnter: () => medallion.classList.add("s-step-live"),
                  onEnterBack: () => medallion.classList.add("s-step-live"),
                  onLeave: () => medallion.classList.remove("s-step-live"),
                  onLeaveBack: () => medallion.classList.remove("s-step-live"),
                });
              }

              void i;
            });
          }

          if (cards.length) {
            gsap.from(cards, {
              autoAlpha: 0,
              y: desktop ? 48 : 24,
              rotateX: desktop ? 10 : 0,
              scale: desktop ? 0.94 : 0.98,
              transformOrigin: "50% 100%",
              transformPerspective: 1100,
              duration: desktop ? 0.85 : 0.5,
              stagger: desktop ? 0.09 : 0.06,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 72%",
                once: true,
              },
            });
          }

          if (kind === "showcase" && media.length && desktop) {
            media.forEach((el) => {
              gsap.fromTo(
                el,
                { scale: 1.12, yPercent: 8 },
                {
                  scale: 1,
                  yPercent: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    end: "top 30%",
                    scrub: 0.5,
                  },
                },
              );
            });
          }

          if (kind === "plans") {
            const pro = q(section, "[data-home='plan-pro']");
            const free = q(section, "[data-home='plan-free']");
            if (pro && free && desktop) {
              gsap.from(free, {
                autoAlpha: 0,
                x: -28,
                duration: 0.75,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: free,
                  start: "top 80%",
                  once: true,
                },
              });
              gsap.from(pro, {
                autoAlpha: 0,
                x: 28,
                scale: 0.96,
                duration: 0.85,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: pro,
                  start: "top 80%",
                  once: true,
                },
              });
              gsap.to(pro, {
                scale: 1.02,
                ease: "none",
                scrollTrigger: {
                  trigger: pro,
                  start: "top 70%",
                  end: "top 35%",
                  scrub: 0.4,
                },
              });
            }
          }

          if (kind === "faq") {
            const panel = q(section, "[data-home='faq-panel']");
            if (panel) {
              gsap.from(panel, {
                autoAlpha: 0,
                y: desktop ? 32 : 18,
                duration: desktop ? 0.75 : 0.5,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 82%",
                  once: true,
                },
              });
            }
          }

          if (kind === "cta") {
            const band = q(section, "[data-home='cta-band']") ?? section;
            const copy = q(band, "h2");
            const leadCopy = q(band, "p");
            const actions = q(band, "[data-home='cta-actions']");
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: band,
                start: "top 82%",
                once: true,
              },
            });
            if (copy) {
              tl.from(
                copy,
                {
                  autoAlpha: 0,
                  y: desktop ? 40 : 24,
                  duration: 0.85,
                  ease: "power3.out",
                },
                0,
              );
            }
            if (leadCopy) {
              tl.from(
                leadCopy,
                {
                  autoAlpha: 0,
                  y: 18,
                  duration: 0.65,
                  ease: "power2.out",
                },
                0.1,
              );
            }
            if (actions) {
              tl.from(
                actions,
                {
                  autoAlpha: 0,
                  y: 22,
                  duration: 0.7,
                  ease: "power3.out",
                },
                0.2,
              );
            }
          }
        });

        /* Logo strip: soft handoff from hero seam. */
        const logos = q<HTMLElement>(document, "[data-home-section='logos']");
        if (logos) {
          gsap.from(logos, {
            autoAlpha: 0,
            y: 20,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: logos,
              start: "top 90%",
              once: true,
            },
          });
        }

        ScrollTrigger.refresh();
      });
    });

    return () => {
      killed = true;
      ctx?.revert();
      delete document.documentElement.dataset.homeMotion;
    };
  }, [reduced]);

  return null;
}
