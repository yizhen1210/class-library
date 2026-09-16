import React from "react";
import { Flame } from "lucide-react";

export default function PopularRanking({ topBooks, onSelectBook }) {
  if (!topBooks || topBooks.length === 0) return null;

  return (
    <div className="mb-8 glass-panel border border-rose-900/40 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <h2 className="text-lg sm:text-xl font-black text-rose-400 flex items-center mb-4 tracking-wider drop-shadow-sm">
        <Flame className="w-6 h-6 mr-2 text-rose-500" />
        人氣排行榜
        <span className="text-xs text-rose-600/80 ml-2 font-bold">最多人借閱</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {topBooks.map((item, index) => {
          const { book, count } = item;
          const isAvailable = book.status === "available";

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="flex items-center p-3 rounded-xl bg-black/40 border border-slate-800 hover:border-amber-700/50 cursor-pointer transition-all hover:bg-slate-800/40 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-black font-black flex items-center justify-center shrink-0 mr-3 text-sm shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                {index + 1}
              </div>

              <div className="overflow-hidden grow pr-2">
                <p className="text-sm font-bold text-slate-200 group-hover:text-amber-300 truncate">
                  {book.title}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {book.author} ·{" "}
                  <span className="text-amber-400 font-medium">{count} 人借過</span>
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-md shrink-0 font-bold ${
                  isAvailable
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"
                    : "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                }`}
              >
                {isAvailable ? "可借" : "已借出"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

