"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/motion/useReducedMotion";
import {
  PHONE_STATES,
  PhoneFrame,
  ScreenExtract,
  ScreenMenu,
  ScreenPublish,
  ScreenReview,
  ScreenUpload,
  type PhoneState,
} from "./screens";

/**
 * The one phone, travelling.
 *
 * The home page's spine: a single device that starts inside the hero
 * composition, glides down the inline-end lane as the story section scrolls
 * past it, and changes what it is showing at each chapter — upload, the AI
 * read, review, the published QR, and finally the guest menu again with the
 * code live. It is never pinned to the centre of the screen, never takes the
 * viewport over, and never spins.
 *
 * Why a fixed layer rather than `pin: true`: pinning pulls a grid child out of
 * flow, adds a spacer, and makes every later trigger's measurements depend on
 * it. A fixed layer whose transform is written from two *measured* anchors — the
 * hero's phone slot and the story lane — gets the same read with zero layout
 * impact, survives resize by re-measuring, and mirrors itself under RTL for
 * free because both anchors come out of the layout.
 *
 * Cost discipline: nothing here renders on the server, so a reduced-motion or
 * no-JS visitor pays nothing. GSAP is imported dynamically, every write is
 * `transform`/`opacity`, no React state is touched per frame, and the only
 * `setState` in the file arms the real QR renderer one chapter before it shows.
 */

const DESKTOP_MQ = "(min-width: 1024px)";
const FINE_POINTER_MQ = "(hover: hover) and (pointer: fine)";

/** How long the hero entrance may finish before the layer takes over, if the
 *  visitor has not scrolled by then. */
const HANDOFF_MS = 1_500;

function q<T extends Element>(root: ParentNode, selector: string) {
  return root.querySelector(selector) as T | null;
}

function qa<T extends Element>(root: ParentNode, selector: string) {
  return Array.from(root.querySelectorAll(selector)) as T[];
}

