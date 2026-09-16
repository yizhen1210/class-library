import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { loginWithGoogle, logout } from "../services/libraryService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setLoading(false);
      if (err?.code === "auth/unauthorized-domain") {
        setErrorMessage("此網域尚未授權，請到 Firebase 的「授權網域」加入本網站網址。");
      } else if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        setErrorMessage("登入視窗已關閉，請再試一次。");
      } else {
        setErrorMessage("登入失敗，請再試一次。");
      }
      console.error("登入失敗:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("登出失敗:", err);
    }
  };

  return {
    user,
    loading,
    errorMessage,
    handleLogin,
    handleLogout
  };
}

