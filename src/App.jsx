import React, { useState } from "react";
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
import BatchImportModal from "./components/admin/BatchImportModal";
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
  resetAllData
} from "./services/libraryService";

export default function App() {
  const { user, loading: authLoading, errorMessage, handleLogin, handleLogout } = useAuth();
  const { categories, students, books, records, holidays, loading: dataLoading, setStudents } = useLibraryData(user);

  // 視圖狀態
  const [activeTab, setActiveTab] = useState("library"); // 'library' | 'wizards' | 'admin'
  const [selectedWizardId, setSelectedWizardId] = useState(null);
  const [pickingStudentId, setPickingStudentId] = useState(null);

  // 彈窗狀態
  const [contractBook, setContractBook] = useState(null);
  const [contractStudentId, setContractStudentId] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // 管理後台彈窗狀態
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
    } catch (err) {
      console.error("直接借閱失敗:", err);
      alert("借閱契約簽訂失敗，請檢查網路連線。");
    }
  };

  // 歸還書籍（僅計入有效下課/早自修時段）
  const handleReturnBook = async (bookId, studentId) => {
    try {
      await returnBook(bookId, studentId, books, students, records, holidays);
    } catch (err) {
      console.error("歸還失敗:", err);
      alert("歸還魔導書失敗，請稍後再試。");
    }
  };

  // 從學徒詳情進入挑書模式
  const handleStartPickingBook = (studentId) => {
    setPickingStudentId(studentId);
    setActiveTab("library");
  };

  // 後台管理書籍
  const handleAddBook = async (bookData) => {
    try {
      await addBook(bookData, categories);
    } catch (err) {
      console.error("新增書籍失敗:", err);
      alert("收錄書籍失敗，請稍後再試。");
    }
  };

  const handleBatchImport = async (textData) => {
    return await batchImportBooks(textData, categories);
  };

  const handleSaveEditBook = async (updatedBook) => {
    try {
      await updateBook(updatedBook);
      setEditingBook(null);
    } catch (err) {
      console.error("更新書籍失敗:", err);
      alert("更新書籍資料失敗。");
    }
  };

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
        alert(err.message || "刪除書籍失敗。");
      }
    }
  };

  const handleForceReleaseBook = async (book) => {
    const borrower = students.find((s) => s.id === book.borrowerId);
    const borrowerName = borrower ? borrower.name : "已被刪除的學徒";
    if (
      window.confirm(
        `確定要強制釋放「${book.title}」嗎？\n目前借閱者：${borrowerName}\n這會把書放回可借閱、並結束這筆借閱紀錄（不加減魔力）。`
      )
    ) {
      try {
        await forceReleaseBook(book, records, holidays);
      } catch (err) {
        console.error("強制釋放失敗:", err);
        alert("強制釋放失敗。");
      }
    }
  };

  // 後台管理分類
  const handleAddCategory = async (name) => {
    try {
      await addCategory(name, categories);
    } catch (err) {
      console.error("新增分類失敗:", err);
      alert(err.message || "新增分類失敗。");
    }
  };

  const handleRenameCategory = async (catId, oldName, newName) => {
    try {
      await renameCategory(catId, oldName, newName, books, categories);
    } catch (err) {
      console.error("修改分類失敗:", err);
      alert(err.message || "修改分類失敗。");
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    const bookCount = books.filter((b) => b.category === catName).length;
    if (bookCount > 0) {
      alert(`「${catName}」底下還有 ${bookCount} 本書，請先把這些書改分類或刪除，才能刪除此類別。`);
      return;
    }
    if (window.confirm(`確定要刪除類別「${catName}」嗎？`)) {
      try {
        await deleteCategory(catId, catName, books);
      } catch (err) {
        console.error("刪除分類失敗:", err);
        alert(err.message || "刪除分類失敗。");
      }
    }
  };

  // 後台管理學徒
  const handleAddStudent = async () => {
    try {
      await addStudent(students);
    } catch (err) {
      console.error("新增學徒失敗:", err);
      alert("新增學徒失敗。");
    }
  };

  const handleUpdateStudent = async (studentId, field, value) => {
    // 樂觀更新
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, [field]: value } : s))
    );
    try {
      await updateStudentField(studentId, field, value);
    } catch (err) {
      console.error("更新學徒欄位失敗:", err);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("確定要將這位學徒從名冊中除名嗎？")) {
      try {
        await deleteStudent(studentId, books, records, holidays);
        if (selectedWizardId === studentId) {
          setSelectedWizardId(null);
        }
      } catch (err) {
        console.error("除名學徒失敗:", err);
        alert("除名學徒失敗。");
      }
    }
  };

  // 後台管理國定假日與放假日期
  const handleAddHoliday = async (dateStr, name) => {
    try {
      await addHoliday(dateStr, name);
    } catch (err) {
      console.error("新增放假日失敗:", err);
      alert("新增放假日期失敗，請檢查網路連線。");
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await deleteHoliday(id);
    } catch (err) {
      console.error("刪除放假日失敗:", err);
      alert("刪除放假日期失敗。");
    }
  };

  // 禁忌魔法全域重置
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetAllData(books, students, records);
      setIsResetModalOpen(false);
    } catch (err) {
      console.error("重置失敗:", err);
      alert("重置魔法失敗，請稍後再試。");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6">
        {/* 魔法書局招牌頂部 */}
        <Header />

        {/* 導覽分頁按鈕 */}
        <NavTabs
          activeTab={activeTab}
          isDetailOpen={!!selectedWizardId}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedWizardId(null);
            setPickingStudentId(null);
          }}
        />

        {/* 主內容區塊 */}
        <main className="pb-10 sm:pb-20">
          {activeTab === "library" && (
            <BookGrid
              books={books}
              categories={categories}
              students={students}
              records={records}
              pickingStudentId={pickingStudentId}
              onCancelPicking={() => setPickingStudentId(null)}
              onSelectBookToBorrow={handleOpenBorrowModal}
              onDirectBorrowForStudent={handleDirectBorrowForStudent}
            />
          )}

          {activeTab === "wizards" && !selectedWizardId && (
            <WizardList
              students={students}
              books={books}
              onSelectWizard={(id) => setSelectedWizardId(id)}
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
              onStartPickingBook={handleStartPickingBook}
            />
          )}

          {activeTab === "admin" && (
            <AdminDashboard
              books={books}
              students={students}
              categories={categories}
              holidays={holidays}
              onAddBookClick={() => setIsAddBookOpen(true)}
              onBatchImportClick={() => setIsBatchImportOpen(true)}
              onEditBookClick={(b) => setEditingBook(b)}
              onDeleteBook={handleDeleteBook}
              onForceReleaseBook={handleForceReleaseBook}
              onAddCategory={handleAddCategory}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddHoliday={handleAddHoliday}
              onDeleteHoliday={handleDeleteHoliday}
              onOpenResetModal={() => setIsResetModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* 頁尾 */}
        <Footer />
      </div>

      {/* 借閱契約彈窗 */}
      <BorrowContractModal
        isOpen={!!contractBook}
        book={contractBook}
        students={students}
        selectedStudentId={contractStudentId}
        onSelectStudent={setContractStudentId}
        onConfirm={handleConfirmBorrow}
        onClose={() => setContractBook(null)}
      />

      {/* 借閱成功提示彈窗 */}
      <BorrowSuccessModal
        successInfo={successInfo}
        onClose={() => {
          setSuccessInfo(null);
          setActiveTab("wizards");
          setSelectedWizardId(null);
        }}
      />

      {/* 收錄新書彈窗 */}
      <AddBookModal
        isOpen={isAddBookOpen}
        categories={categories}
        onAddBook={handleAddBook}
        onClose={() => setIsAddBookOpen(false)}
      />

      {/* 編輯書籍彈窗 */}
      <EditBookModal
        isOpen={!!editingBook}
        book={editingBook}
        categories={categories}
        onSave={handleSaveEditBook}
        onClose={() => setEditingBook(null)}
      />

      {/* 批量匯入彈窗 */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onImport={handleBatchImport}
        onClose={() => setIsBatchImportOpen(false)}
      />

      {/* 禁忌魔法重置彈窗 */}
      <ForbiddenMagicModal
        isOpen={isResetModalOpen}
        isResetting={isResetting}
        onConfirm={handleConfirmReset}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