export default function StoryPhone() {
  const reduced = useReducedMotion();
  const demo = useTranslations("site.demo");

  const [mounted, setMounted] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    setMounted(true);
  }, [reduced]);

  useEffect(() => {
    if (!mounted || reduced) return;
    const layer = layerRef.current;
    if (!layer) return;

    const root = document.documentElement;
    root.dataset.story = "pending";

    let killed = false;
    let ctx: { revert: () => void } | null = null;
    const cleanups: Array<() => void> = [];

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      type Timeline = ReturnType<typeof gsap.timeline>;

      ctx = gsap.context(() => {
        const hero = document.getElementById("hero");
        const slot = q<HTMLElement>(document, "[data-story='hero-slot']");
        const section = q<HTMLElement>(document, "[data-story='section']");
        const lane = q<HTMLElement>(document, "[data-story='lane']");
        const coda = q<HTMLElement>(document, "[data-story='coda']");
        const chapters = qa<HTMLElement>(document, "[data-story='chapter']");

        const exit = q<HTMLElement>(layer, "[data-story='exit']");
        const phone = q<HTMLElement>(layer, "[data-story='phone']");
        const drift = q<HTMLElement>(layer, "[data-story='drift']");
        const tilt = q<HTMLElement>(layer, "[data-story='tilt']");
        const glow = q<HTMLElement>(layer, "[data-story='glow']");
        const screens = qa<HTMLElement>(layer, "[data-screen]");
        const ticks = qa<HTMLElement>(layer, "[data-tick-fill]");

        if (!hero || !slot || !section || !exit || !phone || !drift || !tilt) {
          return;
        }
        if (screens.length !== PHONE_STATES.length) return;

        const desktop = window.matchMedia(DESKTOP_MQ).matches;
        const rtl = document.dir === "rtl";
        const sign = rtl ? -1 : 1;

        const found = (...els: Array<HTMLElement | null>) =>
          els.filter((el): el is HTMLElement => el != null);

        /* ---------------------------------------------------------------- */
        /* Anchors — measured, never hard-coded                             */
        /* ---------------------------------------------------------------- */

        let heroX = 0;
        let heroY = 0;
        let midX = 0;
        let midY = 0;
        let storyX = 0;
        let storyY = 0;
        let storyScale = 1;
        let exitY = 120;

        const measure = () => {
          const slotRect = slot.getBoundingClientRect();
          const width = slotRect.width;
          if (width <= 0) return;

          phone.style.width = `${width}px`;
          const height = width * (610 / 300) + 12;

          const viewportH = window.innerHeight;
          const headerH =
            q<HTMLElement>(document, "header")?.offsetHeight ?? 72;

          /* The hero anchor is the slot's position in *document* space, which
             is the viewport position the layer must hold at scroll 0. That is
             what makes the handoff from the static hero phone invisible. */
          heroX = slotRect.left;
          heroY = slotRect.top + window.scrollY;

          if (desktop && lane) {
            /* Desktop: the empty inline-end column, vertically centred in what
               is left of the viewport under the header. The chapters read
               beside it, which is why the lane exists in the grid at all. */
            const laneRect = lane.getBoundingClientRect();
            storyScale = Math.min(
              1,
              Math.max(0.68, (laneRect.width * 0.92) / width),
            );
            storyX = laneRect.left + (laneRect.width - width * storyScale) / 2;
            storyY =
              headerH +
              Math.max(12, (viewportH - headerH - height * storyScale) / 2);

            /* The phone rises with the page before it settles, so it reads as
               an object on the page rather than a widget that flies in. */
            midX = heroX + (storyX - heroX) * 0.28;
            midY = Math.max(headerH + 8, heroY - hero.offsetHeight * 0.3);
          } else {
            /* Mobile is a different composition, not a shrunken one: the phone
               holds the upper band and every chapter's words are padded to read
               underneath it. Content therefore always arrives from the bottom
               into clear space and only passes behind the device on its way
               out, which is the one arrangement where a fixed visual never
               covers something the reader has not read yet. */
            const band = viewportH * 0.52;
            storyScale = Math.min(
              1,
              Math.max(
                0.5,
                Math.min(band / height, (window.innerWidth * 0.66) / width),
              ),
            );
            storyX = (window.innerWidth - width * storyScale) / 2;
            storyY = headerH + Math.max(8, viewportH * 0.015);

            /* No mid point on mobile: the phone travels the page one pixel per
               pixel of scroll (see the travel timeline) rather than lagging it,
               because a lagging fixed phone whose slot starts below the fold is
               a phone the visitor never sees. */
          }

          exitY = Math.round(viewportH * 0.12);
        };

        measure();
        ScrollTrigger.addEventListener("refreshInit", measure);
        cleanups.push(() =>
          ScrollTrigger.removeEventListener("refreshInit", measure),
        );

        gsap.set(phone, {
          x: heroX,
          y: heroY,
          transformOrigin: "0 0",
          force3D: true,
        });
        gsap.set(layer, { autoAlpha: 0 });
        gsap.set(screens.slice(1), { autoAlpha: 0 });

        /* ---------------------------------------------------------------- */
        /* What the screen is showing                                       */
        /* ---------------------------------------------------------------- */

        let current = 0;
        let beat: Timeline | null = null;

        const parts = (el: HTMLElement, name: string) =>
          qa<HTMLElement>(el, `[data-part='${name}']`);
        const part = (el: HTMLElement, name: string) =>
          q<HTMLElement>(el, `[data-part='${name}']`);

        /** Writes a whole number into an element without a React render. */
        const count = (
          el: HTMLElement | null,
          from: number,
          to: number,
          duration: number,
          suffix = "",
        ) => {
          if (!el) return null;
          const proxy = { value: from };
          return gsap.to(proxy, {
            value: to,
            duration,
            ease: "power1.out",
            onUpdate: () => {
              el.textContent = `${Math.round(proxy.value)}${suffix}`;
            },
          });
        };

        /**
         * One recipe per state.
         *
         * This is where the phone stops being a picture that swaps and starts
         * being an interface that moves: the paper drops into the dropzone, the
         * read sweeps down the page, a price is corrected under a caret, the
         * code assembles, the menu re-forms.
         */
        const recipes: Record<
          PhoneState,
          (el: HTMLElement, tl: Timeline) => void
        > = {
          menu: (el, tl) => {
            tl.fromTo(
              found(part(el, "search")),
              { autoAlpha: 0, y: -8 },
              { autoAlpha: 1, y: 0, duration: 0.3 },
              0,
            )
              .fromTo(
                parts(el, "chip"),
                { autoAlpha: 0, y: 8, scale: 0.9 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.035 },
                0.04,
              )
              .fromTo(
                parts(el, "row"),
                { autoAlpha: 0, y: 20, scale: 0.97 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.07 },
                0.08,
              )
              .fromTo(
                found(part(el, "bar")),
                { autoAlpha: 0, y: 18 },
                { autoAlpha: 1, y: 0, duration: 0.4 },
                0.26,
              );
          },

          upload: (el, tl) => {
            tl.fromTo(
              found(part(el, "drop")),
              { scale: 0.95, autoAlpha: 0 },
              { scale: 1, autoAlpha: 1, duration: 0.45 },
              0,
            )
              .fromTo(
                found(part(el, "photo")),
                { y: -30, rotate: -5, autoAlpha: 0 },
                {
                  y: 0,
                  rotate: 0,
                  autoAlpha: 1,
                  duration: 0.7,
                  ease: "power3.out",
                },
                0.06,
              )
              .fromTo(
                found(part(el, "bar-fill")),
                { scaleX: 0 },
                { scaleX: 1, duration: 1.1, ease: "power1.inOut" },
                0.3,
              )
              .fromTo(
                found(part(el, "hint")),
                { autoAlpha: 0, y: 10 },
                { autoAlpha: 1, y: 0, duration: 0.4 },
                0.5,
              );

            const percent = count(part(el, "percent"), 0, 100, 1.1, "%");
            if (percent) tl.add(percent, 0.3);
          },

          extract: (el, tl) => {
            tl.fromTo(
              found(part(el, "scan")),
              { autoAlpha: 0, scale: 0.9 },
              { autoAlpha: 1, scale: 1, duration: 0.4 },
              0,
            )
              .fromTo(
                found(part(el, "scanline")),
                { yPercent: -110, autoAlpha: 0.9 },
                { yPercent: 300, duration: 0.9, repeat: 1, ease: "none" },
                0.1,
              )
              .fromTo(
                found(part(el, "count")),
                { autoAlpha: 0, scale: 0.94 },
                { autoAlpha: 1, scale: 1, duration: 0.4 },
                0.12,
              )
              .fromTo(
                found(part(el, "bar-fill")),
                { scaleX: 0 },
                { scaleX: 1, duration: 1.3, ease: "power1.inOut" },
                0.12,
              )
              .fromTo(
                parts(el, "row"),
                { autoAlpha: 0, x: 18 * sign, y: 6 },
                {
                  autoAlpha: 1,
                  x: 0,
                  y: 0,
                  duration: 0.42,
                  stagger: 0.13,
                  ease: "power2.out",
                },
                0.3,
              )
              .fromTo(
                parts(el, "tick"),
                { scale: 0 },
                { scale: 1, duration: 0.3, stagger: 0.13, ease: "back.out(2)" },
                0.46,
              );
          },

          review: (el, tl) => {
            tl.fromTo(
              found(part(el, "card")),
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, y: 0, duration: 0.45 },
              0,
            )
              .fromTo(
                found(part(el, "rest")),
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: 0.4 },
                0.3,
              )
              .fromTo(
                found(part(el, "bar")),
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.4 },
                0.45,
              )
              .fromTo(
                found(part(el, "caret")),
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.18, repeat: 5, yoyo: true },
                0.2,
              )
              .fromTo(
                found(part(el, "saved")),
                { autoAlpha: 0, scale: 0.7 },
                { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
                0.95,
              )
              .fromTo(
                found(part(el, "knob")),
                { x: -12 * sign },
                { x: 0, duration: 0.35, ease: "power2.out" },
                1.05,
              );

            /* The correction this chapter is about: a price the import read as
               45 becomes the 55 the venue actually charges. */
            const price = count(part(el, "price"), 45, 55, 0.7);
            if (price) tl.add(price, 0.25);
          },

          publish: (el, tl) => {
            tl.fromTo(
              found(part(el, "qr-card")),
              { autoAlpha: 0, y: 18, scale: 0.92, rotate: -3 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotate: 0,
                duration: 0.6,
                ease: "back.out(1.3)",
              },
              0,
            )
              .fromTo(
                found(part(el, "qr")),
                { scale: 0.82, autoAlpha: 0 },
                { scale: 1, autoAlpha: 1, duration: 0.5 },
                0.12,
              )
              .fromTo(
                found(part(el, "live")),
                { autoAlpha: 0, scale: 0.6 },
                {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 0.4,
                  ease: "back.out(2.2)",
                },
                0.3,
              )
              .fromTo(
                found(part(el, "hint"), part(el, "stats"), part(el, "bar")),
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 },
                0.35,
              );

            const views = count(part(el, "views"), 0, 847, 1);
            if (views) tl.add(views, 0.45);
          },

          live: (el, tl) => {
            recipes.menu(el, tl);
            tl.fromTo(
              found(part(el, "live")),
              { autoAlpha: 0, scale: 0.6 },
              { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" },
              0.3,
            );
          },
        };

        const setTicks = (index: number) => {
          ticks.forEach((fill, i) => {
            gsap.to(fill, {
              scaleX: i < index ? 1 : 0,
              duration: 0.45,
              ease: "power2.out",
              overwrite: true,
            });
          });
        };

        const setState = (next: number, direction: number) => {
          if (next === current) return;
          const from = screens[current];
          const to = screens[next];
          const state = PHONE_STATES[next];
          if (!from || !to || !state) return;

          /* Land the previous transition rather than abandoning it: a killed
             timeline would leave a half-hidden part behind on a fast flick. */
          beat?.progress(1).kill();

          gsap.set(from, { zIndex: 1 });
          gsap.set(to, { zIndex: 2 });

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.to(
            from,
            {
              autoAlpha: 0,
              y: -22 * direction,
              scale: 0.985,
              duration: 0.3,
              ease: "power2.in",
            },
            0,
          ).fromTo(
            to,
            {
              autoAlpha: 0,
              y: 26 * direction,
              scale: 0.99,
              clipPath: desktop
                ? "inset(0% 0% 10% 0% round 22px)"
                : "inset(0% 0% 0% 0% round 22px)",
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 22px)",
              duration: 0.5,
            },
            0.1,
          );

          if (glow) {
            tl.fromTo(
              glow,
              { scale: 0.94 },
              {
                scale: 1.06,
                duration: 0.35,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut",
              },
              0.05,
            );
          }

          recipes[state](to, tl);

          beat = tl;
          current = next;
          setTicks(Math.min(next, 4));
          if (next >= 3) setQrReady(true);
        };

        /* ---------------------------------------------------------------- */
        /* Travel                                                           */
        /* ---------------------------------------------------------------- */

        /**
         * The journey, in two grammars.
         *
         * Desktop has room for a composition: the phone rises with the page,
         * overshooting toward the top of the frame, then eases sideways into the
         * lane — it reads as an object being carried, not a panel sliding.
         *
         * Mobile gets physics instead. The trigger's end is the exact distance
         * between the two anchors, so one pixel of scroll is one pixel of
         * travel: the phone is *attached* to the page until it reaches its band,
         * then parks. Anything less than 1:1 would drop a phone that starts
         * below the fold straight out of the viewport.
         */
        const travel = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: desktop
              ? "bottom top"
              : () => `+=${Math.max(160, Math.round(heroY - storyY))}`,
            scrub: desktop ? 0.55 : 0.3,
            invalidateOnRefresh: true,
          },
        });

        if (desktop) {
          travel
            .fromTo(
              phone,
              { x: () => heroX, y: () => heroY, scale: 1 },
              {
                x: () => midX,
                y: () => midY,
                duration: 0.42,
                immediateRender: true,
              },
              0,
            )
            .to(
              phone,
              {
                x: () => storyX,
                y: () => storyY,
                scale: () => storyScale,
                duration: 0.58,
                ease: "power1.inOut",
              },
              0.42,
            );
        } else {
          travel.fromTo(
            phone,
            { x: () => heroX, y: () => heroY, scale: 1 },
            {
              x: () => storyX,
              y: () => storyY,
              scale: () => storyScale,
              duration: 1,
              immediateRender: true,
            },
            0,
          );
        }

        /* A slow drift across the whole story span, so the phone is never
           frozen while the chapters move past it. A separate element from the
           travel and from the pointer, so the three never fight for one
           transform. */
        gsap.fromTo(
          drift,
          /* Starts at rest so the handoff from the static hero phone is exact:
             any offset here would be a visible jump at the moment the layer
             becomes visible. */
          { y: 0, rotateY: 2.5 * sign, rotateX: 1 },
          {
            y: 14,
            rotateY: -2.5 * sign,
            rotateX: -1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );

        /* ---------------------------------------------------------------- */
        /* Chapters                                                         */
        /* ---------------------------------------------------------------- */

        /* The screen changes when the chapter's words are where the reader is
           looking: beside the phone on desktop, above it on mobile. */
        const chapterStart = desktop ? "top 62%" : "top 26%";

        chapters.forEach((chapter, index) => {
          ScrollTrigger.create({
            trigger: chapter,
            start: chapterStart,
            end: `bottom ${desktop ? "62%" : "26%"}`,
            onEnter: () => setState(index + 1, 1),
            onEnterBack: () => setState(index + 1, -1),
            onLeaveBack: index === 0 ? () => setState(0, -1) : undefined,
          });
        });

        if (coda) {
          ScrollTrigger.create({
            trigger: coda,
            start: desktop ? "top 72%" : "top 40%",
            onEnter: () => setState(PHONE_STATES.length - 1, 1),
            onLeaveBack: () => setState(chapters.length, -1),
          });

          /* The exit: the phone leaves downward as the coda lands, and the
             page's light moves on to the logo strip. */
          gsap.fromTo(
            exit,
            { y: 0, scale: 1, autoAlpha: 1 },
            {
              y: () => exitY,
              scale: 0.93,
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: coda,
                start: "center 62%",
                end: "bottom 60%",
                scrub: 0.4,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        /* ---------------------------------------------------------------- */
        /* Pointer depth                                                    */
        /* ---------------------------------------------------------------- */

        let handedOff = false;

        /* Only once this phone *is* the hero's phone. Tilting before the
           handoff would offset it from the static device it has to cover, and
           the swap would show as a small pop. */
        if (desktop && window.matchMedia(FINE_POINTER_MQ).matches) {
          const px = gsap.quickTo(tilt, "x", {
            duration: 0.7,
            ease: "power3.out",
          });
          const py = gsap.quickTo(tilt, "y", {
            duration: 0.7,
            ease: "power3.out",
          });
          const ry = gsap.quickTo(tilt, "rotateY", {
            duration: 0.7,
            ease: "power3.out",
          });
          const rx = gsap.quickTo(tilt, "rotateX", {
            duration: 0.7,
            ease: "power3.out",
          });
          gsap.set(tilt, { transformPerspective: 1200 });

          const onMove = (event: PointerEvent) => {
            if (!handedOff) return;
            const nx = (event.clientX / window.innerWidth - 0.5) * 2;
            const ny = (event.clientY / window.innerHeight - 0.5) * 2;
            px(nx * 7 * sign);
            py(ny * -5);
            ry(nx * 3.2 * sign);
            rx(ny * -2.2);
          };

          window.addEventListener("pointermove", onMove, { passive: true });
          cleanups.push(() =>
            window.removeEventListener("pointermove", onMove),
          );
        }

        /* ---------------------------------------------------------------- */
        /* Handoff from the static hero phone                               */
        /* ---------------------------------------------------------------- */

        const handoff = () => {
          if (handedOff || killed) return;
          handedOff = true;
          root.dataset.story = "travel";
          gsap.to(layer, { autoAlpha: 1, duration: 0.2, ease: "none" });
          ScrollTrigger.refresh();
        };

        const timer = window.setTimeout(handoff, HANDOFF_MS);
        const onScroll = () => {
          if (window.scrollY > 4) handoff();
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => {
          window.clearTimeout(timer);
          window.removeEventListener("scroll", onScroll);
        });

        /* The first screen arrives rather than being already there, on roughly
           the hero's own beat: if the visitor scrolls before the hero entrance
           has finished, the layer takes over a picture that matches the static
           phone mid-reveal instead of a finished one. */
        const first = screens[0];
        if (first) recipes.menu(first, gsap.timeline({ delay: 0.5 }));

        setTicks(0);
        ScrollTrigger.refresh();
        if (window.scrollY > 4) handoff();
      }, layer);
    });

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
      ctx?.revert();
      delete root.dataset.story;
    };
  }, [mounted, reduced]);

  if (!mounted || reduced) return null;

  return (
    <div
      ref={layerRef}
      data-story="layer"
      /* Fixed, never interactive, and beneath the header. Its transform is the
         only thing that moves; nothing inside it reflows. */
      className="pointer-events-none invisible fixed inset-0 z-30"
    >
      <div data-story="exit" className="absolute inset-0">
        <div data-story="phone" className="absolute top-0 left-0 w-70">
          <div data-story="drift" className="relative">
            <div data-story="tilt" className="relative">
              <span
                aria-hidden
                data-story="glow"
                className="s-home-phone-glow s-story-glow"
              />
              <PhoneFrame
                label={demo("previewLabel")}
                className="relative z-10"
              >
                <div className="relative size-full">
                  {PHONE_STATES.map((state, index) => (
                    <div
                      key={state}
                      data-screen={state}
                      data-screen-index={index}
                      className="absolute inset-0"
                    >
                      {state === "menu" ? <ScreenMenu /> : null}
                      {state === "upload" ? <ScreenUpload /> : null}
                      {state === "extract" ? <ScreenExtract /> : null}
                      {state === "review" ? <ScreenReview /> : null}
                      {state === "publish" ? (
                        <ScreenPublish qrReady={qrReady} />
                      ) : null}
                      {state === "live" ? <ScreenMenu live /> : null}
                    </div>
                  ))}
                </div>
              </PhoneFrame>
            </div>

            {/* Four ticks under the device: where in the four steps the story
                is. Decorative — the chapters beside it are already numbered
                01–04 in the DOM, so announcing this would only repeat them. */}
            <div
              aria-hidden
              className="relative z-10 mx-auto mt-5 flex w-32 gap-1.5"
            >
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className="h-0.5 flex-1 overflow-hidden rounded-full bg-site-line"
                >
                  <span
                    data-tick-fill
                    className="block size-full origin-left scale-x-0 rounded-full bg-site-brand"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
