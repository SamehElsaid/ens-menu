"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ensmenu_chat_session_id";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

function getServerSnapshot(): string {
  return "";
}

function subscribe() {
  return () => {};
}

export function useChatSession() {
  return useSyncExternalStore(
    subscribe,
    getOrCreateSessionId,
    getServerSnapshot,
  );
}
