import React from "react";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="text-center mt-16 pb-12 opacity-80 hover:opacity-100 transition-opacity">
      <p className="text-amber-500/80 font-bold tracking-[0.2em] text-sm sm:text-base flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-amber-400/50" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600">
          Created by 怡臻老師
        </span>
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-3 text-amber-400/50" />
      </p>
    </footer>
  );
}

