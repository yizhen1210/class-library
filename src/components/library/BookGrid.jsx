import React, { useState } from "react";
import { Search, X, ChevronLeft, Sparkles, Folder } from "lucide-react";
import BookCard from "./BookCard";
import PopularRanking from "./PopularRanking";
import { naturalCompare } from "../../utils/textUtils";
import { BOOK_COVERS } from "../../constants/bookCovers";

export default function BookGrid({
  books,
  categories,
  students,
  records,
  pickingStudentId,
  onCancelPicking,
  onSelectBookToBorrow,
  onDirectBorrowForStudent
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const pickingStudent = students.find((s) => s.id === pickingStudentId);

  // 計算動態配色對應表
  const categoryNames = [...new Set([...categories.map((c) => c.name), ...books.map((b) => b.category)])];
  const sortedAllBooks = [...books].sort(
    (a, b) => naturalCompare(a.category, b.category) || naturalCompare(a.title, b.title)
  );
  const colorMap = {};
  sortedAllBooks.forEach((book, index) => {
    colorMap[book.id] = BOOK_COVERS[index % BOOK_COVERS.length];
  });

  const getBookCoverClass = (book) => {
    if (book.coverLocked) {
      return book.cover || colorMap[book.id];
    }
    return colorMap[book.id] || book.cover;
  };

  // 搜尋過濾
  const cleanSearch = searchQuery.toLowerCase().replace(/[《》「」\s]/g, "");
  const searchResults = cleanSearch
    ? books
        .filter(
          (b) =>
            b.title.toLowerCase().replace(/[《》「」\s]/g, "").includes(cleanSearch) ||
            b.author.toLowerCase().replace(/[《》「」\s]/g, "").includes(cleanSearch)
        )
        .sort((a, b) => naturalCompare(a.title, b.title))
    : [];

  // 人氣排行榜計算
  const borrowCounts = {};
  records.forEach((r) => {
    if (r.bookId && r.studentId) {
      if (!borrowCounts[r.bookId]) borrowCounts[r.bookId] = new Set();
      borrowCounts[r.bookId].add(r.studentId);
    }
  });

  const topBooks = books
    .map((b) => ({ book: b, count: borrowCounts[b.id] ? borrowCounts[b.id].size : 0 }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count || naturalCompare(a.book.title, b.book.title))
    .slice(0, 5);

  const handleCardClick = (book) => {
    if (pickingStudentId) {
      onDirectBorrowForStudent(book);
    } else {
      onSelectBookToBorrow(book);
    }
  };

  const formatCategoryPill = (catName) => {
    const parenIndex = catName.indexOf("（");
    if (catName.includes("：") && parenIndex !== -1) {
      const [prefix, rest] = catName.split("：");
      const title = rest.slice(0, rest.indexOf("（"));
      const range = rest.slice(rest.indexOf("（"));
      return (
        <>
          <span className="block">{prefix}：</span>
          <span className="block">
            {title}
            <span className="sm:block">{range}</span>
          </span>
        </>
      );
    }
    return catName;
  };

  return (
    <div id="library-top" className="animate-in fade-in duration-500">
      {/* 挑書中橫幅 (由學徒詳情頁跳轉而來) */}
      {pickingStudentId && (
        <div className="mb-8 glass-panel border-2 border-indigo-500/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-[0_0_30px_rgba(79,70,229,0.2)] animate-pulse-slow gap-4">
          <div className="flex items-center">
            <span className="text-4xl sm:text-5xl mr-4 drop-shadow-md">
              {pickingStudent?.avatar}
            </span>
            <div>
              <h3 className="text-indigo-200 font-bold text-lg sm:text-xl tracking-wide">
                正在為 {pickingStudent?.name} 挑選魔導書
              </h3>
              <p className="text-sm text-indigo-300/80 mt-1">
                可直接搜尋，或選擇類別，再點書本的「點我借給 {pickingStudent?.name}」完成借閱。
              </p>
            </div>
          </div>
          <button
            onClick={onCancelPicking}
            className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-5 py-3 rounded-xl border border-slate-600 transition-colors text-sm font-bold flex items-center justify-center shrink-0 shadow-inner"
          >
            <X className="w-5 h-5 mr-2" />
            取消挑書
          </button>
        </div>
      )}

      {/* 搜尋欄 */}
      <div className="mb-8 relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜尋書名或作者…"
          className="w-full bg-black/40 border-2 border-amber-900/40 rounded-2xl py-3.5 pl-12 pr-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner tracking-wide"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
            title="清除"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 視圖切換：搜尋結果 / 類別詳情 / 首頁推薦 */}
      {cleanSearch ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center drop-shadow-md tracking-wider">
              <Search className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-amber-500" />
              搜尋結果
              <span className="text-base sm:text-lg text-amber-600 ml-3 font-bold">
                ({searchResults.length} 本)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {searchResults.map((book) => {
              const borrower = students.find((s) => s.id === book.borrowerId);
              return (
                <BookCard
                  key={book.id}
                  book={book}
                  coverClass={getBookCoverClass(book)}
                  isAvailable={book.status === "available"}
                  borrowerName={borrower?.name || "已被除名學徒"}
                  pickingStudentId={pickingStudentId}
                  pickingStudentName={pickingStudent?.name}
                  onCardClick={() => handleCardClick(book)}
                />
              );
            })}
            {searchResults.length === 0 && (
              <div className="col-span-full py-16 text-center text-amber-600/70 font-bold tracking-widest text-lg glass-panel rounded-2xl border border-amber-900/30">
                找不到符合「{searchQuery}」的魔導書。
              </div>
            )}
          </div>
        </>
      ) : selectedCategory ? (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-5">
            <div className="flex items-start sm:items-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center justify-center text-amber-500 hover:text-amber-300 mr-4 transition-colors bg-black/40 p-3 rounded-full border border-amber-900/50 shadow-inner shrink-0 hover:bg-slate-800"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <h2 className="text-xl sm:text-3xl font-black text-amber-100 flex flex-wrap items-center mt-1 sm:mt-0 tracking-wider drop-shadow-md">
                {selectedCategory}
                <span className="text-base sm:text-lg text-amber-600 ml-3 font-bold">
                  ({books.filter((b) => b.category === selectedCategory).length} 本)
                </span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {books
              .filter((b) => b.category === selectedCategory)
              .sort((a, b) => naturalCompare(a.title, b.title))
              .map((book) => {
                const borrower = students.find((s) => s.id === book.borrowerId);
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    coverClass={getBookCoverClass(book)}
                    isAvailable={book.status === "available"}
                    borrowerName={borrower?.name || "已被除名學徒"}
                    pickingStudentId={pickingStudentId}
                    pickingStudentName={pickingStudent?.name}
                    onCardClick={() => handleCardClick(book)}
                  />
                );
              })}
            {books.filter((b) => b.category === selectedCategory).length === 0 && (
              <div className="col-span-full py-16 text-center text-amber-600/70 font-bold tracking-widest text-lg glass-panel rounded-2xl border border-amber-900/30">
                這個分類的卷軸目前皆已隱藏，等待未來的收錄...
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 人氣排行榜 */}
          {!pickingStudentId && (
            <PopularRanking
              topBooks={topBooks}
              onSelectBook={(book) => handleCardClick(book)}
            />
          )}

          {/* 分類卡片專區 */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-6 flex items-center tracking-wider drop-shadow-md">
              <Folder className="w-6 h-6 mr-3 text-amber-500" />
              魔導書分類卷軸
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categoryNames.map((catName) => {
                const catBooks = books.filter((b) => b.category === catName);
                const availableCount = catBooks.filter((b) => b.status === "available").length;

                return (
                  <div
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className="glass-panel border border-[#8b6508]/40 rounded-2xl p-5 sm:p-6 cursor-pointer hover:border-amber-400 hover:shadow-[0_10px_30px_rgba(217,119,6,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-amber-100 group-hover:text-amber-300 transition-colors leading-snug">
                        {formatCategoryPill(catName)}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2">
                        共 {catBooks.length} 冊藏書
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                        {availableCount} 本可借
                      </span>
                      <span className="text-xs text-amber-500 group-hover:text-amber-300 font-bold flex items-center">
                        瀏覽此類 →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

