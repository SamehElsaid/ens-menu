"use client";

import { useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * The looping screen recording in the staff app hero.
 *
 * The loop is the page's proof, so it is allowed to exist — but a `<video>` with
 * `autoPlay loop` decodes forever, wherever it is. Left alone it keeps a decoder
 * and a compositor layer alive while the visitor reads the FAQ four screens
 * below, and on a phone that is measurable battery for zero visible benefit.
 * So playback follows attention: in the viewport, in the foreground, or paused.
 *
 * The toggle is not a nicety. Auto-playing content that runs longer than five
 * seconds needs a way to stop it (WCAG 2.2.2), and `controls` on a clip inside a
 * phone bezel puts a browser chrome bar across the product being demonstrated.
 * One button, over the bezel, is the smaller intrusion.
 *
 * Under `prefers-reduced-motion` it does not start on its own. A looping video is
 * exactly the kind of unsolicited movement that preference is asking about, and
 * the visitor can still start it.
 */
export function AppPreviewVideo({
  src,
  label,
  pauseLabel,
  playLabel,
}: {
  src: string;
  label: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  /* `null` means no explicit choice yet, so the motion preference decides.
     Derived per render rather than seeded into initial state: `useReducedMotion`
     answers `false` on the server, and a state initialiser would freeze that
     answer, autoplaying for exactly the visitors who asked it not to.

     Once set, it wins — this is also "did the visitor stop it", which is not the
     same question as "is it paused right now". It is paused whenever it is
     off-screen too, and that must not resume on scroll if they stopped it. */
  const [override, setOverride] = useState<boolean | null>(null);
  const wanted = override ?? !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = false;

    const sync = () => {
      if (wanted && onScreen && !document.hidden) {
        /* Rejected play() is normal — a background tab, or a policy that wants a
           gesture first. The button is the recovery path, so there is nothing to
           handle. */
        void el.play().catch(() => {});
      } else {
        el.pause();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false;
        sync();
      },
      /* A slice of the phone visible is enough to be worth playing; requiring
         most of it would leave the clip frozen while it is plainly on screen. */
      { threshold: 0.2 },
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [wanted]);

  return (
    <>
      <video
        ref={ref}
        src={src}
        className="size-full object-cover"
        loop
        muted
        playsInline
        /* No `autoPlay`: the effect above owns when this plays, and letting the
           attribute start it too means one frame of playback off-screen. */
        preload="metadata"
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => setOverride(!wanted)}
        aria-label={wanted ? pauseLabel : playLabel}
        /* Low in the corner rather than over the screen, so it never covers the
           UI it is there to let you study. 32px of visible button, with the
           `before` pseudo-element taking the touch target out to 44px — a control
           this small has to be reachable with a thumb without growing into the
           frame it sits in. */
        className="absolute end-2 bottom-2 z-10 grid size-8 place-items-center rounded-full bg-site-ink/70 text-white backdrop-blur-[2px] transition-[background-color,transform] duration-(--dur-tint) ease-(--ease-settle) before:absolute before:-inset-1.5 before:content-[''] hover:bg-site-ink motion-safe:active:scale-[0.94]"
      >
        {wanted ? (
          <FiPause className="size-3.5" aria-hidden />
        ) : (
          <FiPlay className="size-3.5" aria-hidden />
        )}
      </button>
    </>
  );
}
