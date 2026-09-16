import React, { useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  Upload,
  Edit,
  Trash2,
  Unlock,
  AlertTriangle,
  FolderPlus,
  UserPlus,
  LogOut,
  Search,
  Calendar,
  Clock,
  Info
} from "lucide-react";
import { WIZARD_AVATARS } from "../../constants/avatars";
import { VALID_READING_INTERVALS } from "../../constants/readingSchedule";

export default function AdminDashboard({
  books,
  students,
  categories,
  holidays = [],
  onAddBookClick,
  onBatchImportClick,
  onEditBookClick,
  onDeleteBook,
  onForceReleaseBook,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddHoliday,
  onDeleteHoliday,
  onOpenResetModal,
  onLogout
}) {
  const [adminSearch, setAdminSearch] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");

  const filteredBooks = adminSearch
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
          b.author.toLowerCase().includes(adminSearch.toLowerCase()) ||
          b.category.toLowerCase().includes(adminSearch.toLowerCase())
      )
    : books;

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName("");
  };

  const handleAddHolidaySubmit = (e) => {
    e.preventDefault();
    if (!holidayDate) return;
    onAddHoliday(holidayDate, holidayName);
    setHolidayDate("");
    setHolidayName("");
  };

  const handleSaveRenameCategory = (cat) => {
    if (!editingCatName.trim()) return;
    onRenameCategory(cat.id, cat.name, editingCatName.trim());
    setEditingCatId(null);
    setEditingCatName("");
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-10">
      {/* 頂部標題與快捷動作 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-900/40 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-300 flex items-center tracking-wider drop-shadow-md">
            <SlidersHorizontal className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-rose-400" />
            中控管理室
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            管理魔導書庫藏書、學徒名冊與各項魔法系統設定。
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onAddBookClick}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 text-white rounded-xl font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            收錄新書
          </button>
          <button
            onClick={onBatchImportClick}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400 text-white rounded-xl font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex items-center"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            批量匯入
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs sm:text-sm border border-slate-600 transition-colors flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1.5 text-slate-400" />
            登出系統
          </button>
        </div>
      </div>

      {/* 區塊 1：分類卷軸管理 */}
      <div className="glass-panel border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-black text-amber-300 mb-4 flex items-center">
          <FolderPlus className="w-5 h-5 mr-2 text-amber-400" />
          魔導書分類卷軸管理 ({categories.length})
        </h3>

        <form onSubmit={handleAddCategorySubmit} className="flex gap-3 mb-5">
          <input
            type="text"
            placeholder="新增分類名稱（例如：科學漫畫、冒險故事）..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!newCatName.trim()}
            className="px-5 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors shrink-0"
          >
            新增分類
          </button>
        </form>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const count = books.filter((b) => b.category === cat.name).length;
            const isEditing = editingCatId === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-black/50 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-slate-200"
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editingCatName}
                      onChange={(e) => setEditingCatName(e.target.value)}
                      className="bg-slate-900 border border-amber-500 rounded px-2 py-0.5 text-xs text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRenameCategory(cat)}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="text-slate-400 hover:underline"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-amber-200">{cat.name}</span>
                    <span className="text-slate-500">({count} 本)</span>
                    <button
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditingCatName(cat.name);
                      }}
                      className="text-slate-400 hover:text-amber-300 ml-1"
                      title="改名"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id, cat.name)}
                      className="text-slate-400 hover:text-rose-400"
                      title="刪除分類"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 區塊 2：學徒名冊管理 */}
      <div className="glass-panel border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-indigo-300 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-indigo-400" />
            魔法學徒名冊管理 ({students.length})
          </h3>
          <button
            onClick={onAddStudent}
            className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center shadow"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            新增學徒
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-black/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                {/* 點擊循環切換頭像 */}
                <button
                  onClick={() => {
                    const currentIdx = WIZARD_AVATARS.indexOf(student.avatar);
                    const nextAvatar = WIZARD_AVATARS[(currentIdx + 1) % WIZARD_AVATARS.length];
                    onUpdateStudent(student.id, "avatar", nextAvatar);
                  }}
                  className="text-2xl hover:scale-110 transition-transform shrink-0"
                  title="點擊更換頭像"
                >
                  {student.avatar}
                </button>
                <div className="overflow-hidden">
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) => onUpdateStudent(student.id, "name", e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-100 hover:bg-slate-900/60 focus:bg-slate-900 px-1 py-0.5 rounded outline-none border border-transparent focus:border-indigo-500 w-full truncate"
                  />
                  <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                    <span>
                      座號:{" "}
                      <input
                        type="text"
                        value={student.seatNumber}
                        onChange={(e) => onUpdateStudent(student.id, "seatNumber", e.target.value)}
                        className="w-8 bg-transparent text-center border-b border-slate-700 focus:border-indigo-500 outline-none text-slate-300 font-mono"
                      />
                    </span>
                    <span>魔力: {student.magicPoints || 0}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteStudent(student.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors ml-2 shrink-0"
                title="除名學徒"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 區塊 3：藏書清單管理 */}
      <div className="glass-panel border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <h3 className="text-lg font-black text-emerald-300 flex items-center">
            藏書管理清單 ({filteredBooks.length} / {books.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋管理藏書..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto custom-scrollbar border border-slate-800/60 rounded-xl">
          {filteredBooks.map((book) => {
            const borrower = students.find((s) => s.id === book.borrowerId);
            const isBorrowed = book.status === "borrowed";

            return (
              <div
                key={book.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
              >
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-100 truncate">
                      {book.title}
                    </span>
                    {book.copyTotal > 1 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        複本 {book.copyNo}/{book.copyTotal}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    作者：{book.author} · 分類：{book.category}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isBorrowed ? (
                    <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-900/60">
                      已被 {borrower?.name || "已被除名學徒"} 借走
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-900/60">
                      架上可借
                    </span>
                  )}

                  {isBorrowed && (
                    <button
                      onClick={() => onForceReleaseBook(book)}
                      className="text-xs px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-700/60 font-bold transition-colors flex items-center"
                      title="強制釋放"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1" />
                      強制還書
                    </button>
                  )}

                  <button
                    onClick={() => onEditBookClick(book)}
                    className="p-1.5 text-slate-400 hover:text-amber-300 transition-colors"
                    title="編輯書籍"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteBook(book)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    title="刪除書籍"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 國定假日與放假日期排除（位於館藏書目管理與學期重置框之間） */}
      <div className="glass-panel border border-amber-900/40 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-amber-900/30 pb-4">
          <div>
            <h3 className="text-lg font-black text-amber-300 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-amber-400" />
              國定假日與放假日期排除設定
              <span className="text-xs text-amber-400/80 ml-2 font-bold">
                ({holidays.length} 天已排定)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              在此設定的日期將完全排除借閱時長計算（週末自動排除），防止放假期間累積修行時間。
            </p>
          </div>
        </div>

        {/* 新增放假日輸入表單 */}
        <form onSubmit={handleAddHolidaySubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-300 shrink-0">放假日期：</span>
            <input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="flex-1 flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-300 shrink-0">節日名稱：</span>
            <input
              type="text"
              placeholder="例：國慶日、中秋連假、校慶補假..."
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-amber-50 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center shrink-0 border border-amber-400/40"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增放假日
          </button>
        </form>

        {/* 目前已設定之放假日期清單 */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center">
            已排定的排除放假日期：
          </h4>
          {holidays.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="bg-slate-900/90 border border-amber-900/50 hover:border-amber-500/70 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-xs transition-colors shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono font-bold text-amber-200">{h.date}</span>
                  <span className="text-slate-300 font-semibold">{h.name || "放假日"}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteHoliday(h.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-0.5 ml-1"
                    title="刪除放假日"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-black/20 p-3 rounded-xl border border-slate-800/60">
              目前尚未設定特殊放假日。系統預設會在週六、週日自動停止計時。
            </p>
          )}
        </div>

        {/* 當前生效之有效借閱計算時段說明 */}
        <div className="bg-black/40 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center text-xs font-bold text-amber-400 mb-2">
            <Clock className="w-4 h-4 mr-1.5 text-amber-300" />
            系統目前僅在以下下課時段計算修行時長（上課、午休與週末一律不計入）：
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {VALID_READING_INTERVALS.map((slot) => (
              <div
                key={slot.id}
                className="bg-slate-900/60 border border-slate-800 px-2.5 py-1.5 rounded-lg flex items-center justify-between"
              >
                <span className="text-slate-300 font-bold">{slot.name}</span>
                <span className="text-amber-300 font-mono font-semibold">
                  {slot.start}~{slot.end}
                </span>
              </div>
            ))}
            <div className="bg-rose-950/30 border border-rose-900/40 px-2.5 py-1.5 rounded-lg flex items-center justify-between col-span-2 sm:col-span-1">
              <span className="text-rose-300 font-bold">午休時間</span>
              <span className="text-rose-400 font-mono font-semibold">禁止計算</span>
            </div>
          </div>
        </div>
      </div>

      {/* 區塊 4：禁忌魔法 (危險區域) */}
      <div className="glass-panel border border-rose-900/50 rounded-2xl p-6 bg-rose-950/20">
        <h3 className="text-lg font-black text-rose-400 mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-rose-500" />
          禁忌魔法區域 (危險操作)
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-5">
          釋放禁忌魔法將重置所有學徒的魔力值歸零，並徹底銷毀全部歷史借閱日誌。請謹慎施法！
        </p>
        <button
          onClick={onOpenResetModal}
          className="px-5 py-3 bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          開啟禁忌魔法重置儀式
        </button>
      </div>
    </div>
  );
}

