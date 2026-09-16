import React, { useState } from "react";
import { X, BookOpen, Plus } from "lucide-react";

export default function AddBookModal({ isOpen, categories, onAddBook, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    copies: 1
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAddBook(formData);
    setFormData({ title: "", author: "", category: "", copies: 1 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel border-2 border-emerald-700 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(4,120,87,0.3)] relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2 flex items-center justify-center drop-shadow-md">
          <BookOpen className="w-6 h-6 mr-3" />
          收錄新魔導書
        </h2>

        <p className="text-slate-300 text-center mb-6 text-sm sm:text-base">
          為魔法書局增添新的知識卷軸吧！
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-bold text-emerald-500/80 mb-2">
              書名 (必填)：
            </label>
            <input
              type="text"
              placeholder="例如：哈利波特"
              required
              className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-emerald-500/80 mb-2">
              作者：
            </label>
            <input
              type="text"
              placeholder="例如：J.K. 羅琳"
              className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-emerald-500/80 mb-2">
              類別：
            </label>
            <select
              className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none shadow-inner cursor-pointer"
              value={formData.category || categories[0]?.name || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-emerald-500/80 mb-2">
              複本數量（同一本有幾本一樣的，可分開借）：
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
              value={formData.copies}
              onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              填 1 就是一般單本；填 2 以上會自動建立多本同名複本。
            </p>
          </div>

          <button
            type="submit"
            disabled={!formData.title.trim()}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all text-lg ${
              formData.title.trim()
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_20px_rgba(4,120,87,0.5)] border border-emerald-300"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            }`}
          >
            <Plus className="w-6 h-6 mr-2" />
            確認收錄
          </button>
        </form>
      </div>
    </div>
  );
}

