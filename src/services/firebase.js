import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCvzbKB-n4yPvgsXsgLHz5w6bZcaMtgzdQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "class-library-7b9ca.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "class-library-7b9ca",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "class-library-7b9ca.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1087050073299",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1087050073299:web:2a0cb73db7f2178e2ac026"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

