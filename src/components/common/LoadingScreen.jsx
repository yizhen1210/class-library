import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingScreen({ text = "喚醒雲端魔法陣中..." }) {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-amber-500 font-sans overflow-hidden z-50">
      <Loader2 className="w-16 h-16 animate-spin mb-4" />
      <h2 className="text-2xl font-bold tracking-widest">{text}</h2>
    </div>
  );
}

