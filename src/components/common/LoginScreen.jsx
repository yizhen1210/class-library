import React from "react";
import { BookOpen } from "lucide-react";

export default function LoginScreen({ onLogin, errorMessage }) {
  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center font-sans p-4 overflow-hidden z-50">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900/90 to-black/90 border-2 border-amber-900/60 rounded-3xl p-8 shadow-[0_0_50px_rgba(217,119,6,0.25)] text-center animate-in zoom-in-95 duration-300">
        <div className="inline-flex items-center justify-center p-4 bg-black/60 rounded-full border-2 border-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.5)] mb-5">
          <BookOpen className="w-9 h-9 text-amber-400" />
        </div>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 tracking-widest mb-2">
          班級魔法書局
        </h1>
        <p className="text-amber-500/70 text-sm mb-8 font-medium">
          請用授權的 Google 帳號登入以開啟書局。
        </p>

        {errorMessage && (
          <p className="text-rose-400 text-sm mb-4 font-bold bg-rose-950/40 py-2 px-3 rounded-lg border border-rose-900 leading-relaxed">
            {errorMessage}
          </p>
        )}

        <button
          onClick={onLogin}
          className="w-full bg-white hover:bg-slate-100 text-slate-800 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-slate-300 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          使用 Google 帳號登入
        </button>
      </div>
    </div>
  );
}

