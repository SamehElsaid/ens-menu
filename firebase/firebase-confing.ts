import { initializeApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCz7GcfG1X3mZjCCX7Er1K6MA_o8mLiCe8",
  authDomain: "ens-staff.firebaseapp.com",
  projectId: "ens-staff",
  storageBucket: "ens-staff.firebasestorage.app",
  messagingSenderId: "1021433211661",
  appId: "1:1021433211661:web:032b75c20714c889109e44",
  measurementId: "G-GGMTF0WRSR"
};

const firebase = initializeApp(firebaseConfig);

const getMessagingInstance = (): Messaging | null => {
  if (typeof window === "undefined") return null;
  return getMessaging(firebase);
};

export const generateToken = async () => {
  const messaging = getMessagingInstance();
  if (!messaging) return;

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_KEY_PAIR || "" });
    return token;
  }
};

/** Returns the existing FCM token if notifications are already granted — never requests permission. */
export const getExistingFcmToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || Notification.permission !== "granted") return null;
  try {
    const messaging = getMessagingInstance();
    if (!messaging) return null;
    const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_KEY_PAIR || "" });
    return token || null;
  } catch {
    return null;
  }
};
