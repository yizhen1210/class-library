import React from "react";
import { Star, ChevronLeft } from "lucide-react";

export default function WizardList({ students, onSelectWizard }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 animate-in fade-in duration-500">
      {students.map((student) => (
        <div
          key={student.id}
          onClick={() => onSelectWizard(student.id)}
          className="bg-gradient-to-br from-indigo-950/80 to-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-indigo-500/30 p-5 sm:p-7 cursor-pointer hover:border-indigo-400 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="text-4xl sm:text-5xl bg-black/40 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] border border-indigo-900/50 shrink-0 group-hover:scale-110 transition-transform">
              {student.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-indigo-100 flex items-center truncate tracking-wide">
                <span className="bg-black/60 text-indigo-400 text-sm sm:text-base font-black px-3 py-1 rounded-md border border-indigo-900 mr-3 shrink-0 shadow-inner">
                  {student.seatNumber}號
                </span>
                <span className="truncate">{student.name}</span>
              </h3>
              <p className="text-sm sm:text-base text-indigo-300/70 flex items-center mt-2 font-medium">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-amber-400 shrink-0 drop-shadow-sm" />
                魔力值：{student.magicPoints}
              </p>
            </div>
          </div>
          <ChevronLeft className="w-6 h-6 text-indigo-500/50 rotate-180 shrink-0 ml-2 group-hover:text-indigo-400 transition-colors" />
        </div>
      ))}
    </div>
  );
}
