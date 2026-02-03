/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  FaMicrophone,
  FaPaperPlane,
  FaPaperclip,
  FaPlay,
  FaPause,
  FaRegTrashAlt,
} from "react-icons/fa";
import { ChatMessage, ChatUser, fakeMessages, fakeUsers } from "./FakeData";
import AudioWaveform from "./AudioWaveform";
type Props = {
  locale?: string;
};

type RecordingState =
  | { status: "idle" }
  | { status: "recording"; startedAt: number }
  | { status: "preview"; audioUrl: string; durationSeconds: number };

const getUserById = (users: ChatUser[], id: string) =>
  users.find((u) => u.id === id) ?? users[0];

const ChatUI: React.FC<Props> = ({ locale }) => {
  const [users] = useState<ChatUser[]>(fakeUsers);
  const [activeUserId, setActiveUserId] = useState<string>("u2");
  const [messages, setMessages] = useState<ChatMessage[]>(fakeMessages);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(
    null
  );
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [viewImageCaption, setViewImageCaption] = useState<string | null>(null);
  const [recording, setRecording] = useState<RecordingState>({
    status: "idle",
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const attachWrapperRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const hasText = text.trim().length > 0;
  const canSend =
    hasText || !!imageFile || !!documentFile || recording.status === "preview";
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const discardRecordingRef = useRef(false);
  const sendRecordingImmediatelyRef = useRef(false);
  const [waveHeights, setWaveHeights] = useState<number[]>(() =>
    Array.from({ length: 14 }, () => 4)
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array | null>(null);
  const waveAnimationFrameRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  const t = useTranslations("chat");
  const me = users[0]; // first fake user is "You"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Build preview URLs for the currently selected image or document so we can show them inline
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  useEffect(() => {
    if (!documentFile) {
      setDocumentPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      return;
    }

    const url = URL.createObjectURL(documentFile);
    setDocumentPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [documentFile]);

  // Close attachment dropdown when clicking outside
  useEffect(() => {
    if (!showAttachMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachWrapperRef.current &&
        !attachWrapperRef.current.contains(event.target as Node)
      ) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttachMenu]);

  const handleScrollTopLoadMore = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0) {
      setVisibleCount((prev) => {
        const next = prev + 20;
        return next > messages.length ? messages.length : next;
      });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    setText(el.value);

    // Auto-resize up to 5 rows, then allow scroll
    el.style.height = "auto";
    const lineHeight =
      parseInt(window.getComputedStyle(el).lineHeight || "20", 10) || 20;
    const maxHeight = lineHeight * 5;
    const nextHeight = Math.min(el.scrollHeight, maxHeight);

    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const formatSeconds = (totalSeconds: number | undefined) => {
    const safeSeconds = totalSeconds && totalSeconds > 0 ? totalSeconds : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        void handleSend();
        // Ensure focus stays on the textarea after sending
        textareaRef.current?.focus();
      }
    }
  };

  const startWaveAnimation = () => {
    const analyser = analyserRef.current;
    const dataArray = analyserDataRef.current;

    if (!analyser || !dataArray) return;

    const animate = () => {
      if (recording.status !== "recording" || isRecordingPaused) {
        waveAnimationFrameRef.current = null;
        return;
      }

      (
        analyser as unknown as {
          getByteTimeDomainData: (array: Uint8Array) => void;
        }
      ).getByteTimeDomainData(dataArray);

      // Compute a simple volume value from the waveform
      let sum = 0;
      for (let i = 0; i < dataArray.length; i += 4) {
        const v = dataArray[i] - 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / (dataArray.length / 4));
      const normalized = Math.min(1, rms / 40 || 0);

      setWaveHeights(() =>
        Array.from({ length: 14 }, (_, i) => {
          const randomness = 0.4 + (i % 3) * 0.2;
          const base = 4;
          const maxExtra = 18;
          return base + maxExtra * normalized * randomness;
        })
      );

      waveAnimationFrameRef.current = window.requestAnimationFrame(animate);
    };

    if (waveAnimationFrameRef.current == null) {
      waveAnimationFrameRef.current = window.requestAnimationFrame(animate);
    }
  };

  // reserved for potential future static wave styling for messages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getMessageWaveHeights = (barsCount: number) =>
    Array.from({ length: barsCount }, () => 12);

  const handleSend = async () => {
    if (!text && !imageFile && !documentFile && recording.status !== "preview")
      return;

    const newMessages: ChatMessage[] = [];
    const base: Omit<ChatMessage, "id"> = {
      userId: me.id,
      type: "text",
      content: text || "",
      createdAt: new Date().toISOString(),
    };

    if (text) {
      newMessages.push({
        ...base,
        id: `m-${Date.now()}-text`,
        type: "text",
      });
    }

    if (imageFile) {
      const imageUrl = imagePreviewUrl ?? URL.createObjectURL(imageFile);
      newMessages.push({
        ...base,
        id: `m-${Date.now()}-img`,
        type: "image",
        imageUrl,
        // Use main text input as optional caption for the image
        content: text || "",
      });
    }

    if (documentFile && documentPreviewUrl) {
      newMessages.push({
        ...base,
        id: `m-${Date.now()}-doc`,
        type: "document",
        content: t("attachmentDocumentPrefix"),
        fileName: documentFile.name,
        documentUrl: documentPreviewUrl,
      });
    }

    if (recording.status === "preview") {
      newMessages.push({
        ...base,
        id: `m-${Date.now()}-audio`,
        type: "audio",
        audioUrl: recording.audioUrl,
        durationSeconds: recording.durationSeconds,
        content: "",
      });
    }

    setMessages((prev) => [...prev, ...newMessages]);
    setText("");
    setImageFile(null);
    setDocumentFile(null);
    setRecording({ status: "idle" });
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
      textareaRef.current.focus();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = "";
      return;
    }

    // Ensure only image files are accepted from the device picker
    if (!file.type.startsWith("image/")) {
      toast.error(t("errorsImagesOnly"));
      e.target.value = "";
      return;
    }

    const isSvg =
      file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

    if (isSvg) {
      toast.error(t("errorsSvgNotSupported"));
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setShowAttachMenu(false);
    e.target.value = "";
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = "";
      return;
    }

    const lower = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
    const isXlsx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      lower.endsWith(".xlsx");

    if (!isPdf && !isXlsx) {
      toast.error(t("errorsInvalidDocumentType"));
      e.target.value = "";
      return;
    }

    // Store document for preview; it will be sent when the user presses send
    setDocumentFile(file);
    setShowAttachMenu(false);
    e.target.value = "";
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(t("errorsAudioNotSupported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup Web Audio analyser to drive waveform based on mic volume
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      analyserDataRef.current = dataArray;
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      discardRecordingRef.current = false;
      sendRecordingImmediatelyRef.current = false;

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (waveAnimationFrameRef.current != null) {
          window.cancelAnimationFrame(waveAnimationFrameRef.current);
          waveAnimationFrameRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        analyserDataRef.current = null;
        setWaveHeights(Array.from({ length: 14 }, () => 4));

        if (discardRecordingRef.current) {
          audioChunksRef.current = [];
          setRecording({ status: "idle" });
          setRecordingSeconds(0);
          setIsRecordingPaused(false);
          discardRecordingRef.current = false;
          sendRecordingImmediatelyRef.current = false;
          return;
        }

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);
        const startedAt =
          recordingStartTimeRef.current ??
          (recording.status === "recording" ? recording.startedAt : Date.now());
        const durationSeconds = (Date.now() - startedAt) / 1000;
        const roundedDuration = Math.max(1, Math.round(durationSeconds));

        if (sendRecordingImmediatelyRef.current) {
          const base: Omit<ChatMessage, "id"> = {
            userId: me.id,
            type: "audio",
            content: "",
            createdAt: new Date().toISOString(),
          };

          const newMessage: ChatMessage = {
            ...base,
            id: `m-${Date.now()}-audio`,
            type: "audio",
            audioUrl,
            durationSeconds: roundedDuration,
          };

          setMessages((prev) => [...prev, newMessage]);
          setRecording({ status: "idle" });
          setText("");
          setImageFile(null);
        } else {
          setRecording({
            status: "preview",
            audioUrl,
            durationSeconds: roundedDuration,
          });
        }

        setRecordingSeconds(0);
        setIsRecordingPaused(false);
        discardRecordingRef.current = false;
        sendRecordingImmediatelyRef.current = false;
        recordingStartTimeRef.current = null;
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      const now = Date.now();
      recordingStartTimeRef.current = now;
      setRecording({ status: "recording", startedAt: now });
      setRecordingSeconds(0);
      setIsRecordingPaused(false);
    } catch (err) {
      console.error(err);
      toast.error(t("errorsAudioStartFailed"));
    }
  };

  const cancelAudioPreview = () => {
    if (recording.status === "preview") {
      URL.revokeObjectURL(recording.audioUrl);
    }
    setRecording({ status: "idle" });
    setIsPlayingPreview(false);
  };

  const togglePreviewPlayback = () => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
      return;
    }

    audio
      .play()
      .then(() => setIsPlayingPreview(true))
      .catch((err) => {
        console.error("Failed to play audio preview", err);
      });
  };

  const handleDiscardRecording = () => {
    if (mediaRecorderRef.current && recording.status === "recording") {
      discardRecordingRef.current = true;
      mediaRecorderRef.current.stop();
    } else {
      setRecording({ status: "idle" });
      setRecordingSeconds(0);
      setIsRecordingPaused(false);
    }
  };

  const handleStopAndSendRecording = () => {
    if (mediaRecorderRef.current && recording.status === "recording") {
      sendRecordingImmediatelyRef.current = true;
      mediaRecorderRef.current.stop();
    }
  };

  const togglePauseRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recording.status !== "recording") return;

    if (isRecordingPaused) {
      try {
        recorder.resume();
        setIsRecordingPaused(false);
      } catch (err) {
        console.error("Failed to resume recording", err);
      }
    } else {
      try {
        recorder.pause();
        setIsRecordingPaused(true);
      } catch (err) {
        console.error("Failed to pause recording", err);
      }
    }
  };

  useEffect(() => {
    if (recording.status !== "recording" || isRecordingPaused) return;

    const interval = window.setInterval(() => {
      if (recording.status === "recording") {
        const elapsed =
          (Date.now() -
            (typeof recording.startedAt === "number"
              ? recording.startedAt
              : Date.now())) /
          1000;
        setRecordingSeconds(Math.max(0, Math.round(elapsed)));
      }
    }, 500);

    startWaveAnimation();

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, isRecordingPaused]);

  const isRtl = locale === "ar";

  return (
    <div
      className="flex h-[calc(100dvh-60px)] items-stretch justify-center bg-[#eae6df] mt-[60px]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex h-full w-full  gap-0 overflow-hidden rounded-2xl ">
        {/* Sidebar users */}
        <aside className="hidden w-72 flex-col border-r border-black/10 bg-gray-50 md:flex">
      
          <div className="space-y-0.5 overflow-auto pe-1 bg-white">
            {users.map((u) => {
              const isActive = u.id === activeUserId;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setActiveUserId(u.id)}
                  className={`group flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-all ${
                    isActive
                      ? "bg-primary/5 text-primary border-s-l-4 border-primary"
                      : "bg-white text-slate-800 hover:bg-[#f5f6f6]"
                  }`}
                >
                  <div className="relative h-9 w-9">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      width={36}
                      height={36}
                      className="rounded-full border border-white object-cover shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
                  </div>
                  <div className="flex flex-1 flex-col items-start">
                    <span className="truncate text-[15px] font-medium">
                      {u.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {t("fakeConversation")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main chat area */}
        <section className="flex min-w-0 flex-1 flex-col bg-[#efeae2]">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-gray-50 px-5 py-3.5 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="relative h-10 w-10">
                  <img
                    src={getUserById(users, activeUserId).avatar}
                    alt={getUserById(users, activeUserId).name}
                    sizes="40px"
                    className="rounded-full border border-white object-cover shadow"
                  />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900">
                    {getUserById(users, activeUserId).name}
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {t("online")}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {t("subtitle")}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScrollTopLoadMore}
            className="flex-1 space-y-2 overflow-y-auto bg-[#efeae2] px-4 py-4"
          >
            {messages.slice(-visibleCount).map((m, index, sliced) => {
              const globalIndex = messages.length - sliced.length + index;
              const isMe = m.userId === me.id;
              const prev = globalIndex > 0 ? messages[globalIndex - 1] : null;
              const hasPrevSameUser = prev && prev.userId === m.userId;
              const isFirstOfGroup = !hasPrevSameUser;

              const getClipPath = () => {
                const leftTail =
                  "polygon(50% 0%, 100% 0, 100% 0, 0 100%, 0 100%, 0 100%, 0 0)";
                const rightTail =
                  "polygon(50% 0%, 100% 0, 100% 0, 99% 100%, 99% 100%, 100% 100%, 0 0)";

                // RTL
                if (isRtl) return isMe ? rightTail : leftTail;

                // LTR
                return isMe ? leftTail : rightTail;
              };

              return (
                <div
                  key={m.id}
                  className={`flex w-fit max-w-[50%]! gap-2 ${
                    isMe ? " flex-row-reverse ms-auto" : ""
                  } `}
                >
                  <div
                    className={`group relative inline-flex max-w-full flex-col px-3 py-1.5 text-sm shadow-sm
                    ${
                      isMe
                        ? "bg-[#d9fdd3] text-slate-900"
                        : "bg-white text-slate-900"
                    }
                  rounded-xl  `}
                  >
                    {isFirstOfGroup && (
                      <span
                        className={`pointer-events-none absolute top-0 h-10 w-10 
                          ${isMe ? "-end-2" : " -start-2 "}`}
                        style={{
                          background: isMe ? "#d9fdd3" : "#ffffff",
                          clipPath: getClipPath(),
                        }}
                      />
                    )}
                    <div className="relative z-10">
                      {m.type === "text" && (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                      {m.type === "image" && (
                        <div className="space-y-1">
                          {m.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setViewImageUrl(m.imageUrl || null);
                                setViewImageCaption(m.content || null);
                              }}
                              className="relative block max-h-64 w-56 overflow-hidden rounded-lg border border-black/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <img
                                src={m.imageUrl}
                                alt={m.content || "image"}
                                width={224}
                                height={256}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          )}
                          {m.content && (
                            <p className="whitespace-pre-wrap text-xs opacity-80">
                              {m.content}
                            </p>
                          )}
                        </div>
                      )}
                      {m.type === "audio" && m.audioUrl && (
                        <div className="mt-0.5 flex items-center gap-2">
                          <AudioWaveform
                            src={m.audioUrl}
                            durationSeconds={m.durationSeconds}
                          />
                        </div>
                      )}
                      {m.type === "document" && m.documentUrl && (
                        <a
                          href={m.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex max-w-xs items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-900 hover:bg-emerald-100"
                        >
                          <span className="text-base">📄</span>
                          <span className="truncate">
                            {m.fileName || t("attachmentDocument")}
                          </span>
                        </a>
                      )}
                      <div
                        className={`mt-0.5 text-[10px] opacity-60 ${
                          isMe
                            ? isRtl
                              ? "text-left"
                              : "text-right"
                            : "text-left"
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-black/5 bg-gray-50 px-4 py-2">
            {/* Image preview shown just above the textarea */}
            {recording.status !== "recording" &&
              imageFile &&
              imagePreviewUrl && (
                <div className="mb-1.5 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={imagePreviewUrl}
                      alt={imageFile.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span className="truncate text-xs text-slate-600">
                      {t("imageReady")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs hover:bg-slate-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

            {/* Document preview shown just above the textarea */}
            {recording.status !== "recording" &&
              documentFile &&
              documentPreviewUrl && (
                <div className="mb-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-base">
                    📄
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <a
                      href={documentPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-emerald-800 underline-offset-2 hover:underline"
                    >
                      {documentFile.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => setDocumentFile(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs hover:bg-slate-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

            {recording.status === "recording" && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs text-slate-900 shadow-sm">
                <button
                  type="button"
                  onClick={handleDiscardRecording}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <FaRegTrashAlt className="text-sm" />
                </button>

                <div className="mx-3 flex flex-1 items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>{formatSeconds(recordingSeconds)}</span>
                  <div className="mx-2 flex flex-1 items-center justify-center gap-0.5">
                    {(waveHeights.length
                      ? waveHeights
                      : Array.from({ length: 14 }, () => 4)
                    ).map((h, i) => (
                      <span
                        key={i}
                        className="w-0.5 rounded-full bg-emerald-400/80"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={togglePauseRecording}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-emerald-600 hover:bg-emerald-50"
                  >
                    {isRecordingPaused ? (
                      <FaPlay className="ms-0.5 text-sm" />
                    ) : (
                      <FaPause className="text-sm" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopAndSendRecording}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            {recording.status === "preview" && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-[#202c33] px-3 py-2 text-xs text-white">
                <audio
                  ref={audioPreviewRef}
                  src={recording.audioUrl}
                  className="hidden"
                  onEnded={() => setIsPlayingPreview(false)}
                />

                <button
                  type="button"
                  onClick={cancelAudioPreview}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  <FaRegTrashAlt className="text-sm" />
                </button>

                <div className="mx-3 flex flex-1 items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>{formatSeconds(recording.durationSeconds)}</span>
                  <div className="mx-2 h-px flex-1 border-t border-dashed border-white/30" />
                </div>

                <button
                  type="button"
                  onClick={togglePreviewPlayback}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-white hover:bg-white/10"
                >
                  {isPlayingPreview ? (
                    <FaPause className="text-sm" />
                  ) : (
                    <FaPlay className="ms-0.5 text-sm" />
                  )}
                </button>
              </div>
            )}

            {recording.status !== "recording" && (
              <div className="flex items-end ">
                {/* Left actions (attach) with dropdown */}
                <div
                  ref={attachWrapperRef}
                  className="relative flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-slate-500 transition hover:text-emerald-500"
                  >
                    <FaPaperclip className="text-lg" />
                  </button>

                  {showAttachMenu && (
                    <div className="absolute bottom-12 left-0 z-30 w-48 rounded-xl border border-black/5 bg-white py-1 text-sm text-slate-800 shadow-lg animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false);
                          imageInputRef.current?.click();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <span>{t("attachmentPhotosAndVideos")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false);
                          documentInputRef.current?.click();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <span>{t("attachmentDocument")}</span>
                      </button>
                    </div>
                  )}

                  {/* Hidden file inputs for image and document */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.ico,.tif,.tiff,.heic"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    onChange={handleDocumentChange}
                  />
                </div>
                <textarea
                  ref={textareaRef}
                  value={text}
                  name="message"
                  onChange={handleTextChange}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder={t("placeholderMessage")}
                  rows={1}
                  className="flex-1 resize-none  px-4 py-2 text-sm text-slate-900  outline-none placeholder:text-slate-400 focus:border-emerald-500"
                />

                <div className="flex items-center gap-1.5">
                  {/* Voice record / Send toggle */}
                  {canSend ? (
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!canSend}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-200"
                    >
                      <FaPaperPlane className="text-base" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-200"
                      onClick={startRecording}
                    >
                      <FaMicrophone className="text-lg" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Image viewer popup for sent images */}
      {viewImageUrl && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80"
          onClick={() => {
            setViewImageUrl(null);
            setViewImageCaption(null);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewImageUrl}
              alt={viewImageCaption || "image"}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl bg-black"
            />
            {viewImageCaption && (
              <div className="mt-3 max-w-[90vw] rounded-xl bg-black/70 px-3 py-2 text-xs text-slate-100 whitespace-pre-wrap">
                {viewImageCaption}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setViewImageUrl(null);
                setViewImageCaption(null);
              }}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-slate-100 text-sm hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatUI;
