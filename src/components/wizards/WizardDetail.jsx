import React from "react";
import { ChevronLeft, Star, BookOpen, Sparkles, Clock, Check, Scroll } from "lucide-react";
import { calculateValidReadingMinutes, parseDateTime } from "../../utils/dateUtils";

const DURATION_THRESHOLD_MINUTES = 30;

export default function WizardDetail({
  student,
  books,
  records,
  holidays = [],
  onBack,
  onReturnBook,
  onStartPickingBook
}) {
  if (!student) return null;

  const activeBorrows = records.filter(
    (r) => r.studentId === student.id && r.status === "active"
  );
  const returnedRecords = records.filter(
    (r) => r.studentId === student.id && r.status === "returned"
  );

  // 計算獎勵與累計時長
  const rewardedRecordIds = new Set();
  const bookDurationMap = {};

  [...returnedRecords]
    .sort((a, b) => (parseDateTime(a.borrowDate)?.getTime() || 0) - (parseDateTime(b.borrowDate)?.getTime() || 0))
    .forEach((r) => {
      const dur =
        typeof r.durationMinutes === "number"
          ? r.durationMinutes
          : calculateValidReadingMinutes(r.borrowDate, r.returnDate, holidays);
      const prevTotal = bookDurationMap[r.bookId] || 0;
      const nextTotal = prevTotal + dur;
      if (r.rewarded || dur >= DURATION_THRESHOLD_MINUTES || (prevTotal < DURATION_THRESHOLD_MINUTES && nextTotal >= DURATION_THRESHOLD_MINUTES)) {
        rewardedRecordIds.add(r.id);
      }
      bookDurationMap[r.bookId] = nextTotal;
    });

  const getBook = (bookId) => books.find((b) => b.id === bookId);

  return (
    <div
      id="wizard-detail-top"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      className="max-w-4xl mx-auto animate-in fade-in duration-500"
    >
      <button
        onClick={onBack}
        className="flex items-center text-indigo-400 hover:text-indigo-300 mb-8 transition-colors font-bold text-sm sm:text-base glass-panel px-4 py-2 rounded-full border border-indigo-900/50 w-fit"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        返回名冊
      </button>

      {/* 學徒榮譽橫幅 */}
      <div className="bg-gradient-to-br from-[#1e1b4b]/90 to-[#020617]/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#4338ca]/40 shadow-[0_15px_40px_rgba(49,46,129,0.4)] mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center relative z-10">
          <div className="text-6xl sm:text-8xl mr-5 sm:mr-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] shrink-0 bg-black/30 rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border-4 border-indigo-900/50">
            {student.avatar}
          </div>
          <div>
            <div className="flex flex-wrap items-center mb-2 gap-3">
              <span className="bg-black/60 text-indigo-300 text-xl sm:text-2xl font-black px-4 py-1.5 rounded-lg border-2 border-indigo-800 shadow-inner">
                {student.seatNumber}號
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-indigo-50 break-all tracking-wider drop-shadow-md">
                {student.name}
              </h2>
            </div>
            <div className="inline-flex items-center bg-amber-900/30 text-amber-300 px-4 py-2 rounded-full border border-amber-500/40 text-sm sm:text-base font-bold mt-2 shadow-inner">
              <Star className="w-5 h-5 mr-2 drop-shadow-sm" />
              累積魔力：
              <span className="text-lg sm:text-xl ml-1">{student.magicPoints}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onStartPickingBook(student.id)}
          className={`w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-8 py-5 rounded-2xl border border-indigo-300/50 transition-all shadow-[0_10px_25px_rgba(79,70,229,0.5)] font-black flex items-center justify-center shrink-0 text-lg sm:text-2xl relative z-10 ${
            activeBorrows.length === 0 ? "flash-attn" : ""
          }`}
        >
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 shrink-0" />
          挑選新卷軸
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* 結契中 (目前借閱) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-900/40">
          <h3 className="text-xl sm:text-2xl font-black text-amber-400 mb-6 flex items-center border-b border-amber-900/30 pb-4 tracking-wider drop-shadow-sm">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 mr-3 shrink-0" />
            結契中 (目前借閱)
          </h3>

          {activeBorrows.length === 0 ? (
            <p className="text-amber-600/60 font-bold italic bg-black/20 p-8 rounded-2xl text-center border border-amber-900/20 text-sm sm:text-base">
              目前沒有進行中的契約。
            </p>
          ) : (
            <div className="space-y-5">
              {activeBorrows.map((record) => {
                const book = getBook(record.bookId);
                return (
                  <div
                    key={record.id}
                    className="bg-black/40 rounded-2xl p-5 border border-amber-700/40 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] gap-4 hover:border-amber-500/60 transition-colors"
                  >
                    <div className="w-full">
                      <h4 className="font-black text-amber-100 text-lg sm:text-xl break-all leading-tight">
                        {book?.title || "未知的魔導書"}
                      </h4>
                      <p className="text-sm text-amber-500/70 mt-2 flex items-center font-bold">
                        <Clock className="w-4 h-4 mr-1.5 shrink-0" /> 締結於 {record.borrowDate}
                      </p>
                    </div>

                    <button
                      onClick={() => onReturnBook(record.bookId, student.id)}
                      className="flash-return w-full sm:w-auto bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-6 py-4 rounded-xl border border-emerald-400/50 transition-all font-black flex items-center justify-center shrink-0 text-base sm:text-lg shadow-[0_5px_15px_rgba(4,120,87,0.4)]"
                    >
                      <Check className="w-6 h-6 mr-2 shrink-0" />
                      解除契約 (歸還)
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 修行日誌 (歷史) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-900/40">
          <h3 className="text-xl sm:text-2xl font-black text-indigo-300 mb-6 flex items-center border-b border-indigo-900/30 pb-4 tracking-wider drop-shadow-sm">
            <Scroll className="w-6 h-6 sm:w-7 sm:h-7 mr-3 shrink-0" />
            修行日誌 (歷史)
          </h3>

          {returnedRecords.length === 0 ? (
            <p className="text-indigo-600/60 font-bold italic bg-black/20 p-8 rounded-2xl text-center border border-indigo-900/20 text-sm sm:text-base">
              尚未有歷史紀錄。
            </p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {returnedRecords.map((record) => {
                const book = getBook(record.bookId);
                const duration =
                  typeof record.durationMinutes === "number"
                    ? record.durationMinutes
                    : calculateValidReadingMinutes(record.borrowDate, record.returnDate, holidays);
                const isRewarded = rewardedRecordIds.has(record.id);

                return (
                  <div
                    key={record.id}
                    className="bg-black/30 rounded-xl p-4 border border-indigo-800/30 flex justify-between items-center gap-3 hover:bg-black/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-indigo-100 text-sm sm:text-base truncate">
                        {book?.title || "未知的魔導書"}
                      </h4>
                      <div className="text-xs text-indigo-400/60 mt-1.5 flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-1 sm:gap-0 font-medium">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                          借：{record.borrowDate}
                        </span>
                        <span className="hidden sm:inline opacity-50">|</span>
                        <span className="flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1 shrink-0" />
                          還：{record.returnDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-xs font-black text-indigo-200 bg-indigo-900/50 px-2.5 py-1.5 rounded-md border border-indigo-700/50 whitespace-nowrap shadow-inner">
                        看了 {duration} 分
                      </span>
                      {isRewarded && (
                        <span className="text-xs font-black text-amber-400 bg-amber-900/40 px-2.5 py-1 rounded-md border border-amber-700/50 whitespace-nowrap shadow-inner flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          +10 魔力
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
