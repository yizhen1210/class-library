import React from "react";
import { User, Sparkles, BookOpen, Lock } from "lucide-react";

export default function BookCard({
  book,
  coverClass,
  isAvailable,
  borrowerName,
  pickingStudentId,
  pickingStudentName,
  onCardClick
}) {
  return (
    <div
      onClick={isAvailable ? onCardClick : undefined}
      className={`glass-panel border border-[#8b6508]/30 rounded-2xl overflow-hidden transition-all duration-300 group shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col ${
        isAvailable
          ? "cursor-pointer select-none hover:border-amber-400/80 hover:shadow-[0_15px_40px_rgba(217,119,6,0.25)] hover:-translate-y-1 active:translate-y-0"
          : "opacity-90"
      }`}
    >
      {/* 書脊與書皮封面 */}
      <div
        className={`h-28 sm:h-36 ${coverClass} flex items-center justify-center p-4 sm:p-5 relative shrink-0 book-spine`}
      >
        <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIGQ9Ik01MCAxMCBMODAgOTAgTDIwIDkwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] bg-repeat bg-center mix-blend-overlay" />
        <div className="absolute top-2 bottom-2 left-[12px] right-2 border border-white/10 rounded-sm pointer-events-none" />
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-50 text-center z-10 drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] line-clamp-2 leading-tight tracking-wider">
          {book.title}
        </h3>
      </div>

      {/* 書籍資訊與借閱狀態 */}
      <div className="p-5 sm:p-6 flex flex-col grow bg-gradient-to-b from-transparent to-black/40">
        <div className="mb-4">
          <span className="inline-block text-xs sm:text-sm font-bold px-3 py-1.5 rounded-md bg-black/50 text-amber-400 border border-amber-900/50 shadow-inner truncate max-w-full">
            {book.category}
          </span>
        </div>

        <p className="text-slate-300 text-sm sm:text-base mb-6 flex items-center grow font-medium">
          <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0 text-slate-500" />
          <span className="truncate">{book.author}</span>
        </p>

        {isAvailable ? (
          pickingStudentId ? (
            <div className="w-full py-3 bg-gradient-to-r from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400 text-white rounded-xl border border-indigo-400/50 transition-colors flex items-center justify-center font-bold text-sm sm:text-base shadow-[0_0_15px_rgba(79,70,229,0.5)] pointer-events-none">
              <Sparkles className="w-5 h-5 mr-2 shrink-0" />
              <span className="truncate tracking-wide">
                點我借給 {pickingStudentName}
              </span>
            </div>
          ) : (
            <div className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 group-hover:from-amber-600 group-hover:to-amber-500 text-amber-50 rounded-xl border border-amber-500/50 transition-colors flex items-center justify-center font-bold text-sm sm:text-base shadow-[0_0_15px_rgba(217,119,6,0.3)] pointer-events-none">
              <BookOpen className="w-5 h-5 mr-2 shrink-0" />
              <span className="tracking-wide">點我借閱</span>
            </div>
          )
        ) : (
          <div className="w-full py-3 bg-black/40 text-rose-400/80 rounded-xl border border-rose-900/30 flex items-center justify-center font-bold text-sm sm:text-base shadow-inner">
            <Lock className="w-5 h-5 mr-2 shrink-0" />
            <span className="truncate">被 {borrowerName} 借走</span>
          </div>
        )}
      </div>
    </div>
  );
}

