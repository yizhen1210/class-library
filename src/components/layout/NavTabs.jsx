import React from "react";
import { BookOpen, User, Settings } from "lucide-react";

export default function NavTabs({ activeTab, onSelectTab, isDetailOpen }) {
  return (
    <nav className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-10">
      <button
        onClick={() => onSelectTab("library")}
        className={`flex items-center px-5 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-300 font-bold tracking-widest text-sm sm:text-base ${
          activeTab === "library" && !isDetailOpen
            ? "bg-gradient-to-r from-amber-700 to-amber-500 text-amber-50 shadow-[0_0_25px_rgba(217,119,6,0.6)] border border-amber-300 scale-105"
            : "glass-panel text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-700/50 hover:bg-slate-800/80 hover:-translate-y-1"
        }`}
      >
        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
        魔導書庫
      </button>

      <button
        onClick={() => onSelectTab("wizards")}
        className={`flex items-center px-5 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-300 font-bold tracking-widest text-sm sm:text-base ${
          activeTab === "wizards" || isDetailOpen
            ? "bg-gradient-to-r from-indigo-700 to-indigo-500 text-indigo-50 shadow-[0_0_25px_rgba(79,70,229,0.6)] border border-indigo-300 scale-105"
            : "glass-panel text-slate-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-700/50 hover:bg-slate-800/80 hover:-translate-y-1"
        }`}
      >
        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
        魔法學徒
      </button>

      <button
        onClick={() => onSelectTab("admin")}
        className={`flex items-center px-5 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all duration-300 font-bold tracking-widest text-sm sm:text-base ${
          activeTab === "admin"
            ? "bg-gradient-to-r from-rose-800 to-rose-600 text-rose-50 shadow-[0_0_25px_rgba(190,18,60,0.6)] border border-rose-300 scale-105"
            : "glass-panel text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/50 hover:bg-slate-800/80 hover:-translate-y-1"
        }`}
      >
        <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
        中控室
      </button>
    </nav>
  );
}
