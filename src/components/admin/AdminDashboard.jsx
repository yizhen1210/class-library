import React, { useState, useRef } from "react";
import {
  Settings,
  Lock,
  X,
  Plus,
  BookOpen,
  User,
  PenLine,
  UserPlus,
  Trash2,
  Scroll,
  ChevronLeft,
  TriangleAlert,
  LoaderCircle,
  Calendar,
  Clock,
  Info
} from "lucide-react";
import { naturalCompare } from "../../utils/textUtils";
import { BOOK_COVERS } from "../../constants/bookCovers";
import { WIZARD_AVATARS } from "../../constants/avatars";
import { VALID_READING_INTERVALS } from "../../constants/readingSchedule";

export default function AdminDashboard({
  books,
  students,
  categories,
  holidays = [],
  onAddBookClick,
  onEditBookClick,
  onDeleteBook,
  onForceReleaseBook,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBatchImport,
  onAddHoliday,
  onDeleteHoliday,
  onOpenResetModal,
  onLogout
}) {
  // 結界密碼防護狀態 (密碼: 1217)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [hasPasswordError, setHasPasswordError] = useState(false);

  // 批量匯入輸入框
  const [batchText, setBatchText] = useState("");
  const [batchStatus, setBatchStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // 借出中展開狀態
  const [isBorrowedAccordionOpen, setIsBorrowedAccordionOpen] = useState(false);

  // 學徒名冊 3D 翻頁分頁
  const [studentPage, setStudentPage] = useState(1);
  const [flipDirection, setFlipDirection] = useState("next");

  // 類別管理輸入框
  const [newCatName, setNewCatName] = useState("");

  // 館藏書目篩選
  const [bookFilter, setBookFilter] = useState("");

  // 國定假日輸入狀態 (支援 年、月、日 下拉連動、快捷設定與原生深色日曆選擇器)
  const initialToday = new Date();
  const [holidayYear, setHolidayYear] = useState(initialToday.getFullYear());
  const [holidayMonth, setHolidayMonth] = useState(
    String(initialToday.getMonth() + 1).padStart(2, "0")
  );
  const [holidayDay, setHolidayDay] = useState(
    String(initialToday.getDate()).padStart(2, "0")
  );
  const [holidayName, setHolidayName] = useState("");
  const dateInputRef = useRef(null);

  // 根據所選年月動態計算該月總天數 (例如二月 28/29 天，大月 31 天)
  const daysInSelectedMonth = new Date(
    Number(holidayYear),
    Number(holidayMonth),
    0
  ).getDate();

  // 若切換年月後原本日期超出該月上限，自動校正至該月最後一日
  const validHolidayDay = Math.min(Number(holidayDay) || 1, daysInSelectedMonth);
  const currentHolidayDateString = `${holidayYear}-${String(holidayMonth).padStart(2, "0")}-${String(validHolidayDay).padStart(2, "0")}`;

  const selectedDateObj = new Date(
    Number(holidayYear),
    Number(holidayMonth) - 1,
    validHolidayDay
  );
  const WEEKDAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
  const selectedWeekday = isNaN(selectedDateObj.getTime())
    ? ""
    : WEEKDAY_NAMES[selectedDateObj.getDay()];
  const isSelectedWeekend =
    !isNaN(selectedDateObj.getTime()) &&
    (selectedDateObj.getDay() === 0 || selectedDateObj.getDay() === 6);

  const handleYearChange = (e) => {
    const newY = Number(e.target.value);
    setHolidayYear(newY);
    const maxDays = new Date(newY, Number(holidayMonth), 0).getDate();
    if (Number(holidayDay) > maxDays) {
      setHolidayDay(String(maxDays).padStart(2, "0"));
    }
  };

  const handleMonthChange = (e) => {
    const newM = e.target.value;
    setHolidayMonth(newM);
    const maxDays = new Date(holidayYear, Number(newM), 0).getDate();
    if (Number(holidayDay) > maxDays) {
      setHolidayDay(String(maxDays).padStart(2, "0"));
    }
  };

  const handleDayChange = (e) => {
    setHolidayDay(e.target.value);
  };

  const handleNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m, d] = val.split("-");
    if (y && m && d) {
      setHolidayYear(Number(y));
      setHolidayMonth(m);
      setHolidayDay(d);
    }
  };

  const setQuickHolidayDate = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    setHolidayYear(d.getFullYear());
    setHolidayMonth(String(d.getMonth() + 1).padStart(2, "0"));
    setHolidayDay(String(d.getDate()).padStart(2, "0"));
  };

  const formatHolidayDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) {
        return `${dateStr} (${WEEKDAY_NAMES[d.getDay()]})`;
      }
    }
    return dateStr;
  };

  // 解除結界驗證
  const handleUnlockBarrier = () => {
    if (passwordInput === "1217") {
      setIsUnlocked(true);
      setHasPasswordError(false);
      setPasswordInput("");
    } else {
      setHasPasswordError(true);
    }
  };

  // 學徒分頁計算 (每頁 5 位)
  const totalStudentPages = Math.max(1, Math.ceil(students.length / 5));
  const currentStudentPage = Math.min(studentPage, totalStudentPages);
  const displayedStudents = students.slice(
    (currentStudentPage - 1) * 5,
    currentStudentPage * 5
  );

  const handlePrevStudentPage = () => {
    setFlipDirection("prev");
    setStudentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextStudentPage = () => {
    setFlipDirection("next");
    setStudentPage((prev) => Math.min(totalStudentPages, prev + 1));
  };

  // 執行批量匯入
  const handleRunBatchImport = async () => {
    if (!batchText.trim() || isImporting) return;
    const lines = batchText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setBatchStatus("沒有可匯入的資料，請檢查格式。");
      return;
    }

    setIsImporting(true);
    setBatchStatus("匯入中…");
    try {
      await onBatchImport(batchText);
      setBatchStatus(`成功匯入 ${lines.length} 筆書目資料。`);
      setBatchText("");
    } catch (err) {
      console.error("匯入失敗:", err);
      setBatchStatus("匯入失敗，請檢查資料格式後再試。");
    } finally {
      setIsImporting(false);
    }
  };

  // 執行新增類別
  const handleCreateCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const exists = categories.some((c) => c.name === trimmed);
    if (exists) {
      alert("已經有同名的類別了。");
      return;
    }
    onAddCategory(trimmed);
    setNewCatName("");
  };

  // 執行新增放假排除日
  const handleCreateHoliday = (e) => {
    e.preventDefault();
    if (!currentHolidayDateString) return;
    onAddHoliday(currentHolidayDateString, holidayName.trim());
    setHolidayName("");
  };

  // 書籍封面自動著色計算
  const sortedAllBooks = [...books].sort(
    (a, b) => naturalCompare(a.category, b.category) || naturalCompare(a.title, b.title)
  );
  const colorMap = {};
  sortedAllBooks.forEach((book, index) => {
    colorMap[book.id] = BOOK_COVERS[index % BOOK_COVERS.length];
  });
  const getBookCoverClass = (b) => (b.coverLocked ? b.cover || colorMap[b.id] : colorMap[b.id] || b.cover);

  // 取得學生姓名
  const getStudentName = (studentId) => {
    const s = students.find((st) => st.id === studentId);
    return s ? s.name : "未知";
  };

  // 若尚未通過密語結界，顯示結界防護畫面
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-10 px-4 animate-in fade-in duration-500">
        <div className="glass-panel border-2 border-rose-900/80 rounded-3xl p-8 sm:p-10 shadow-[0_0_40px_rgba(159,18,57,0.3)] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black text-rose-500 mb-4 flex items-center justify-center relative z-10 drop-shadow-md tracking-widest">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 mr-3" />
            中控室結界
          </h2>
          <p className="text-rose-200/70 mb-8 relative z-10 text-sm sm:text-base font-medium">
            請輸入解除結界的魔法密語。
          </p>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlockBarrier()}
            className="w-full bg-black/50 border-2 border-rose-900/50 rounded-xl p-4 text-center text-rose-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 mb-6 tracking-[0.5em] sm:tracking-[0.8em] text-xl sm:text-2xl font-sans relative z-10 shadow-inner"
            placeholder="••••"
            autoFocus
          />

          {hasPasswordError && (
            <p className="text-rose-500 text-sm sm:text-base mb-6 relative z-10 font-bold bg-rose-950/50 py-2 rounded-lg border border-rose-900">
              結界反彈：密語錯誤！
            </p>
          )}

          <button
            onClick={handleUnlockBarrier}
            className="w-full bg-gradient-to-r from-rose-800 to-rose-700 hover:from-rose-700 hover:to-rose-600 text-rose-50 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(190,18,60,0.5)] border border-rose-500/50 relative z-10 text-base sm:text-lg tracking-widest"
          >
            解除結界
          </button>
        </div>
      </div>
    );
  }

  // 解鎖後的中控室主要管理介面
  const borrowedBooks = books.filter((b) => b.status === "borrowed");
  const availableBooksCount = books.filter((b) => b.status !== "borrowed").length;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* 頂部中控室資訊與重施結界／登出 */}
      <div className="bg-gradient-to-r from-rose-950/90 to-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-rose-900/50 shadow-[0_15px_40px_rgba(159,18,57,0.3)] mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center">
          <Settings className="w-10 h-10 sm:w-12 sm:h-12 mr-4 sm:mr-6 text-rose-500 shrink-0 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-rose-200 mb-2 tracking-wider drop-shadow-md">
              中控室
            </h2>
            <p className="text-sm sm:text-base text-rose-300/70 font-medium">
              統御學徒名冊，管理館藏知識卷軸的最高權限區。
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setIsUnlocked(false)}
            className="w-full sm:w-auto bg-black/40 hover:bg-black/60 text-rose-400 px-5 py-3 rounded-xl border border-rose-900/50 transition-colors text-sm sm:text-base font-bold flex items-center justify-center shadow-inner"
          >
            <Lock className="w-5 h-5 mr-2" />
            重新施加結界
          </button>

          <button
            onClick={onLogout}
            className="w-full sm:w-auto bg-black/40 hover:bg-black/60 text-slate-400 hover:text-slate-200 px-5 py-3 rounded-xl border border-slate-700 transition-colors text-sm sm:text-base font-bold flex items-center justify-center shadow-inner"
          >
            <X className="w-5 h-5 mr-2" />
            登出帳號
          </button>
        </div>
      </div>

      {/* 雙欄功能區：批量匯入書目 & 魔導書庫總管 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 批量匯入書目 */}
        <div className="glass-panel border border-sky-900/40 rounded-3xl p-6 sm:p-8 flex flex-col">
          <h3 className="text-xl sm:text-2xl font-black text-sky-400 flex items-center mb-3 tracking-wider drop-shadow-sm">
            <Plus className="w-6 h-6 mr-3" />
            批量匯入書目
          </h3>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            每行一筆，格式：
            <span className="text-sky-300 font-bold">書名 / 作者 / 類別 / 複本數</span>
            。作者留空帶「未知學者」、複本數留空當 1。
          </p>
          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            rows={6}
            placeholder="書名 / 作者 / 類別 / 複本數"
            className="w-full bg-black/50 border-2 border-slate-700 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:border-sky-500 shadow-inner font-mono leading-relaxed resize-y flex-grow"
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <button
              onClick={handleRunBatchImport}
              disabled={isImporting || !batchText.trim()}
              className="bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-600 hover:to-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl border border-sky-400/50 transition-all font-bold flex items-center justify-center shrink-0"
            >
              {isImporting ? (
                <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {isImporting ? "匯入中…" : "開始匯入"}
            </button>
            {batchStatus && (
              <span className="text-sm font-bold text-sky-300">
                {batchStatus}
              </span>
            )}
          </div>
        </div>

        {/* 魔導書庫總管 */}
        <div className="glass-panel border border-emerald-900/40 rounded-3xl p-6 sm:p-8 flex flex-col">
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center mb-6 tracking-wider">
            <BookOpen className="w-6 h-6 mr-3 shrink-0" />
            魔導書庫總管
          </h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-3.5 border border-emerald-900/30">
              <span className="text-slate-200 text-base font-bold">總藏書</span>
              <span className="text-purple-400 font-black text-3xl sm:text-4xl">
                {books.length}
              </span>
            </div>

            <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-3.5 border border-emerald-900/30">
              <span className="text-slate-200 text-base font-bold">可借閱</span>
              <span className="text-sky-400 font-black text-3xl sm:text-4xl">
                {availableBooksCount}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsBorrowedAccordionOpen((prev) => !prev)}
              className="w-full flex items-center justify-between bg-black/40 rounded-xl px-4 py-3.5 border border-emerald-900/30 hover:border-rose-700/60 transition-colors"
            >
              <span className="text-slate-200 text-base font-bold flex items-center">
                借出中
                <ChevronLeft
                  className={`w-4 h-4 ml-1.5 text-rose-400 transition-transform ${
                    isBorrowedAccordionOpen ? "rotate-90" : "-rotate-90"
                  }`}
                />
              </span>
              <span className="text-rose-400 font-black text-3xl sm:text-4xl">
                {borrowedBooks.length}
              </span>
            </button>

            {isBorrowedAccordionOpen && (
              <div className="bg-black/30 rounded-xl border border-rose-900/30 p-3 space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {borrowedBooks.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-2">
                    目前沒有借出中的書。
                  </p>
                ) : (
                  [...borrowedBooks]
                    .sort((a, b) => naturalCompare(a.title, b.title))
                    .map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-3 text-sm border-b border-white/5 last:border-0 pb-1.5 last:pb-0"
                      >
                        <span className="text-slate-100 font-bold truncate min-w-0">
                          {b.title}
                        </span>
                        <span className="text-rose-300 font-bold shrink-0 flex items-center">
                          <User className="w-3.5 h-3.5 mr-1" />
                          {getStudentName(b.borrowerId)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={onAddBookClick}
            className="mt-auto w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-5 py-4 rounded-xl border border-emerald-400/50 transition-all font-bold flex items-center justify-center shadow-[0_10px_25px_rgba(4,120,87,0.4)] text-base tracking-wide"
          >
            <Plus className="w-6 h-6 mr-2" />
            收錄新魔導書
          </button>
        </div>
      </div>

      {/* 修改學徒卷宗 (3D 翻頁清單，每頁 5 位) */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-slate-200 flex items-center tracking-wider">
            <PenLine className="w-6 h-6 mr-3 text-indigo-400" />
            修改學徒卷宗
          </h3>
          <button
            onClick={onAddStudent}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-700/80 to-indigo-600/80 hover:from-indigo-600 hover:to-indigo-500 text-white px-5 py-3 rounded-xl border border-indigo-400/50 transition-all font-bold flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            招收新學徒
          </button>
        </div>

        <div className="glass-panel border border-slate-700 rounded-2xl shadow-2xl">
          <div className="overflow-x-auto min-w-full custom-scrollbar rounded-t-2xl">
            <div className="min-w-[700px]">
              <div
                key={`${currentStudentPage}-${flipDirection}`}
                className={`w-full ${
                  flipDirection === "next" ? "flip-next-anim" : "flip-prev-anim"
                }`}
              >
                <div className="grid grid-cols-12 gap-4 p-4 sm:p-5 bg-black/60 border-b border-slate-700 font-black text-slate-300 text-sm sm:text-base tracking-wider rounded-t-2xl">
                  <div className="col-span-2 text-center">座號</div>
                  <div className="col-span-4 text-left pl-2">稱呼 (姓名)</div>
                  <div className="col-span-2 text-center">頭像</div>
                  <div className="col-span-2 text-center">魔力值</div>
                  <div className="col-span-2 text-center">操作</div>
                </div>

                <div className="divide-y divide-slate-800/80 bg-black/40">
                  {displayedStudents.map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-12 gap-4 p-3 sm:p-4 items-center hover:bg-slate-800/40 transition-colors font-sans"
                    >
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={s.seatNumber}
                          onChange={(e) => onUpdateStudent(s.id, "seatNumber", e.target.value)}
                          className="w-full bg-black/50 border border-slate-700 rounded-lg p-2.5 text-center text-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base font-bold shadow-inner"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => onUpdateStudent(s.id, "name", e.target.value)}
                          className="w-full bg-black/50 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base font-bold shadow-inner"
                        />
                      </div>
                      <div className="col-span-2 text-center">
                        <input
                          type="text"
                          value={s.avatar}
                          onChange={(e) => onUpdateStudent(s.id, "avatar", e.target.value)}
                          className="w-12 sm:w-14 bg-black/50 border border-slate-700 rounded-lg p-2.5 text-center text-xl sm:text-2xl mx-auto focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={s.magicPoints}
                          onChange={(e) => onUpdateStudent(s.id, "magicPoints", Number(e.target.value))}
                          className="w-full bg-black/50 border border-slate-700 rounded-lg p-2.5 text-center text-amber-400 font-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base shadow-inner"
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => onDeleteStudent(s.id)}
                          className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-900/30 rounded-xl transition-colors border border-transparent hover:border-rose-800/50"
                          title="除名"
                        >
                          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 翻頁導覽列 */}
          <div className="flex justify-between items-center p-3 sm:p-4 bg-black/60 border-t border-slate-700 rounded-b-2xl">
            <button
              onClick={handlePrevStudentPage}
              disabled={currentStudentPage === 1}
              className="px-3 py-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center font-bold transition-colors text-sm sm:text-base"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> 上一頁
            </button>
            <span className="text-slate-400 font-bold tracking-widest text-sm">
              第 {currentStudentPage} 頁 / 共 {totalStudentPages} 頁
            </span>
            <button
              onClick={handleNextStudentPage}
              disabled={currentStudentPage === totalStudentPages}
              className="px-3 py-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center font-bold transition-colors text-sm sm:text-base"
            >
              下一頁 <ChevronLeft className="w-5 h-5 ml-1 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* 類別管理 */}
      <div className="glass-panel border border-amber-900/40 rounded-3xl p-6 sm:p-8 mb-8">
        <h3 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center mb-6 tracking-wider drop-shadow-sm">
          <Scroll className="w-6 h-6 mr-3" />
          類別管理
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
            placeholder="輸入新類別名稱…"
            className="flex-1 bg-black/50 border-2 border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500 shadow-inner"
          />
          <button
            onClick={handleCreateCategory}
            disabled={!newCatName.trim()}
            className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl border border-amber-400/50 transition-all font-bold flex items-center justify-center shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增類別
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const count = books.filter((b) => b.category === cat.name).length;
            return (
              <div
                key={`${cat.id}-${cat.name}`}
                className="bg-black/40 rounded-xl p-3 border border-amber-900/30 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <input
                  type="text"
                  defaultValue={cat.name}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && val !== cat.name) {
                      onRenameCategory(cat.id, cat.name, val);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                  className="flex-1 bg-slate-900/70 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 shadow-inner"
                />
                <span className="text-xs sm:text-sm text-amber-500/70 font-bold sm:w-24 shrink-0 sm:text-center">
                  {count} 本書
                </span>
                <button
                  onClick={() => onDeleteCategory(cat)}
                  className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-900/30 rounded-xl transition-colors border border-transparent hover:border-rose-800/50 shrink-0 self-end sm:self-auto"
                  title="刪除類別"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          改名會自動更新該類別底下所有書的分類；若類別底下還有書，需先把書改分類或刪除才能刪除類別。
        </p>
      </div>

      {/* 館藏書目管理 */}
      <div className="glass-panel border border-emerald-900/40 rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center tracking-wider drop-shadow-sm">
            <BookOpen className="w-6 h-6 mr-3" />
            館藏書目管理
          </h3>
          <input
            type="text"
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            placeholder="篩選書名或類別…"
            className="w-full sm:w-64 bg-black/50 border-2 border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar flex-grow">
          {[...books]
            .filter((b) => {
              const q = bookFilter.trim().toLowerCase();
              return q
                ? (b.title || "").toLowerCase().includes(q) ||
                    (b.category || "").toLowerCase().includes(q)
                : true;
            })
            .sort(
              (a, b) =>
                naturalCompare(a.category, b.category) ||
                naturalCompare(a.title, b.title)
            )
            .map((b) => (
              <div
                key={b.id}
                className="bg-black/40 rounded-xl p-4 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-emerald-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg ${getBookCoverClass(
                      b
                    )} border border-black/40 shrink-0`}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-100 text-sm sm:text-base truncate">
                      {b.title}
                      {b.copyTotal > 1 && (
                        <span className="ml-2 text-[11px] font-bold text-amber-400/90 bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-800/40 align-middle whitespace-nowrap">
                          複本 {b.copyNo}/{b.copyTotal}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {b.category}・{b.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      b.status === "borrowed"
                        ? "text-rose-300 bg-rose-900/30 border border-rose-700/40"
                        : "text-sky-300 bg-sky-900/30 border border-sky-700/40"
                    }`}
                  >
                    {b.status === "borrowed" ? "借出中" : "可借閱"}
                  </span>

                  {b.status === "borrowed" && (
                    <button
                      onClick={() => onForceReleaseBook(b)}
                      className="px-2.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/30 hover:bg-emerald-800/50 rounded-lg border border-emerald-700/50 hover:border-emerald-500/60 transition-colors shrink-0"
                      title="強制放回可借閱（借閱者已不在、或要強制收回時用）"
                    >
                      釋放
                    </button>
                  )}

                  <button
                    onClick={() => onEditBookClick(b)}
                    className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-amber-900/20 rounded-xl transition-colors border border-transparent hover:border-amber-800/50"
                    title="編輯"
                  >
                    <PenLine className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => onDeleteBook(b)}
                    className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-900/30 rounded-xl transition-colors border border-transparent hover:border-rose-800/50"
                    title="刪除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

          {books.length === 0 && (
            <p className="text-emerald-600/60 font-bold italic bg-black/20 p-8 rounded-2xl text-center border border-emerald-900/20 text-sm">
              目前沒有任何館藏。
            </p>
          )}
        </div>
      </div>

      {/* 國定假日與放假日期排除設定 (位置：館藏書目管理框與學期重置框之間) */}
      <div className="glass-panel border border-amber-600/50 rounded-3xl p-6 sm:p-8 mb-8 shadow-[0_10px_35px_rgba(217,119,6,0.2)] bg-gradient-to-br from-amber-950/25 to-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center tracking-wider drop-shadow-sm">
              <Calendar className="w-6 h-6 mr-3 text-amber-400" />
              國定假日與放假日期排除設定
            </h3>
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 font-medium">
              設定不計入借閱修練時間的放假日期。系統亦已內建排除週末（週六、週日）與上課、午休時段。
            </p>
          </div>
        </div>

        {/* 允許計算之時段說明 */}
        <div className="mb-6 p-4 rounded-xl bg-black/40 border border-amber-800/40 text-xs sm:text-sm">
          <div className="flex items-center text-amber-300 font-bold mb-2">
            <Clock className="w-4 h-4 mr-2" />
            系統目前限定累計之 7 個早自修與下課時段（其餘上課、午休與放假日皆不計入）：
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono">
            {VALID_READING_INTERVALS.map((slot) => (
              <div
                key={slot.name}
                className="bg-slate-900/70 px-2.5 py-1.5 rounded border border-slate-700/50 flex items-center justify-between"
              >
                <span className="font-sans text-amber-200/90 text-[11px] sm:text-xs">
                  {slot.name}
                </span>
                <span className="text-[11px] text-amber-400 font-bold">
                  {slot.start}~{slot.end}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 新增放假日表單 */}
        <form onSubmit={handleCreateHoliday} className="space-y-4 mb-6">
          {/* 年、月、日 下拉選單 + 快捷按鈕 + 原生深色日曆選單 */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-2">
              選擇排除放假之年、月、日：
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {/* 年份下拉選單 */}
              <div className="relative">
                <select
                  value={holidayYear}
                  onChange={handleYearChange}
                  className="bg-slate-900 border-2 border-amber-700/60 hover:border-amber-500 rounded-xl px-3 py-2.5 text-amber-200 font-bold text-sm focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner pr-8 appearance-none"
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y} className="bg-slate-900 text-slate-100">
                      {y} 年
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs">
                  ▼
                </div>
              </div>

              {/* 月份下拉選單 */}
              <div className="relative">
                <select
                  value={holidayMonth}
                  onChange={handleMonthChange}
                  className="bg-slate-900 border-2 border-amber-700/60 hover:border-amber-500 rounded-xl px-3 py-2.5 text-amber-200 font-bold text-sm focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner pr-8 appearance-none"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const val = String(i + 1).padStart(2, "0");
                    return (
                      <option key={val} value={val} className="bg-slate-900 text-slate-100">
                        {val} 月
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs">
                  ▼
                </div>
              </div>

              {/* 日期下拉選單 */}
              <div className="relative">
                <select
                  value={String(validHolidayDay).padStart(2, "0")}
                  onChange={handleDayChange}
                  className="bg-slate-900 border-2 border-amber-700/60 hover:border-amber-500 rounded-xl px-3 py-2.5 text-amber-200 font-bold text-sm focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner pr-8 appearance-none"
                >
                  {Array.from({ length: daysInSelectedMonth }, (_, i) => {
                    const val = String(i + 1).padStart(2, "0");
                    return (
                      <option key={val} value={val} className="bg-slate-900 text-slate-100">
                        {val} 日
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs">
                  ▼
                </div>
              </div>

              {/* 快捷按鈕 */}
              <button
                type="button"
                onClick={() => setQuickHolidayDate(0)}
                className="px-3 py-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/50 rounded-xl text-xs font-bold transition-all"
              >
                今天
              </button>
              <button
                type="button"
                onClick={() => setQuickHolidayDate(1)}
                className="px-3 py-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/50 rounded-xl text-xs font-bold transition-all"
              >
                明天
              </button>

              {/* 同步之原生日曆選擇器 */}
              <div className="relative flex items-center">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={currentHolidayDateString}
                  onChange={handleNativeDateChange}
                  style={{ colorScheme: "dark" }}
                  className="bg-slate-900 border-2 border-amber-700/60 hover:border-amber-500 rounded-xl px-3 py-2 text-amber-200 text-xs font-mono cursor-pointer focus:outline-none focus:border-amber-400 shadow-inner"
                  title="點擊此處亦可開啟日曆挑選"
                />
              </div>
            </div>

            {/* 即時日期與星期預覽提示 */}
            <div className="mt-2 text-xs text-amber-200/90 flex flex-wrap items-center gap-2">
              <span>
                已選擇：
                <strong className="text-amber-400 font-mono text-sm ml-1">
                  {currentHolidayDateString} ({selectedWeekday})
                </strong>
              </span>
              {isSelectedWeekend && (
                <span className="text-amber-400/80 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                  ※ 提示：此日已是週末，系統本來就不會計算借閱，仍可加入備註以防萬一。
                </span>
              )}
            </div>
          </div>

          {/* 備註名稱與送出按鈕 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="放假備註名稱（例如：中秋節、雙十節、校慶補假、全校運動會補假）"
              className="flex-1 bg-black/50 border-2 border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500 shadow-inner text-sm"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-5 py-3 rounded-xl border border-amber-400/50 transition-all font-bold flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(217,119,6,0.3)] text-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              新增排除放假日
            </button>
          </div>
        </form>

        {/* 已設定的放假日期列表 */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {holidays.length === 0 ? (
            <p className="text-slate-500 text-xs sm:text-sm text-center py-4 italic bg-black/20 rounded-xl border border-dashed border-slate-800">
              目前尚未加入任何國定假日。除預設週末不上課外，所有平日將依課間時段計算。
            </p>
          ) : (
            [...holidays]
              .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
              .map((h) => (
                <div
                  key={h.id}
                  className="bg-black/40 rounded-xl px-4 py-2.5 border border-amber-900/30 flex items-center justify-between gap-3 text-sm hover:border-amber-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-300 font-bold">
                      {formatHolidayDate(h.date)}
                    </span>
                    {h.name && (
                      <span className="text-slate-300 text-xs sm:text-sm">
                        {h.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteHoliday(h.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors border border-transparent hover:border-rose-800/50"
                    title="移除此假日"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>

      {/* 危險禁忌區 (學期重置) */}
      <div className="glass-panel border border-rose-900/50 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-950/30 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-rose-500 flex items-center mb-4 tracking-wider drop-shadow-sm">
            <TriangleAlert className="w-6 h-6 mr-3" />
            危險禁忌區 (學期重置)
          </h3>
          <p className="text-sm sm:text-base text-rose-300/80 leading-relaxed font-medium">
            此魔法將會強制回收所有外借卷軸，並
            <strong className="text-rose-400 mx-1">永久銷毀</strong>
            所有學徒的魔力值與修行歷史。
            <br />
            <span className="text-rose-500 mt-2 block font-bold">
              ※ 警告：法術不可逆轉。
            </span>
          </p>
        </div>

        <button
          onClick={onOpenResetModal}
          className="w-full sm:w-auto sm:shrink-0 bg-rose-950/80 hover:bg-rose-900 text-rose-400 hover:text-rose-300 px-6 py-4 rounded-xl border border-rose-800/80 hover:border-rose-500/50 transition-all font-bold flex items-center justify-center text-base sm:text-lg tracking-wide shadow-[0_5px_15px_rgba(159,18,57,0.3)]"
        >
          <Trash2 className="w-6 h-6 mr-2" />
          發動重置魔法
        </button>
      </div>
    </div>
  );
}
