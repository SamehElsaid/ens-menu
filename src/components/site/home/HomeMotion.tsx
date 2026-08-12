"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Home page motion director.
 *
 * One clock per moment, one vocabulary for the whole page. The thesis is the
 * design language's own (`DESIGN.md` §1, `MOTION-BLUEPRINT.md` §2): *light
 * moves, glass does not*. So nothing here flies in from the side — content
 * arrives by being lit, the light travels down the page, and the one object
 * that genuinely travels is the phone (owned by `StoryPhone`, not this file).
 *
 * What lives here:
 *   1. the hero entrance, in three waves of decreasing weight;
 *   2. the hero exit — an unpinned scrub that hands the paper menu, the light
 *      and the composition over to the story section;
 *   3. one reveal grammar per section, deliberately different per section so
 *      the page never reads as the same fade repeated seven times.
 *
 * What is deliberately absent: `pin`. Pinning the hero was the previous
 * implementation's largest structural risk (a spacer, shifted measurements for
 * every later trigger, and a fight with hash navigation) and the travelling
 * phone gets a better result without it.
 *
 * Reduced motion: this component no-ops, and the CSS progressive path
 * (`s-enter*`, `s-reveal*`) is what runs instead.
 */

const DESKTOP_MQ = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

/** The motion language. Every duration, ease and stagger on this page comes
 *  from here, which is what makes seven sections feel like one composition. */
const M = {
  ease: {
    /** Content arriving. */
    enter: "power3.out",
    /** The heaviest arrivals — display type, the hero. */
    arrive: "power4.out",
    /** Small settles. */
    settle: "power2.out",
    /** Anything leaving. */
    exit: "power2.in",
    /** Badges and marks only, never type. */
    pop: "back.out(1.7)",
  },
  dur: {
    mark: 0.42,
    settle: 0.5,
    reveal: 0.62,
    story: 0.9,
    display: 1.05,
  },
  stagger: {
    tight: 0.03,
    standard: 0.06,
    editorial: 0.09,
  },
  /** Reveal distance. Block axis only, so RTL needs no mirrored rule. */
  rise: { desktop: 34, mobile: 18 },
  /** Scrub smoothing — the page's single "scroll feel" constant. */
  scrub: { desktop: 0.55, mobile: 0.3 },
} as const;

function q<T extends Element>(root: ParentNode, sel: string) {
  return root.querySelector(sel) as T | null;
}

