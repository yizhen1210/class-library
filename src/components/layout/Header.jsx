import React from "react";
import { Book } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center mb-10 sm:mb-14 mt-4 sm:mt-8 relative flex justify-center px-4 animate-in slide-in-from-top-10 duration-700">
      <div className="absolute -top-4 sm:-top-8 left-[15%] sm:left-[25%] md:left-[30%] w-2 h-12 sm:h-16 border-x-[4px] border-slate-500/80 border-dotted opacity-90 shadow-2xl" />
      <div className="absolute -top-4 sm:-top-8 right-[15%] sm:right-[25%] md:right-[30%] w-2 h-12 sm:h-16 border-x-[4px] border-slate-500/80 border-dotted opacity-90 shadow-2xl" />
      <div className="relative bg-gradient-to-b from-[#5c3a21] via-[#3e2312] to-[#241107] border-y-4 border-x-2 border-[#1a0b04] rounded-2xl py-6 sm:py-8 px-6 sm:px-12 md:px-20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full sm:w-auto overflow-hidden">
        <div className="absolute inset-0 wood-texture opacity-30 mix-blend-multiply" />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-br from-slate-300 to-slate-600 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.8)] border border-slate-700" />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-br from-slate-300 to-slate-600 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.8)] border border-slate-700" />
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-br from-slate-300 to-slate-600 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.8)] border border-slate-700" />
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-br from-slate-300 to-slate-600 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.8)] border border-slate-700" />
        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-black/60 rounded-full border-2 border-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.6)] mb-3 sm:mb-4 relative z-10">
          <Book className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
        </div>
        <h1 className="relative z-10 text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] tracking-[0.1em] sm:tracking-[0.15em] py-1">
          霍格華茲班級魔法書局
        </h1>
        <p className="relative z-10 text-amber-400/80 mt-3 sm:mt-4 font-bold tracking-widest drop-shadow-md text-xs sm:text-sm md:text-base">
          每翻開一頁，都是一次靈魂的魔法修行。
        </p>
      </div>
    </header>
  );
}
