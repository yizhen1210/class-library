import React from "react";
import { Wand2, BookMarked, Sparkles } from "lucide-react";

export default function WizardList({ students, books, onSelectWizard }) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-indigo-300 flex items-center tracking-wider drop-shadow-md">
            <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-indigo-400" />
            魔法學徒名冊
            <span className="text-base sm:text-lg text-indigo-400 ml-3 font-bold">
              ({students.length} 位)
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            點擊學徒頭像或名字，檢視個人修行日誌或進行還書／挑書。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {students.map((student) => {
          const activeBorrows = books.filter((b) => b.borrowerId === student.id);

          return (
            <div
              key={student.id}
              onClick={() => onSelectWizard(student.id)}
              className="glass-panel border border-indigo-900/40 rounded-2xl p-5 sm:p-6 cursor-pointer hover:border-indigo-400 hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  {student.avatar}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                      {student.seatNumber} 號
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-100 group-hover:text-indigo-200 transition-colors truncate mt-1">
                    {student.name}
                  </h3>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4 mr-1 text-amber-400/80" />
                  {student.magicPoints || 0} 魔力
                </div>

                <div className="flex items-center text-xs font-bold text-slate-400">
                  <BookMarked className="w-4 h-4 mr-1 text-slate-500" />
                  {activeBorrows.length > 0 ? (
                    <span className="text-indigo-300 font-black">借閱中: {activeBorrows.length}</span>
                  ) : (
                    "無借閱"
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

