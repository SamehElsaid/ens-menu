"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { YouTubeEvent, YouTubeProps } from "react-youtube";

const YouTube = dynamic(() => import("react-youtube"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-white">
      …
    </div>
  ),
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
};

export default function HeroYouTubeModal({ isOpen, onClose, videoId }: Props) {
  const playerRef = useRef<YouTubeEvent["target"] | null>(null);

  const videoOpts: YouTubeProps["opts"] = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
    },
  };

  const handleVideoReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    if (isOpen) {
      event.target.playVideo();
    }
  };

  useEffect(() => {
    if (!playerRef.current) return;
    if (isOpen) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative youtube-player-container mx-4 aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1 text-sm text-white hover:bg-black"
        >
          ✕
        </button>
        <YouTube
          videoId={videoId}
          opts={videoOpts}
          className="h-full w-full"
          onReady={handleVideoReady}
        />
      </div>
    </div>
  );
}
