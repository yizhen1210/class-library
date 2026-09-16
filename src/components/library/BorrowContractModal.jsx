import React from "react";
import { X, Scroll, Sparkles } from "lucide-react";

export default function BorrowContractModal({
  isOpen,
  book,
  students,
  selectedStudentId,
  onSelectStudent,
  onConfirm,
  onClose
}) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel border-2 border-[#8b6508] rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(217,119,6,0.3)] relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2 flex items-center justify-center drop-shadow-md">
          <Scroll className="w-6 h-6 mr-3" />
          簽訂借閱契約
        </h2>

        <p className="text-slate-300 text-center mb-6 text-sm sm:text-base">
          請選擇要喚醒這本魔導書的學徒。
        </p>

        <div className="mb-6 p-5 bg-black/40 rounded-xl border border-amber-900/50 text-center shadow-inner">
          <span className="block text-sm text-slate-400 mb-2">目標魔導書</span>
          <span className="text-xl font-bold text-amber-200 tracking-wide drop-shadow-sm">
            {book.title}
          </span>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-amber-500/80 mb-3">
            選擇學徒：
          </label>
          <select
            className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 appearance-none shadow-inner cursor-pointer"
            value={selectedStudentId}
            onChange={(e) => onSelectStudent(e.target.value)}
          >
            <option value="" disabled>
              -- 點擊選擇學徒 --
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.seatNumber}號 - {s.avatar} {s.name} (魔力: {s.magicPoints})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onConfirm}
          disabled={!selectedStudentId}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all text-lg ${
            selectedStudentId
              ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.6)] border border-amber-300"
              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-6 h-6 mr-2" />
          確認締結契約
        </button>
      </div>
    </div>
  );
}
