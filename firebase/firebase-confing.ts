// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCz7GcfG1X3mZjCCX7Er1K6MA_o8mLiCe8",
  authDomain: "ens-staff.firebaseapp.com",
  projectId: "ens-staff",
  storageBucket: "ens-staff.firebasestorage.app",
  messagingSenderId: "1021433211661",
  appId: "1:1021433211661:web:032b75c20714c889109e44",
  measurementId: "G-GGMTF0WRSR" 
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);


const messaging = getMessaging(firebase);


export const generateToken = async () => {

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_KEY_PAIR || "" });
    return token;
  }
};
