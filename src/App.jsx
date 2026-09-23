import React, { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import NavTabs from "./components/layout/NavTabs";
import Footer from "./components/layout/Footer";
import BookGrid from "./components/library/BookGrid";
import BorrowContractModal from "./components/library/BorrowContractModal";
import WizardList from "./components/wizards/WizardList";
import WizardDetail from "./components/wizards/WizardDetail";
import AdminDashboard from "./components/admin/AdminDashboard";
import AddBookModal from "./components/admin/AddBookModal";
import EditBookModal from "./components/admin/EditBookModal";
import ForbiddenMagicModal from "./components/admin/ForbiddenMagicModal";
import BorrowSuccessModal from "./components/common/BorrowSuccessModal";
import LoadingScreen from "./components/common/LoadingScreen";
import LoginScreen from "./components/common/LoginScreen";

import { useAuth } from "./hooks/useAuth";
import { useLibraryData } from "./hooks/useLibraryData";
import {
  borrowBook,
  returnBook,
  addBook,
  batchImportBooks,
  updateBook,
  deleteBook,
  forceReleaseBook,
  addCategory,
  renameCategory,
  deleteCategory,
  addStudent,
  updateStudentField,
  deleteStudent,
  addHoliday,
  deleteHoliday,
  resetAllData,
  batchAuditAndRewardRecords
} from "./services/libraryService";

export default function App() {
  const { user, loading: authLoading, errorMessage, handleLogin, handleLogout } = useAuth();
  const { categories, students, books, records, holidays, loading: dataLoading, setStudents } = useLibraryData(user);

  // 視圖狀態
  const [activeTab, setActiveTab] = useState("library"); // 'library' | 'wizards' | 'admin'
  const [selectedWizardId, setSelectedWizardId] = useState(null);
  const [pickingStudentId, setPickingStudentId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 彈窗狀態
  const [contractBook, setContractBook] = useState(null);
  const [contractStudentId, setContractStudentId] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // 管理後台彈窗狀態
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 點擊學徒詳情平滑滾動至頂部
  useEffect(() => {
    if (activeTab === "wizards" && selectedWizardId) {
      requestAnimationFrame(() => {
        const el = document.getElementById("wizard-detail-top");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [selectedWizardId, activeTab]);

  // 挑書模式平滑滾動至頂部
  useEffect(() => {
    if (pickingStudentId) {
      requestAnimationFrame(() => {
        const el = document.getElementById("library-top");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [pickingStudentId, selectedCategory]);

  // 載入狀態防護
  if (authLoading || (user && dataLoading)) {
    return <LoadingScreen />;
  }

  // 未登入防護
  if (!user) {
    return <LoginScreen onLogin={handleLogin} errorMessage={errorMessage} />;
  }

  const selectedWizard = students.find((s) => s.id === selectedWizardId);

  // 借閱契約操作
  const handleOpenBorrowModal = (book) => {
    setContractBook(book);
    setContractStudentId("");
  };

  const handleConfirmBorrow = async () => {
    if (!contractBook || !contractStudentId) return;
    try {
      const student = students.find((s) => s.id === contractStudentId);
      await borrowBook(contractBook, contractStudentId);
      setSuccessInfo({
        title: contractBook.title,
        student: student ? student.name : ""
      });
      setContractBook(null);
      setContractStudentId("");
    } catch (err) {
      console.error("借閱失敗:", err);
      alert("借閱契約簽訂失敗，請檢查網路連線。");
    }
  };

  // 直接為選定學徒借閱
  const handleDirectBorrowForStudent = async (book) => {
    if (!pickingStudentId) return;
    try {
      const student = students.find((s) => s.id === pickingStudentId);
      await borrowBook(book, pickingStudentId);
      setSuccessInfo({
        title: book.title,
        student: student ? student.name : ""
      });
      setActiveTab("wizards");
      setSelectedWizardId(pickingStudentId);
      setPickingStudentId(null);
      setSelectedCategory(null);
    } catch (err) {
      console.error("直接借閱失敗:", err);
      alert("借閱失敗，請稍後再試。");
    }
  };

  // 歸還書籍（傳入 records, students, holidays 以排除假日與課堂時段計算並獎勵魔力）
  const handleReturnBook = async (bookId, studentId) => {
    try {
      await returnBook(bookId, studentId, records, students, holidays);
    } catch (err) {
      console.error("歸還書籍失敗:", err);
      alert("歸還失敗，請稍後再試。");
    }
  };

  // 成功借閱彈窗關閉回到名冊
  const handleCloseSuccess = () => {
    setSuccessInfo(null);
    setPickingStudentId(null);
    setSelectedCategory(null);
    setSelectedWizardId(null);
    setActiveTab("wizards");
  };

  // 新增書籍
  const handleAddBook = async (bookData) => {
    try {
      await addBook(bookData, categories);
      setIsAddBookOpen(false);
    } catch (err) {
      console.error("收錄書籍失敗:", err);
      alert("收錄書籍失敗，請檢查輸入內容。");
    }
  };

  // 批量匯入書籍
  const handleBatchImport = async (text) => {
    return await batchImportBooks(text, categories);
  };

  // 儲存編輯書籍
  const handleSaveBook = async (bookData) => {
    try {
      await updateBook(bookData);
      setEditingBook(null);
    } catch (err) {
      console.error("更新書籍失敗:", err);
      alert("更新書籍失敗。");
    }
  };

  // 刪除書籍
  const handleDeleteBook = async (book) => {
    if (book.status === "borrowed") {
      alert("這本書正被借走，請先歸還再刪除。");
      return;
    }
    if (window.confirm(`確定要永久刪除「${book.title}」嗎？`)) {
      try {
        await deleteBook(book);
      } catch (err) {
        console.error("刪除書籍失敗:", err);
        alert("刪除書籍失敗。");
      }
    }
  };

  // 強制釋放外借書籍
  const handleForceReleaseBook = async (book) => {
    const borrower = students.find((s) => s.id === book.borrowerId);
    const name = borrower ? borrower.name : "已被除名的學徒";
    if (
      !window.confirm(
        `確定要強制釋放「${book.title}」嗎？\n目前借閱者：${name}\n這會把書放回可借閱、並結束這筆借閱紀錄（不加減魔力）。`
      )
    ) {
      return;
    }
    try {
      await forceReleaseBook(book, records, holidays);
    } catch (err) {
      console.error("強制釋放失敗:", err);
      alert("強制釋放失敗。");
    }
  };

  // 類別操作
  const handleAddCategory = async (name) => {
    try {
      await addCategory(name, categories);
    } catch (err) {
      console.error("新增類別失敗:", err);
      alert("新增類別失敗。");
    }
  };

  const handleRenameCategory = async (catId, oldName, newName) => {
    try {
      await renameCategory(catId, oldName, newName, books, categories);
    } catch (err) {
      console.error("類別改名失敗:", err);
      alert("類別改名失敗。");
    }
  };

  const handleDeleteCategory = async (cat) => {
    const count = books.filter((b) => b.category === cat.name).length;
    if (count > 0) {
      alert(`「${cat.name}」底下還有 ${count} 本書，請先把這些書改分類或刪除，才能刪除此類別。`);
      return;
    }
    if (window.confirm(`確定要刪除類別「${cat.name}」嗎？`)) {
      try {
        await deleteCategory(cat.id, cat.name, books);
      } catch (err) {
        console.error("刪除類別失敗:", err);
        alert("刪除類別失敗。");
      }
    }
  };

  // 學徒管理
  const handleAddStudent = async () => {
    try {
      await addStudent(students);
    } catch (err) {
      console.error("新增學徒失敗:", err);
      alert("新增學徒失敗。");
    }
  };

  const handleUpdateStudent = async (studentId, field, value) => {
    // 樂觀更新本地狀態
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, [field]: value } : s))
    );
    try {
      await updateStudentField(studentId, field, value);
    } catch (err) {
      console.error("更新學徒失敗:", err);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("確定要將這位學徒從名冊中除名嗎？")) {
      try {
        await deleteStudent(studentId, books, records, holidays);
      } catch (err) {
        console.error("除名學徒失敗:", err);
        alert("除名失敗。");
      }
    }
  };

  // 國定假日管理
  const handleAddHoliday = async (date, name) => {
    try {
      await addHoliday(date, name);
    } catch (err) {
      console.error("新增放假日失敗:", err);
      alert("新增放假日失敗。");
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      await deleteHoliday(holidayId);
    } catch (err) {
      console.error("移除放假日失敗:", err);
      alert("移除放假日失敗。");
    }
  };

  // 9/17~9/23 借閱時長審計與補發魔力點數
  const handleAuditAndRewardRecords = async (options) => {
    return await batchAuditAndRewardRecords({
      records,
      students,
      books,
      holidays,
      ...options
    });
  };

  // 學期重置禁忌魔法
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetAllData(books, students, records);
      setIsResetModalOpen(false);
      alert("已成功釋放禁忌魔法，完成學期重置。");
    } catch (err) {
      console.error("重置失敗:", err);
      alert("重置失敗，請檢查權限或網路連線。");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200 font-sans p-2 sm:p-4 md:p-8 selection:bg-amber-900 selection:text-amber-100 relative overflow-hidden"
      style={{
        backgroundImage:
          'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4yNSI+PGxpbmUgeDE9IjAiIHkxPSI2MCIgeDI9IjEyMCIgeTI9IjYwIiAvPjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjMwIiAvPjxyZWN0IHg9IjMyIiB5PSIyMCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjQwIiAvPjxwYXRoIGQ9Ik00Niw2MCBMNTYsMjUgTDY2LDI4IEw1Niw2MCBaIiAvPjxwYXRoIGQ9Ik04MCw0NSBMMTEwLDE1IiAvPjxjaXJjbGUgY3g9IjExMCIgY3k9IjE1IiByPSIyIiBmaWxsPSIjMzM0MTU1IiAvPjxwYXRoIGQ9Ik05NSwyNSBMOTksMjEgTTEwMCwzMiBMMTA0LDI4IE0xMDUsMTAgTTEwMSwxNCIgLz48cGF0aCBkPSJNMzAsOTAgTDMzLDk2IEw0MCw5NiBMMzQsMTAwIEwzNywxMDYgTDMwLDEwMiBMMjMsMTA2IEwyNiwxMDAgTDIwLDk2IEwyNyw5NiBaIiBmaWxsPSIjMzM0MTU1IiAvPjwvZz48L3N2Zz4=")',
        backgroundSize: "120px 120px"
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* 頂部木牌招牌 */}
        <Header />

        {/* 導覽分頁 */}
        <NavTabs
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedWizardId(null);
            setPickingStudentId(null);
            setSelectedCategory(null);
          }}
          isDetailOpen={Boolean(selectedWizardId)}
        />

        {/* 主要視圖內容 */}
        <main className="px-4 sm:px-0 pb-10 sm:pb-20">
          {activeTab === "library" && (
            <BookGrid
              books={books}
              categories={categories}
              students={students}
              records={records}
              pickingStudentId={pickingStudentId}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onCancelPicking={() => {
                setActiveTab("wizards");
                setSelectedWizardId(pickingStudentId);
                setPickingStudentId(null);
                setSelectedCategory(null);
              }}
              onSelectBookToBorrow={handleOpenBorrowModal}
              onDirectBorrowForStudent={handleDirectBorrowForStudent}
            />
          )}

          {activeTab === "wizards" && !selectedWizardId && (
            <WizardList
              students={students}
              onSelectWizard={(studentId) => setSelectedWizardId(studentId)}
            />
          )}

          {activeTab === "wizards" && selectedWizardId && (
            <WizardDetail
              student={selectedWizard}
              books={books}
              records={records}
              holidays={holidays}
              onBack={() => setSelectedWizardId(null)}
              onReturnBook={handleReturnBook}
              onStartPickingBook={(studentId) => {
                setPickingStudentId(studentId);
                setActiveTab("library");
                setSelectedCategory(null);
              }}
            />
          )}

          {activeTab === "admin" && (
            <AdminDashboard
              books={books}
              students={students}
              categories={categories}
              holidays={holidays}
              onAddBookClick={() => setIsAddBookOpen(true)}
              onEditBookClick={(book) => setEditingBook(book)}
              onDeleteBook={handleDeleteBook}
              onForceReleaseBook={handleForceReleaseBook}
              onAddCategory={handleAddCategory}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBatchImport={handleBatchImport}
              onAddHoliday={handleAddHoliday}
              onDeleteHoliday={handleDeleteHoliday}
              onOpenResetModal={() => setIsResetModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* 借閱契約彈窗 */}
        <BorrowContractModal
          isOpen={Boolean(contractBook)}
          book={contractBook}
          students={students}
          selectedStudentId={contractStudentId}
          onSelectStudent={setContractStudentId}
          onConfirm={handleConfirmBorrow}
          onClose={() => {
            setContractBook(null);
            setContractStudentId("");
          }}
        />

        {/* 借閱成功彈窗 */}
        <BorrowSuccessModal
          successInfo={successInfo}
          onClose={handleCloseSuccess}
        />

        {/* 後台收錄新書彈窗 */}
        <AddBookModal
          isOpen={isAddBookOpen}
          categories={categories}
          onAddBook={handleAddBook}
          onClose={() => setIsAddBookOpen(false)}
        />

        {/* 後台編輯書籍彈窗 */}
        <EditBookModal
          isOpen={Boolean(editingBook)}
          book={editingBook}
          categories={categories}
          onSave={handleSaveBook}
          onClose={() => setEditingBook(null)}
        />

        {/* 學期重置禁忌魔法確認彈窗 */}
        <ForbiddenMagicModal
          isOpen={isResetModalOpen}
          isResetting={isResetting}
          onConfirm={handleConfirmReset}
          onClose={() => setIsResetModalOpen(false)}
        />

        {/* 頁尾 */}
        <Footer />
      </div>
    </div>
  );
}
