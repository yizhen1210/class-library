import React, { useEffect } from "react";
import { Check } from "lucide-react";

export default function BorrowSuccessModal({ successInfo, onClose }) {
  useEffect(() => {
    if (!successInfo) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [successInfo, onClose]);

  if (!successInfo) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel border-2 border-emerald-400/60 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)]">
          <Check className="w-11 h-11 text-emerald-300" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-emerald-300 mb-3 tracking-wider drop-shadow-sm">
          借閱成功！
        </h3>

        <p className="text-slate-200 text-base sm:text-lg font-bold mb-1 break-all leading-snug">
          {successInfo.title}
        </p>

        {successInfo.student && (
          <p className="text-slate-400 text-sm sm:text-base mb-6">
            已借給 <span className="text-amber-300 font-bold">{successInfo.student}</span>
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl border border-emerald-300/50 transition-all font-black text-lg shadow-[0_10px_25px_rgba(4,120,87,0.4)]"
        >
          好的
        </button>

        <p className="text-xs text-slate-500 mt-3">3 秒後自動返回名冊…</p>
      </div>
    </div>
  );
}

