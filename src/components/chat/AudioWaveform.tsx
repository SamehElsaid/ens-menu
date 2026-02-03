"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string; // audio URL (blob or remote)
  onPlayChange?: (isPlaying: boolean) => void;
  onEnd?: () => void;
  /** Optional initial duration (seconds) for label; falls back to audio metadata if not provided */
  durationSeconds?: number;
};

const formatSeconds = (totalSeconds: number | undefined) => {
  if (!totalSeconds || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

type WaveSurferInstance = {
  load: (src: string) => void;
  on: (event: string, cb: () => void) => void;
  getDuration: () => number;
  playPause: () => void;
  seekTo: (progress: number) => void;
  destroy: () => void;
};

export const AudioWaveform: React.FC<Props> = ({
  src,
  onPlayChange,
  onEnd,
  durationSeconds,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<{
    load: (src: string) => void;
    on: (event: string, cb: () => void) => void;
    getDuration: () => number;
    playPause: () => void;
    seekTo: (progress: number) => void;
    destroy: () => void;
  } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | undefined>(durationSeconds);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const setup = async () => {
      try {
        // Dynamic import so that wavesurfer is only loaded in the browser
        const mod = await import("wavesurfer.js");
        const WS = (mod as { default?: unknown })?.default ?? mod;
        if (typeof (WS as { create?: unknown }).create !== "function") {
          console.error("wavesurfer.js does not expose a create() function");
          return;
        }
        if (!containerRef.current || cancelled) return;

        const ws = (WS as { create: (options: Record<string, unknown>) => WaveSurferInstance }).create({
          container: containerRef.current,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          height: 38,
          width: 100,
          cursorWidth: 0,
          waveColor: "#85d4a5",
          progressColor: "#0f7c4a",
          responsive: true,
          interact: true,
          normalize: true,
        });

        ws.load(src);

        ws.on("ready", () => {
          if (cancelled) return;
          setIsReady(true);
          if (!durationSeconds) {
            setDuration(ws.getDuration());
          }
        });

        ws.on("play", () => {
          if (cancelled) return;
          setIsPlaying(true);
          onPlayChange?.(true);
        });

        ws.on("pause", () => {
          if (cancelled) return;
          setIsPlaying(false);
          onPlayChange?.(false);
        });

        ws.on("finish", () => {
          if (cancelled) return;
          setIsPlaying(false);
          onPlayChange?.(false);
          onEnd?.();
          ws.seekTo(0); // reset cursor to start
        });

        waveSurferRef.current = ws;
      } catch (err) {
        console.error("Failed to init WaveSurfer", err);
      }
    };

    void setup();

    return () => {
      cancelled = true;
      const ws = waveSurferRef.current;
      if (ws) {
        try {
          ws.destroy();
        } catch (err) {
          console.warn("WaveSurfer destroy error:", err);
        } finally {
          waveSurferRef.current = null;
        }
      }
    };
  }, [src, onEnd, onPlayChange, durationSeconds]);

  const togglePlay = async () => {
    const ws = waveSurferRef.current;
    if (!ws || !isReady) return;
    try {
      ws.playPause();
    } catch (err) {
      console.error("Error toggling audio playback", err);
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <button
        type="button"
        onClick={togglePlay}
        disabled={!isReady}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-200"
      >
        {isPlaying ? "❚❚" : "▶"}
      </button>
      <div className="flex flex-1 items-center gap-2">
        <div className="flex-1">
          <div ref={containerRef} className="w-full cursor-pointer" />
        </div>
        {duration !== undefined && (
          <span className="whitespace-nowrap text-[11px] opacity-70">
            {formatSeconds(duration)}
          </span>
        )}
      </div>
    </div>
  );
};

export default AudioWaveform;


