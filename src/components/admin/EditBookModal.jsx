import React, { useState, useEffect } from "react";
import { X, Edit3, Check } from "lucide-react";
import { BOOK_COVERS } from "../../constants/bookCovers";

export default function EditBookModal({ isOpen, book, categories, onSave, onClose }) {
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    if (book) {
      setEditingBook({ ...book });
    }
  }, [book]);

  if (!isOpen || !editingBook) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingBook.title.trim()) return;
    onSave(editingBook);
    onClose();
  };

  const categoryNames = categories.map((c) => c.name);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel border-2 border-amber-700 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(217,119,6,0.3)] relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2 flex items-center justify-center drop-shadow-md">
          <Edit3 className="w-6 h-6 mr-3" />
          編輯魔導書
        </h2>

        <p className="text-slate-300 text-center mb-6 text-sm sm:text-base">
          修改這本書的資料。
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-bold text-amber-500/80 mb-2">
              書名：
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
              value={editingBook.title}
              onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-500/80 mb-2">
              作者：
            </label>
            <input
              type="text"
              className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
              value={editingBook.author}
              onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-500/80 mb-2">
              類別：
            </label>
            <select
              className="w-full bg-slate-900/80 border-2 border-slate-700 text-slate-100 rounded-xl p-3.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 appearance-none shadow-inner cursor-pointer"
              value={editingBook.category}
              onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
            >
              {!categoryNames.includes(editingBook.category) && editingBook.category && (
                <option value={editingBook.category}>
                  {editingBook.category}（目前）
                </option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-500/80 mb-2">
              封面顏色：
            </label>
            <div className="flex flex-wrap gap-2.5">
              {BOOK_COVERS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setEditingBook({ ...editingBook, cover: color, coverLocked: true })}
                  className={`w-9 h-9 rounded-lg ${color} border-2 transition-all ${
                    editingBook.coverLocked && editingBook.cover === color
                      ? "border-amber-300 scale-110 shadow-[0_0_10px_rgba(217,119,6,0.6)]"
                      : "border-black/40 hover:border-amber-700"
                  }`}
                  title={color}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => setEditingBook({ ...editingBook, coverLocked: false })}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                  editingBook.coverLocked
                    ? "text-slate-400 bg-black/30 border-slate-700 hover:border-emerald-700/50"
                    : "text-emerald-300 bg-emerald-900/30 border-emerald-700/50"
                }`}
              >
                恢復自動配色
              </button>
              <span className="text-xs text-slate-500">
                {editingBook.coverLocked
                  ? "已鎖定：儲存後顯示你選的顏色"
                  : "自動配色：依館藏位置自動上色"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!editingBook.title.trim()}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all text-lg ${
              editingBook.title.trim()
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.5)] border border-amber-300"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            }`}
          >
            <Check className="w-6 h-6 mr-2" />
            儲存變更
          </button>
        </form>
      </div>
    </div>
  );
}

