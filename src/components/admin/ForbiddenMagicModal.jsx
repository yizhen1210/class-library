import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ForbiddenMagicModal({
  isOpen,
  isResetting,
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel border-2 border-rose-700 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(225,29,72,0.4)] relative text-center animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-900 via-rose-500 to-rose-900 rounded-t-3xl" />

        <h2 className="text-2xl sm:text-3xl font-black text-rose-500 mb-5 flex items-center justify-center drop-shadow-md tracking-widest">
          <AlertTriangle className="w-8 h-8 mr-3" />
          禁忌魔法警告
        </h2>

        <p className="text-slate-200 mb-8 text-sm sm:text-base font-medium leading-relaxed">
          您即將歸零{" "}
          <strong className="text-rose-400 text-lg mx-1">所有學徒的魔力值</strong>
          <br />
          並銷毀{" "}
          <strong className="text-rose-400 text-lg mx-1">全部的修行日誌</strong>。
          <br />
          <br />
          確定要釋放這個無法逆轉的魔法嗎？
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="flex-1 py-3 sm:py-4 bg-black/50 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition-colors border border-slate-600 disabled:opacity-50 text-sm sm:text-base tracking-widest"
          >
            取消施法
          </button>
          <button
            onClick={onConfirm}
            disabled={isResetting}
            className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-rose-50 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(225,29,72,0.5)] disabled:opacity-50 flex items-center justify-center text-sm sm:text-base tracking-widest"
          >
            {isResetting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "確認摧毀"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

