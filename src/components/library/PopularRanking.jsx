import React from "react";
import { Star } from "lucide-react";

export default function PopularRanking({ topBooks }) {
  if (!topBooks || topBooks.length === 0) return null;

  return (
    <div className="mb-8 glass-panel border border-rose-900/40 rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <h2 className="text-lg sm:text-xl font-black text-rose-400 flex items-center mb-4 tracking-wider drop-shadow-sm">
        <Star className="w-6 h-6 mr-2 text-rose-500" />
        人氣排行榜
        <span className="text-xs text-rose-600/80 ml-2 font-bold">最多人借閱</span>
      </h2>

      <div>
        {topBooks.map((item, idx) => {
          const barColor =
            idx === 0
              ? "bg-amber-400"
              : idx === 1
              ? "bg-slate-300"
              : idx === 2
              ? "bg-orange-400"
              : "bg-rose-500";
          const percent = Math.max(8, Math.round((item.count / topBooks[0].count) * 100));

          return (
            <div
              key={item.book.id}
              className="flex items-center gap-3 sm:gap-4 py-3 border-b border-white/5 last:border-0"
            >
              <span className="shrink-0 w-9 text-center font-black text-2xl sm:text-3xl">
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (
                  <span className="text-slate-500 text-xl">{idx + 1}</span>
                )}
              </span>

              <span className="flex-1 min-w-0 truncate font-bold text-slate-100 text-sm sm:text-lg">
                {item.book.title}
              </span>

              <div className="shrink-0 w-24 sm:w-44 flex items-center gap-2 sm:gap-3">
                <div className="flex-1 h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs sm:text-sm font-black text-rose-200 tabular-nums w-12 text-right">
                  {item.count} 人
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
