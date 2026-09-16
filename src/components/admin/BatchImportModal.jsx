import React, { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";

export default function BatchImportModal({
  isOpen,
  onImport,
  onClose
}) {
  const [inputText, setInputText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage("匯入中…");

    try {
      const result = await onImport(inputText);
      setStatusMessage(`成功匯入 ${result.totalBooks} 本書（共 ${result.totalTitles} 筆書目）。`);
      setInputText("");
    } catch (err) {
      console.error("批量匯入失敗:", err);
      setStatusMessage(err.message || "匯入失敗，請檢查格式或稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel border-2 border-indigo-700 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_40px_rgba(79,70,229,0.3)] relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-300 mb-2 flex items-center justify-center drop-shadow-md">
          <Upload className="w-6 h-6 mr-3" />
          批量收錄魔導書
        </h2>

        <p className="text-slate-300 text-center mb-4 text-sm">
          可直接貼上多行書目文字，系統將自動解析並批量新增。
        </p>

        <div className="bg-black/50 p-3.5 rounded-xl border border-indigo-900/60 text-xs text-indigo-200 mb-4 leading-relaxed font-mono">
          <p className="font-bold text-amber-300 mb-1">格式說明（每行一筆，以斜線 / 分隔）：</p>
          <p>書名 / 作者 / 類別 / 複本數量</p>
          <p className="text-slate-400 mt-1">例如：</p>
          <p className="text-slate-300">哈利波特：神秘的魔法石 / J.K. 羅琳 / 奇幻小說 / 3</p>
          <p className="text-slate-300">科學實驗王1 / 科學漫畫家 / 科學實驗王 / 1</p>
        </div>

        <textarea
          rows={7}
          placeholder="在此貼上多筆書目..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner font-mono"
        />

        {statusMessage && (
          <p className="mt-3 text-sm font-bold text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40">
            {statusMessage}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors border border-slate-600 text-sm"
          >
            關閉
          </button>
          <button
            onClick={handleImport}
            disabled={!inputText.trim() || isSubmitting}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-700 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50 flex items-center justify-center text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "開始批量匯入"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