function qa<T extends Element>(root: ParentNode, sel: string) {
  return Array.from(root.querySelectorAll(sel)) as T[];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function HomeMotion() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;

    const desktop = window.matchMedia(DESKTOP_MQ).matches;
    const rtl = document.dir === "rtl";
    const sign = rtl ? -1 : 1;
    const rise = desktop ? M.rise.desktop : M.rise.mobile;
    const scrub = desktop ? M.scrub.desktop : M.scrub.mobile;

    document.documentElement.dataset.homeMotion = desktop
      ? "desktop"
      : "mobile";

    let killed = false;
    let ctx: { revert: () => void } | null = null;
    const cleanups: Array<() => void> = [];

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      /**
       * Word-level split for display headings.
       *
       * Words, never characters: splitting characters breaks Arabic shaping,
       * and even at word level this only runs on desktop and only on headings
       * that are a single text node — a heading carrying markup is left alone.
       * The original HTML is restored on teardown.
       */
      const splitWords = (el: HTMLElement | null) => {
        if (!el || !desktop) return null;
        if (el.children.length > 0) return null;
        const text = el.textContent ?? "";
        const words = text.trim().split(/\s+/);
        if (words.length < 2 || words.length > 24) return null;

        const original = el.innerHTML;
        el.innerHTML = words
          .map(
            (word) =>
              `<span data-word style="display:inline-block">${escapeHtml(word)}</span>`,
          )
          .join(" ");
        cleanups.push(() => {
          el.innerHTML = original;
        });
        return qa<HTMLElement>(el, "[data-word]");
      };

      ctx = gsap.context(() => {
        /* ================================================================== */
        /* 1. Hero — the opening                                              */
        /* ================================================================== */

        const hero = q<HTMLElement>(document, "#hero");
        if (!hero) return;

        const copy = q(hero, "[data-home='copy']");
        const eyebrow = q(hero, "[data-home='eyebrow']");
        const title = q<HTMLElement>(hero, "[data-home='title']");
        const titleAccent = q(hero, "[data-home='title-accent']");
        const lead = q(hero, "[data-home='lead']");
        const ctas = q<HTMLElement>(hero, "[data-home='ctas']");
        const paper = q(hero, "[data-home='paper']");
        const phone = q(hero, "[data-home='phone']");
        const phoneGlow = q(hero, "[data-home='phone-glow']");
        const badge = q(hero, "[data-home='badge']");
        const afterLabel = q(hero, "[data-home='after-label']");
        const pulse = q(hero, "[data-home='pulse']");
        const streak = q(hero, "[data-home='streak']");
        const proof = q<HTMLElement>(hero, "[data-home='proof']");
        const assurances = qa(hero, "[data-home='assurance']");
        const heroRows = qa(hero, "[data-story='hero-slot'] [data-part='row']");
        const aurora = q<HTMLElement>(hero, ".s-aurora");
        const seam = q(hero, ".s-home-seam");

        /* Three waves. Primary carries the argument, secondary the action,
           tertiary the proof — nothing arrives at the same time as its own
           heading, and nothing decorative arrives before something readable. */
        const enter = gsap.timeline({
          defaults: { ease: M.ease.enter },
          delay: desktop ? 0.18 : 0.08,
        });

        if (streak) {
          gsap.set(streak, { autoAlpha: 0, xPercent: -40 * sign, scaleX: 0.4 });
          enter
            .to(
              streak,
              {
                autoAlpha: 0.85,
                xPercent: 0,
                scaleX: 1,
                duration: 1.15,
                ease: M.ease.settle,
              },
              0,
            )
            .to(streak, { autoAlpha: 0.32, duration: 0.8 }, 0.95);
        }

        if (eyebrow) {
          gsap.set(eyebrow, { autoAlpha: 0, y: 14 });
          enter.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.16);
        }

        /* The headline is the page's one masked reveal. `.s-home-title` owns
           the clip box, so the mask cannot eat Arabic marks. */
        if (title) {
          gsap.set(title, { clipPath: "inset(0 0 100% 0)", y: 26 });
          enter.to(
            title,
            {
              clipPath: "inset(0 0 0% 0)",
              y: 0,
              duration: M.dur.display,
              ease: M.ease.arrive,
            },
            0.28,
          );
        }

        /* The gradient word fills once, on arrival, and then never repaints. */
        if (titleAccent) {
          gsap.set(titleAccent, {
            backgroundSize: "0% 100%",
            backgroundPosition: rtl ? "100% 0" : "0% 0",
          });
          enter.to(
            titleAccent,
            { backgroundSize: "100% 100%", duration: 1, ease: M.ease.settle },
            0.56,
          );
        }

        if (lead) {
          gsap.set(lead, { autoAlpha: 0, y: 18 });
          enter.to(lead, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.5);
        }

        if (ctas) {
          const kids = Array.from(ctas.children);
          const targets = kids.length ? kids : [ctas];
          gsap.set(targets, { autoAlpha: 0, y: 16 });
          enter.to(
            targets,
            {
              autoAlpha: 1,
              y: 0,
              duration: M.dur.settle,
              stagger: M.stagger.standard,
            },
            0.66,
          );
        }

        if (afterLabel) {
          gsap.set(afterLabel, { autoAlpha: 0, y: 12 });
          enter.to(afterLabel, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.6);
        }

        if (phone) {
          gsap.set(phone, {
            autoAlpha: 1,
            y: desktop ? 52 : 30,
            rotateY: desktop ? -10 * sign : 0,
            rotateX: desktop ? 5 : 0,
            transformPerspective: 1100,
          });
          enter.to(
            phone,
            {
              y: 0,
              rotateY: 0,
              rotateX: 0,
              duration: 1.15,
              ease: M.ease.enter,
            },
            0.36,
          );
        }

        if (phoneGlow) {
          gsap.set(phoneGlow, { autoAlpha: 0, scale: 0.7 });
          enter.to(
            phoneGlow,
            { autoAlpha: 0.62, scale: 1, duration: 0.9, ease: M.ease.settle },
            0.72,
          );
        }

        if (paper && desktop) {
          gsap.set(paper, { autoAlpha: 0, y: 22, scale: 0.94 });
          enter.to(
            paper,
            { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: M.ease.enter },
            0.54,
          );
        }

        if (badge && desktop) {
          gsap.set(badge, { autoAlpha: 0, scale: 0.4, rotate: -16 });
          enter.to(
            badge,
            {
              autoAlpha: 1,
              scale: 1,
              rotate: 0,
              duration: M.dur.mark,
              ease: M.ease.pop,
            },
            0.92,
          );
        }

        if (heroRows.length) {
          gsap.set(heroRows, { autoAlpha: 0, y: 14, scale: 0.97 });
          enter.to(
            heroRows,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              stagger: M.stagger.standard,
              duration: 0.4,
              ease: M.ease.settle,
            },
            0.88,
          );
        }

        if (assurances.length) {
          gsap.set(assurances, { autoAlpha: 0, y: 20 });
          enter.to(
            assurances,
            {
              autoAlpha: 1,
              y: 0,
              duration: M.dur.settle,
              stagger: M.stagger.editorial,
            },
            1.1,
          );
        }

        /* The live dot is the page's only permanent loop besides the marquee,
           and it is 6px of one element. */
        if (pulse) {
          enter.add(() => {
            gsap.to(pulse, {
              scale: 1.55,
              autoAlpha: 0.45,
              duration: 1.35,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          });
        }

        /* Paper drifts against the phone on pointer — two objects at two
           depths, which is the only parallax this page allows itself besides
           the phone's own. The phone is owned by `StoryPhone`.
           The drift is written to the leaf *inside* the paper, never to the
           paper itself: the exit scrub below owns `paper`'s x and y, and two
           writers on one property is how a pointer move turns into a stutter
           halfway down the hero. */
        const paperLeaf = paper ? q<HTMLElement>(paper, "figure") : null;
        if (desktop && proof && paperLeaf) {
          const px = gsap.quickTo(paperLeaf, "x", {
            duration: 0.7,
            ease: M.ease.settle,
          });
          const py = gsap.quickTo(paperLeaf, "y", {
            duration: 0.7,
            ease: M.ease.settle,
          });
          const onMove = (event: PointerEvent) => {
            const rect = proof.getBoundingClientRect();
            const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            px(nx * -12 * sign);
            py(ny * 7);
          };
          const onLeave = () => {
            px(0);
            py(0);
          };
          proof.addEventListener("pointermove", onMove, { passive: true });
          proof.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            proof.removeEventListener("pointermove", onMove);
            proof.removeEventListener("pointerleave", onLeave);
          });
        }

        /* ================================================================== */
        /* 2. Hero exit — the handoff, unpinned                               */
        /* ================================================================== */

        /**
         * The paper does not fade out; it goes *into* the phone. As the hero
         * leaves, the photograph shrinks and travels toward the device, and the
         * story's first chapter opens with that same photograph inside the
         * import screen. That continuity is the whole reason the phone travels.
         */
        const exit = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub,
            invalidateOnRefresh: true,
          },
        });

        if (copy) {
          exit.to(
            copy,
            { y: -30 * (desktop ? 1 : 0.5), autoAlpha: 0.45, duration: 1 },
            0,
          );
        }

        if (paper && desktop) {
          exit.to(
            paper,
            {
              scale: 0.42,
              x: 120 * sign,
              y: -30,
              autoAlpha: 0,
              duration: 0.62,
            },
            0.1,
          );
        }

        if (badge && desktop) {
          exit.to(
            badge,
            { scale: 1.5, autoAlpha: 0, duration: 0.3, ease: M.ease.exit },
            0.12,
          );
        }

        if (assurances.length) {
          exit.to(
            assurances,
            { y: -18, autoAlpha: 0.3, duration: 0.7, stagger: 0.04 },
            0.25,
          );
        }

        /* The light leaves the glass and follows the phone: the WebGL pool
           fades on its own scroll signal, the DOM glow takes over, and the seam
           is what the light leaves behind. */
        if (phoneGlow) {
          exit.to(phoneGlow, { autoAlpha: 0.95, scale: 1.2, duration: 0.5 }, 0);
        }

        if (aurora) {
          exit.to(
            aurora,
            { "--s-aurora-opacity": 0.28, duration: 0.7 },
            0.2,
          );
        }

        if (streak) {
          exit.to(streak, { autoAlpha: 0.08, y: 46, duration: 0.6 }, 0.3);
        }

        if (seam) {
          exit.fromTo(
            seam,
            { scaleX: 0.12, autoAlpha: 0.1 },
            { scaleX: 1, autoAlpha: 1, duration: 0.45 },
            0.5,
          );
        }

        /* ================================================================== */
        /* 3. Section grammar                                                 */
        /* ================================================================== */

        /** Every section heading: ticket, then words, then lead. */
        const headingIn = (section: HTMLElement) => {
          const heading = q<HTMLElement>(section, "[data-home='section-heading']");
          if (!heading) return;
          const ticket = q(heading, ".s-ticket");
          const h = q<HTMLElement>(heading, "h2, h3");
          const p = q(heading, "p");
          const words = splitWords(h);

          const tl = gsap.timeline({
            defaults: { ease: M.ease.enter },
            scrollTrigger: { trigger: heading, start: "top 82%", once: true },
          });

          if (ticket) {
            tl.from(ticket, { autoAlpha: 0, y: 12, duration: 0.4 }, 0);
          }
          if (words?.length) {
            tl.from(
              words,
              {
                autoAlpha: 0,
                y: 26,
                duration: 0.75,
                ease: M.ease.arrive,
                stagger: { each: M.stagger.tight, from: "start" },
              },
              0.06,
            );
          } else if (h) {
            tl.from(
              h,
              {
                autoAlpha: 0,
                y: rise,
                duration: M.dur.story,
                ease: M.ease.arrive,
              },
              0.06,
            );
          }
          if (p) {
            tl.from(p, { autoAlpha: 0, y: 16, duration: M.dur.reveal }, 0.2);
          }
        };

        const sections = qa<HTMLElement>(document, "[data-home-section]");

        sections.forEach((section) => {
          const kind = section.dataset.homeSection;
          if (kind === "hero") return;

          headingIn(section);

          /* ---------------- the story chapters ---------------- */
          if (kind === "story") {
            const chapters = qa<HTMLElement>(section, "[data-story='chapter']");

            chapters.forEach((chapter) => {
              const mark = q(chapter, "[data-story='chapter-mark']");
              const rule = q(chapter, "[data-story='chapter-rule']");
              const chapterTitle = q(chapter, "[data-story='chapter-title']");
              const body = q(chapter, "[data-story='chapter-body']");

              const tl = gsap.timeline({
                defaults: { ease: M.ease.enter },
                scrollTrigger: {
                  trigger: chapter,
                  start: "top 72%",
                  once: true,
                },
              });

              if (mark) {
                tl.from(
                  mark,
                  {
                    scale: 0.5,
                    autoAlpha: 0,
                    rotate: -10,
                    duration: M.dur.mark,
                    ease: M.ease.pop,
                  },
                  0,
                );
              }
              if (rule) {
                tl.from(
                  rule,
                  {
                    scaleX: 0,
                    transformOrigin: rtl ? "right center" : "left center",
                    duration: 0.7,
                    ease: M.ease.settle,
                  },
                  0.08,
                );
              }
              if (chapterTitle) {
                tl.from(
                  chapterTitle,
                  {
                    autoAlpha: 0,
                    y: rise * 0.7,
                    duration: 0.75,
                    ease: M.ease.arrive,
                  },
                  0.1,
                );
              }
              if (body) {
                tl.from(
                  body,
                  { autoAlpha: 0, y: 18, duration: M.dur.reveal },
                  0.2,
                );
              }

              /* Which chapter the page is currently telling. CSS owns the
                 transition, so this costs one class toggle per crossing. */
              ScrollTrigger.create({
                trigger: chapter,
                start: "top 62%",
                end: "bottom 62%",
                onToggle: (self) => {
                  chapter.classList.toggle("is-live", self.isActive);
                  if (mark) mark.classList.toggle("s-step-live", self.isActive);
                },
              });
            });

            const coda = q<HTMLElement>(section, "[data-story='coda']");
            if (coda) {
              const codaTitle = q<HTMLElement>(coda, "[data-story='coda-title']");
              const words = splitWords(codaTitle);
              const tl = gsap.timeline({
                defaults: { ease: M.ease.enter },
                scrollTrigger: { trigger: coda, start: "top 76%", once: true },
              });
              tl.from(
                q(coda, "[data-story='coda-eyebrow']"),
                { autoAlpha: 0, y: 12, duration: 0.4 },
                0,
              );
              if (words?.length) {
                tl.from(
                  words,
                  {
                    autoAlpha: 0,
                    y: 28,
                    duration: 0.8,
                    ease: M.ease.arrive,
                    stagger: { each: M.stagger.tight },
                  },
                  0.06,
                );
              } else if (codaTitle) {
                tl.from(
                  codaTitle,
                  { autoAlpha: 0, y: rise, duration: M.dur.story },
                  0.06,
                );
              }
              tl.from(
                [
                  q(coda, "[data-story='coda-body']"),
                  q(coda, "[data-story='coda-cta']"),
                ].filter(Boolean),
                {
                  autoAlpha: 0,
                  y: 20,
                  duration: M.dur.reveal,
                  stagger: M.stagger.editorial,
                },
                0.22,
              );
            }

            const storySeam = q(section, "[data-story='seam']");
            if (storySeam) {
              gsap.fromTo(
                storySeam,
                { scaleX: 0.1, autoAlpha: 0.15 },
                {
                  scaleX: 1,
                  autoAlpha: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: storySeam,
                    start: "top 96%",
                    end: "top 62%",
                    scrub,
                  },
                },
              );
            }
          }

          /* ---------------- tinted bands arrive as a wipe ---------------- */
          const wipe = q(section, "[data-home='wipe']");
          if (wipe) {
            gsap.fromTo(
              wipe,
              { scaleY: 0, transformOrigin: "top center" },
              {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: `top ${desktop ? 42 : 60}%`,
                  scrub,
                },
              },
            );
          }

          /* ---------------- card grids: depth, not a fade ---------------- */
          const cards = qa<HTMLElement>(section, "[data-home='card']");
          if (cards.length) {
            gsap.from(cards, {
              autoAlpha: 0,
              y: desktop ? 54 : 24,
              rotateX: desktop ? 12 : 0,
              scale: desktop ? 0.93 : 0.98,
              transformOrigin: "50% 120%",
              transformPerspective: 1200,
              duration: desktop ? 0.85 : 0.5,
              ease: M.ease.enter,
              stagger: { each: desktop ? 0.09 : 0.05, from: "start" },
              scrollTrigger: {
                trigger: cards[0] ?? section,
                start: "top 80%",
                once: true,
              },
            });

            /**
             * Pointer-aware depth on cards.
             *
             * Once GSAP writes an inline transform, the stylesheet's hover lift
             * can never win, so the lift moves here too and `public.css` drops
             * `transform` from these cards' transition list under
             * `data-home-motion="desktop"`. The hover shadow stays in CSS — it
             * is not a transform and it does not need a clock.
             */
            if (desktop) {
              cards.forEach((card) => {
                const to = (property: string) =>
                  gsap.quickTo(card, property, {
                    duration: 0.45,
                    ease: M.ease.settle,
                  });
                const tiltX = to("rotateX");
                const tiltY = to("rotateY");
                const lift = to("y");
                gsap.set(card, { transformPerspective: 900 });

                const onMove = (event: PointerEvent) => {
                  const rect = card.getBoundingClientRect();
                  const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
                  const ny =
                    ((event.clientY - rect.top) / rect.height - 0.5) * 2;
                  tiltY(nx * 3.5);
                  tiltX(ny * -2.5);
                  lift(-4);
                };
                const onLeave = () => {
                  tiltX(0);
                  tiltY(0);
                  lift(0);
                };
                card.addEventListener("pointermove", onMove, { passive: true });
                card.addEventListener("pointerleave", onLeave);
                cleanups.push(() => {
                  card.removeEventListener("pointermove", onMove);
                  card.removeEventListener("pointerleave", onLeave);
                });
              });
            }
          }

          /* ---------------- showcase: the frame opens ---------------- */
          if (kind === "showcase") {
            qa<HTMLElement>(section, "[data-home='media']").forEach(
              (frame, index) => {
                /* The wrapper, never the `img`: the image carries the CSS hover
                   breathe, and a transition and a scrub on one transform is how
                   a parallax starts feeling like elastic. */
                const inner =
                  q<HTMLElement>(frame, "[data-home='media-inner']") ?? frame;
                const lead = index === 0;
                gsap.set(frame, { overflow: "hidden" });
                gsap.fromTo(
                  frame,
                  {
                    clipPath: lead
                      ? "inset(34% 0% 34% 0% round 14px)"
                      : "inset(14% 10% 14% 10% round 14px)",
                  },
                  {
                    clipPath: "inset(0% 0% 0% 0% round 0px)",
                    ease: "none",
                    scrollTrigger: {
                      trigger: frame,
                      start: "top 88%",
                      end: "top 38%",
                      scrub,
                    },
                  },
                );
                if (desktop) {
                  gsap.fromTo(
                    inner,
                    { scale: 1.16, yPercent: 8 },
                    {
                      scale: 1,
                      yPercent: -4,
                      ease: "none",
                      scrollTrigger: {
                        trigger: frame,
                        start: "top 92%",
                        end: "bottom 20%",
                        scrub,
                      },
                    },
                  );
                }
              },
            );

            const showcaseCta = q(section, "[data-home='showcase-cta']");
            if (showcaseCta) {
              gsap.from(showcaseCta, {
                autoAlpha: 0,
                y: 20,
                duration: M.dur.reveal,
                ease: M.ease.enter,
                scrollTrigger: {
                  trigger: showcaseCta,
                  start: "top 92%",
                  once: true,
                },
              });
            }
          }

          /* ---------------- plans: a comparison, staged ---------------- */
          if (kind === "plans") {
            const free = q<HTMLElement>(section, "[data-home='plan-free']");
            const pro = q<HTMLElement>(section, "[data-home='plan-pro']");
            if (free && pro) {
              const tl = gsap.timeline({
                defaults: { ease: M.ease.enter },
                scrollTrigger: { trigger: free, start: "top 78%", once: true },
              });
              tl.from(free, { autoAlpha: 0, y: 32, duration: 0.7 }, 0).from(
                pro,
                { autoAlpha: 0, y: 44, scale: 0.95, duration: 0.85 },
                0.1,
              );

              if (desktop) {
                gsap.fromTo(
                  pro,
                  { scale: 0.985, y: 8 },
                  {
                    scale: 1.02,
                    y: -8,
                    ease: "none",
                    scrollTrigger: {
                      trigger: pro,
                      start: "top 72%",
                      end: "bottom 45%",
                      scrub,
                    },
                  },
                );
                gsap.fromTo(
                  free,
                  { autoAlpha: 1 },
                  {
                    autoAlpha: 0.82,
                    ease: "none",
                    scrollTrigger: {
                      trigger: pro,
                      start: "top 62%",
                      end: "bottom 45%",
                      scrub,
                    },
                  },
                );
              }
            }
          }

          /* ---------------- faq: rows draw, they do not fade ---------------- */
          if (kind === "faq") {
            const panel = q<HTMLElement>(section, "[data-home='faq-panel']");
            const rows = panel ? qa<HTMLElement>(panel, "details") : [];
            if (rows.length) {
              gsap.from(rows, {
                autoAlpha: 0,
                y: 14,
                duration: M.dur.settle,
                stagger: M.stagger.standard,
                ease: M.ease.enter,
                scrollTrigger: {
                  trigger: panel ?? section,
                  start: "top 82%",
                  once: true,
                },
              });
              gsap.fromTo(
                rows,
                { "--s-row-draw": 0 },
                {
                  "--s-row-draw": 1,
                  ease: "none",
                  stagger: M.stagger.standard,
                  scrollTrigger: {
                    trigger: panel ?? section,
                    start: "top 86%",
                    end: "center 60%",
                    scrub,
                  },
                },
              );
            } else if (panel) {
              gsap.from(panel, {
                autoAlpha: 0,
                y: rise,
                duration: M.dur.story,
                ease: M.ease.enter,
                scrollTrigger: { trigger: panel, start: "top 82%", once: true },
              });
            }
          }

          /* ---------------- the closing band ---------------- */
          if (kind === "cta") {
            const band = q<HTMLElement>(section, "[data-home='cta-band']") ?? section;
            const bloom = q(band, ".s-bloom");
            const h = q<HTMLElement>(band, "h2");
            const words = splitWords(h);
            const bandLead = q(band, "p");
            const actions = q(band, "[data-home='cta-actions']");

            const tl = gsap.timeline({
              defaults: { ease: M.ease.enter },
              scrollTrigger: { trigger: band, start: "top 84%", once: true },
            });

            if (bloom) {
              gsap.set(bloom, { autoAlpha: 0.12, scale: 1.1 });
              tl.to(
                bloom,
                { autoAlpha: 0.45, scale: 1, duration: 1.1, ease: M.ease.settle },
                0,
              );
            }
            if (words?.length) {
              tl.from(
                words,
                {
                  autoAlpha: 0,
                  y: 30,
                  duration: 0.8,
                  ease: M.ease.arrive,
                  stagger: { each: M.stagger.tight },
                },
                0.05,
              );
            } else if (h) {
              tl.from(
                h,
                { autoAlpha: 0, y: rise, duration: M.dur.story, ease: M.ease.arrive },
                0.05,
              );
            }
            if (bandLead) {
              tl.from(
                bandLead,
                { autoAlpha: 0, y: 18, duration: M.dur.reveal },
                0.2,
              );
            }
            if (actions) {
              tl.from(
                actions,
                { autoAlpha: 0, y: 22, duration: M.dur.reveal },
                0.28,
              );
            }
          }
        });

        /* ---------------- the light lands on real venues ---------------- */
        const logos = q<HTMLElement>(document, "[data-home-section='logos']");
        if (logos) {
          const tiles = qa(logos, "li");
          const tl = gsap.timeline({
            defaults: { ease: M.ease.enter },
            scrollTrigger: { trigger: logos, start: "top 92%", once: true },
          });
          tl.from(logos, { autoAlpha: 0, y: 14, duration: M.dur.settle }, 0);
          if (tiles.length) {
            tl.from(
              tiles,
              {
                autoAlpha: 0,
                y: 12,
                scale: 0.94,
                duration: M.dur.mark,
                stagger: M.stagger.tight,
              },
              0.08,
            );
          }
        }

        ScrollTrigger.refresh();
      });
    });

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
      ctx?.revert();
      delete document.documentElement.dataset.homeMotion;
    };
  }, [reduced]);

  return null;
}
