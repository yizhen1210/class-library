import React from "react";
import { ChevronLeft, Sparkles, BookOpen, CheckCircle, Clock, Plus } from "lucide-react";
import { calculateDurationMinutes, calculateValidReadingMinutes } from "../../utils/dateUtils";

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

  // 進行中的借閱
  const activeBorrows = books.filter((b) => b.borrowerId === student.id);

  // 該學徒的所有歷史借閱記錄
  const studentRecords = records.filter((r) => r.studentId === student.id);

  return (
    <div id="wizard-detail-top" className="animate-in fade-in duration-500">
      {/* 頂部返回與學徒個人檔案卡 */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-indigo-400 hover:text-indigo-200 transition-colors bg-black/40 p-3 rounded-full border border-indigo-900/50 shadow-inner mr-4 hover:bg-slate-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-indigo-200 tracking-wider">
          學徒修練檔案
        </h2>
      </div>

      <div className="glass-panel border border-indigo-500/40 rounded-3xl p-6 sm:p-8 mb-8 shadow-[0_10px_40px_rgba(79,70,229,0.2)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            <div className="w-24 h-24 rounded-3xl bg-indigo-950/80 border-2 border-indigo-400/50 flex items-center justify-center text-6xl shadow-[0_0_25px_rgba(79,70,229,0.4)]">
              {student.avatar}
            </div>
            <div>
              <div className="inline-block bg-indigo-950 text-indigo-300 text-xs font-black px-3 py-1 rounded-md border border-indigo-700/60 mb-2">
                座號 {student.seatNumber} 號
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
                {student.name}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                霍格華茲魔法書局正式認證學徒
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
            <div className="bg-black/50 border border-amber-600/40 rounded-2xl px-6 py-3 flex items-center shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-400 mr-3" />
              <div>
                <span className="text-xs text-amber-400/70 font-bold block">魔力值總計</span>
                <span className="text-2xl font-black text-amber-300">
                  {student.magicPoints || 0}{" "}
                  <span className="text-sm font-normal text-amber-400/80">點</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => onStartPickingBook(student.id)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-700 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-300/40 flex items-center justify-center text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              為 {student.name} 借新書
            </button>
          </div>
        </div>
      </div>

      {/* 進行中的借閱 */}
      <div className="mb-10">
        <h3 className="text-lg sm:text-xl font-black text-indigo-300 mb-4 flex items-center tracking-wider">
          <BookOpen className="w-5 h-5 mr-2 text-indigo-400" />
          正在研讀的魔導書 ({activeBorrows.length})
        </h3>

        {activeBorrows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeBorrows.map((book) => {
              const activeRecord = studentRecords.find(
                (r) => r.bookId === book.id && r.status === "active"
              );

              return (
                <div
                  key={book.id}
                  className="glass-panel border border-indigo-900/60 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                      {book.category}
                    </span>
                    <h4 className="text-lg font-black text-white mt-2 leading-snug">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">作者：{book.author}</p>
                    {activeRecord && (
                      <p className="text-xs text-indigo-300/70 mt-2 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        借閱時間：{activeRecord.borrowDate}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onReturnBook(book.id, student.id)}
                    className="mt-5 w-full py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 text-white font-black text-sm rounded-xl border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    歸還魔導書（結束修行）
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-500 glass-panel rounded-2xl border border-slate-800">
            目前沒有正在借閱的書籍。點擊上方「為 {student.name} 借新書」開始借閱！
          </div>
        )}
      </div>

      {/* 歷史借閱日誌 */}
      <div>
        <h3 className="text-lg sm:text-xl font-black text-slate-300 mb-4 flex items-center tracking-wider">
          <Clock className="w-5 h-5 mr-2 text-slate-400" />
          歷史修行日誌 ({studentRecords.length})
        </h3>

        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
          {studentRecords.length > 0 ? (
            <div className="divide-y divide-slate-800/60">
              {studentRecords.map((record) => {
                const book = books.find((b) => b.id === record.bookId);
                const isReturned = record.status === "returned";
                const minutes = typeof record.durationMinutes === "number"
                  ? record.durationMinutes
                  : calculateValidReadingMinutes(record.borrowDate, record.returnDate, holidays);

                return (
                  <div
                    key={record.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/30 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-200">
                        {book?.title || "未知書籍"}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        借閱：{record.borrowDate}
                        {record.returnDate && ` → 歸還：${record.returnDate}`}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      {isReturned ? (
                        <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                          研讀 {minutes} 分鐘
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">
                          修練中
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              尚無歷史修行日誌。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

