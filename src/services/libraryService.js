import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { signInWithPopup, signOut } from "firebase/auth";
import { db, auth, googleProvider } from "./firebase";
import {
  INITIAL_STUDENTS,
  INITIAL_BOOKS,
  INITIAL_RECORDS,
  INITIAL_CATEGORIES,
  DURATION_THRESHOLD_MINUTES,
  MAGIC_POINTS_REWARD
} from "../constants/seedData";
import { BOOK_COVERS } from "../constants/bookCovers";
import { WIZARD_AVATARS } from "../constants/avatars";
import { getCurrentDateTimeString, calculateDurationMinutes, calculateValidReadingMinutes } from "../utils/dateUtils";
import { formatBookTitle } from "../utils/textUtils";

const APP_KEY = "class-library";

// 取得集合參考
export const getStudentsCol = () => collection(db, "artifacts", APP_KEY, "public", "data", "students");
export const getBooksCol = () => collection(db, "artifacts", APP_KEY, "public", "data", "books");
export const getRecordsCol = () => collection(db, "artifacts", APP_KEY, "public", "data", "records");
export const getCategoriesCol = () => collection(db, "artifacts", APP_KEY, "public", "data", "categories");
export const getHolidaysCol = () => collection(db, "artifacts", APP_KEY, "public", "data", "holidays");
export const getInitDoc = () => doc(db, "artifacts", APP_KEY, "public", "data", "meta", "init");

/**
 * 系統種子資料初始化檢查與植入
 */
export async function seedInitialDataIfNeeded() {
  try {
    const initRef = getInitDoc();
    const initSnap = await getDoc(initRef);
    if (initSnap.exists()) return;

    const studentsCol = getStudentsCol();
    const booksCol = getBooksCol();
    const recordsCol = getRecordsCol();
    const categoriesCol = getCategoriesCol();

    const [sSnap, bSnap, rSnap, cSnap] = await Promise.all([
      getDocs(studentsCol),
      getDocs(booksCol),
      getDocs(recordsCol),
      getDocs(categoriesCol)
    ]);

    if (sSnap.empty && bSnap.empty && rSnap.empty && cSnap.empty) {
      await Promise.all([
        ...INITIAL_STUDENTS.map(item => setDoc(doc(studentsCol, item.id), item)),
        ...INITIAL_BOOKS.map(item => setDoc(doc(booksCol, item.id), item)),
        ...INITIAL_RECORDS.map(item => setDoc(doc(recordsCol, item.id), item)),
        ...INITIAL_CATEGORIES.map(item => setDoc(doc(categoriesCol, item.id), item))
      ]);
    } else if (cSnap.empty) {
      await Promise.all(INITIAL_CATEGORIES.map(item => setDoc(doc(categoriesCol, item.id), item)));
    }

    await setDoc(initRef, { seeded: true, at: Date.now() });
  } catch (err) {
    console.error("初始化種子資料失敗:", err);
  }
}

/**
 * 即時監聽分類列表
 */
export function subscribeCategories(onUpdate, onError) {
  return onSnapshot(
    getCategoriesCol(),
    (snapshot) => {
      const list = snapshot.docs
        .map(d => d.data())
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onUpdate(list);
    },
    onError
  );
}

/**
 * 即時監聽學徒名冊
 */
export function subscribeStudents(onUpdate, onError) {
  return onSnapshot(
    getStudentsCol(),
    (snapshot) => {
      const list = snapshot.docs
        .map(d => d.data())
        .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));
      onUpdate(list);
    },
    onError
  );
}

/**
 * 即時監聽書籍資料庫
 */
export function subscribeBooks(onUpdate, onError) {
  return onSnapshot(
    getBooksCol(),
    (snapshot) => {
      const list = snapshot.docs.map(d => d.data());
      onUpdate(list);
    },
    onError
  );
}

/**
 * 即時監聽借閱日誌
 */
export function subscribeRecords(onUpdate, onError) {
  return onSnapshot(
    getRecordsCol(),
    (snapshot) => {
      const list = snapshot.docs
        .map(d => d.data())
        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
      onUpdate(list);
    },
    onError
  );
}

/**
 * 借閱書籍（簽訂契約）
 */
export async function borrowBook(book, studentId) {
  const recordId = `r${Date.now()}`;
  const now = getCurrentDateTimeString();
  const record = {
    id: recordId,
    bookId: book.id,
    studentId,
    borrowDate: now,
    returnDate: null,
    status: "active"
  };

  const recordRef = doc(getRecordsCol(), recordId);
  const bookRef = doc(getBooksCol(), book.id);

  await Promise.all([
    setDoc(recordRef, record),
    setDoc(bookRef, { ...book, status: "borrowed", borrowerId: studentId }, { merge: true })
  ]);

  return record;
}

/**
 * 計算學徒借閱該書的歷史累計閱讀分鐘（僅計算有效下課與早自修時段）
 */
export function getAccumulatedReadingMinutes(studentId, bookId, records, holidays = []) {
  return records
    .filter(r => r.studentId === studentId && r.bookId === bookId && r.status === "returned")
    .reduce((sum, r) => {
      const minutes = typeof r.durationMinutes === "number"
        ? r.durationMinutes
        : calculateValidReadingMinutes(r.borrowDate, r.returnDate, holidays);
      return sum + minutes;
    }, 0);
}

/**
 * 歸還書籍（完成修行，滿 30 分鐘以上獎勵 10 點魔力，僅計入指定下課/早自修時段）
 */
export async function returnBook(bookId, studentId, arg3, arg4, arg5, arg6) {
  let records = [];
  let students = [];
  let holidays = [];

  // 智能解析傳入參數
  const allArrays = [arg3, arg4, arg5, arg6].filter(Array.isArray);
  for (const arr of allArrays) {
    if (arr.length === 0) continue;
    const first = arr[0];
    if (typeof first === "string" || (first && "date" in first)) {
      holidays = arr;
    } else if (first && ("borrowDate" in first || "bookId" in first)) {
      records = arr;
    } else if (first && ("seatNumber" in first || "magicPoints" in first)) {
      students = arr;
    }
  }

  // 兜底長度處理
  if (arguments.length >= 6) {
    if (!students.length && Array.isArray(arg4)) students = arg4;
    if (!records.length && Array.isArray(arg5)) records = arg5;
    if (!holidays.length && Array.isArray(arg6)) holidays = arg6;
  } else if (arguments.length === 5) {
    if (!records.length && Array.isArray(arg3)) records = arg3;
    if (!students.length && Array.isArray(arg4)) students = arg4;
    if (!holidays.length && Array.isArray(arg5)) holidays = arg5;
  } else if (arguments.length === 4) {
    if (!records.length && Array.isArray(arg3)) records = arg3;
    if (!students.length && Array.isArray(arg4)) students = arg4;
  } else if (arguments.length === 3) {
    if (!holidays.length && Array.isArray(arg3)) holidays = arg3;
  }

  const now = getCurrentDateTimeString();

  // 1. 尋找進行中的借閱紀錄 (activeRecord)
  let activeRecord =
    records.find((r) => r.bookId === bookId && r.studentId === studentId && r.status === "active") ||
    records.find((r) => r.bookId === bookId && r.status === "active");

  // 若記憶體中未找到，從 Firestore 線上查詢
  if (!activeRecord) {
    try {
      const q = query(
        getRecordsCol(),
        where("bookId", "==", bookId),
        where("status", "==", "active")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docMatch =
          snap.docs.find((d) => d.data().studentId === studentId) || snap.docs[0];
        activeRecord = { id: docMatch.id, ...docMatch.data() };
      }
    } catch (err) {
      console.warn("Firestore 查詢 activeRecord 警示:", err);
    }
  }

  // 2. 尋找學徒資料 (student)
  let student = students.find((s) => s.id === studentId);
  let currentPoints = Number(student?.magicPoints || 0);
  if (studentId) {
    try {
      const sDoc = await getDoc(doc(getStudentsCol(), studentId));
      if (sDoc.exists()) {
        student = { id: sDoc.id, ...sDoc.data() };
        currentPoints = Number(sDoc.data().magicPoints || 0);
      }
    } catch (err) {
      console.warn("Firestore 查詢 student 警示:", err);
    }
  }

  // 3. 計算有效借閱修練時長（排除放假日與非下課/早自修時段）
  const duration = activeRecord
    ? calculateValidReadingMinutes(activeRecord.borrowDate, now, holidays)
    : 0;

  // 4. 計算過去累計閱讀時長
  let previousMinutes = 0;
  if (records.length > 0) {
    previousMinutes = getAccumulatedReadingMinutes(studentId, bookId, records, holidays);
  } else if (studentId) {
    try {
      const q = query(
        getRecordsCol(),
        where("studentId", "==", studentId),
        where("bookId", "==", bookId),
        where("status", "==", "returned")
      );
      const snap = await getDocs(q);
      const histRecords = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      previousMinutes = getAccumulatedReadingMinutes(studentId, bookId, histRecords, holidays);
    } catch (err) {
      console.warn("Firestore 查詢歷史借閱紀錄警示:", err);
    }
  }

  const totalMinutes = previousMinutes + duration;

  // 有達 30 分鐘以上才給加點（單次借閱達 30 分鐘以上，或累計跨過 30 分鐘門檻）
  const isDirect30Min = duration >= DURATION_THRESHOLD_MINUTES;
  const isAccumulated30Min =
    previousMinutes < DURATION_THRESHOLD_MINUTES &&
    totalMinutes >= DURATION_THRESHOLD_MINUTES;
  const shouldReward = isDirect30Min || isAccumulated30Min;

  const promises = [];

  // 更新借閱紀錄為已歸還，並標註有效閱讀分鐘與獎勵狀態
  if (activeRecord) {
    const recordRef = doc(getRecordsCol(), activeRecord.id);
    promises.push(
      setDoc(
        recordRef,
        {
          returnDate: now,
          status: "returned",
          durationMinutes: duration,
          rewarded: shouldReward
        },
        { merge: true }
      )
    );
  }

  // 更新書籍狀態為可借閱
  const bookRef = doc(getBooksCol(), bookId);
  promises.push(
    setDoc(bookRef, { status: "available", borrowerId: null }, { merge: true })
  );

  // 若修行滿 30 分鐘以上，獎勵 10 點魔力
  if (studentId && shouldReward) {
    const studentRef = doc(getStudentsCol(), studentId);
    promises.push(
      setDoc(
        studentRef,
        { magicPoints: currentPoints + MAGIC_POINTS_REWARD },
        { merge: true }
      )
    );
  }

  await Promise.all(promises);

  return {
    duration,
    shouldReward,
    magicPointsAdded: shouldReward ? MAGIC_POINTS_REWARD : 0
  };
}

/**
 * 檢查並核算指定日期區間（預設 2026-09-17 ~ 2026-09-23）的所有借閱紀錄，
 * 依據課間限定規範重新計算有效修行時長，
 * 並為達 30 分鐘以上但尚未獲得獎勵的紀錄進行補發加點。
 */
export async function batchAuditAndRewardRecords({
  records = [],
  students = [],
  books = [],
  holidays = [],
  startDate = "2026-09-17",
  endDate = "2026-09-23",
  applyChanges = false
}) {
  const now = getCurrentDateTimeString();
  const auditResults = [];
  const studentPointsDelta = {}; // studentId -> points to add

  // 篩選指定日期區間內的紀錄 (借閱日或歸還日介於區間內)
  const filteredRecords = records.filter((r) => {
    const bDate = (r.borrowDate || "").slice(0, 10);
    const rDate = (r.returnDate || "").slice(0, 10);
    return (
      (bDate >= startDate && bDate <= endDate) ||
      (rDate >= startDate && rDate <= endDate)
    );
  });

  // 依借閱時間由舊至新排序，以便精確模擬修行累積歷程
  const sortedRecords = [...filteredRecords].sort((a, b) =>
    (a.borrowDate || "").localeCompare(b.borrowDate || "")
  );

  const studentBookAccum = {}; // `${studentId}_${bookId}` -> { total: number, rewarded: boolean }

  sortedRecords.forEach((record) => {
    const student = students.find((s) => s.id === record.studentId);
    const book = books.find((b) => b.id === record.bookId);

    // 計算依下課與早自修時段計算之有效分鐘數
    const endTime =
      record.returnDate || (record.status === "active" ? now : record.borrowDate);
    const validMinutes = calculateValidReadingMinutes(
      record.borrowDate,
      endTime,
      holidays
    );

    const sbKey = `${record.studentId}_${record.bookId}`;
    if (!studentBookAccum[sbKey]) {
      studentBookAccum[sbKey] = { total: 0, rewarded: false };
    }
    const prevTotal = studentBookAccum[sbKey].total;
    const nextTotal = prevTotal + validMinutes;
    studentBookAccum[sbKey].total = nextTotal;

    // 檢查是否達 30 分鐘以上門檻（單次達 30 分鐘，或累計跨過 30 分鐘門檻）
    const isDirect30Min = validMinutes >= DURATION_THRESHOLD_MINUTES;
    const isAccumulated30Min =
      prevTotal < DURATION_THRESHOLD_MINUTES &&
      nextTotal >= DURATION_THRESHOLD_MINUTES;
    const isQualifying = isDirect30Min || isAccumulated30Min;

    const isRewarded = Boolean(record.rewarded || studentBookAccum[sbKey].rewarded);
    if (record.rewarded) {
      studentBookAccum[sbKey].rewarded = true;
    }

    // 是否需要補發魔力點數 (達 30 分鐘以上且尚未獲得獎勵)
    const needsReward = isQualifying && !isRewarded;

    if (needsReward && record.studentId) {
      studentPointsDelta[record.studentId] =
        (studentPointsDelta[record.studentId] || 0) + MAGIC_POINTS_REWARD;
      studentBookAccum[sbKey].rewarded = true;
    }

    // 檢查原本紀錄是否有儲存 durationMinutes
    const currentDuration =
      typeof record.durationMinutes === "number" ? record.durationMinutes : null;
    const isDurationOutdated = currentDuration !== validMinutes;

    auditResults.push({
      recordId: record.id,
      studentId: record.studentId,
      studentName: student?.name || "未知學徒",
      seatNumber: student?.seatNumber || "",
      bookTitle: book?.title || "未知書目",
      borrowDate: record.borrowDate,
      returnDate:
        record.returnDate ||
        (record.status === "active" ? "借閱進行中" : "未記載"),
      status: record.status,
      currentDuration,
      validMinutes,
      isQualifying,
      isRewarded,
      needsReward,
      isDurationOutdated
    });
  });

  // 如果 applyChanges 為 true，直接寫入 Firestore
  if (applyChanges) {
    const recordPromises = auditResults.map((item) => {
      const recRef = doc(getRecordsCol(), item.recordId);
      const updateData = { durationMinutes: item.validMinutes };
      if (item.isQualifying) {
        updateData.rewarded = true;
      }
      return setDoc(recRef, updateData, { merge: true });
    });

    const studentPromises = Object.entries(studentPointsDelta).map(
      async ([stId, delta]) => {
        if (delta <= 0) return;
        const stRef = doc(getStudentsCol(), stId);
        const stSnap = await getDoc(stRef);
        const curPts = stSnap.exists()
          ? Number(stSnap.data().magicPoints || 0)
          : 0;
        return setDoc(stRef, { magicPoints: curPts + delta }, { merge: true });
      }
    );

    await Promise.all([...recordPromises, ...studentPromises]);
  }

  return {
    totalChecked: filteredRecords.length,
    qualifyingCount: auditResults.filter((r) => r.isQualifying).length,
    needsRewardCount: auditResults.filter((r) => r.needsReward).length,
    totalPointsToAward: Object.values(studentPointsDelta).reduce((a, b) => a + b, 0),
    studentPointsDelta,
    details: auditResults
  };
}

/**
 * 收錄新書（支援多本複本）
 */
export async function addBook({ title, author, category, copies }, categoryList) {
  const formattedTitle = formatBookTitle(title);
  const authorName = author.trim() || "未知學者";
  const cat = category || categoryList[0]?.name || "一般藏書";
  let count = parseInt(copies, 10);
  if (isNaN(count) || count < 1) count = 1;
  if (count > 20) count = 20;

  const now = Date.now();
  const booksCol = getBooksCol();

  const promises = Array.from({ length: count }, (_, index) => {
    const bookId = `b${now}_${index + 1}`;
    const newBook = {
      id: bookId,
      title: formattedTitle,
      category: cat,
      author: authorName,
      cover: BOOK_COVERS[Math.floor(Math.random() * BOOK_COVERS.length)],
      status: "available",
      borrowerId: null,
      copyNo: index + 1,
      copyTotal: count
    };
    return setDoc(doc(booksCol, bookId), newBook);
  });

  await Promise.all(promises);
}

/**
 * 批量匯入書籍（文字格式：書名 / 作者 / 類別 / 複本數量）
 */
export async function batchImportBooks(rawText, categoryList) {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const booksToAdd = [];
  let skippedHeader = 0;
  const now = Date.now();
  const defaultCategory = categoryList[0]?.name || "一般藏書";

  lines.forEach((line, lineIndex) => {
    const parts = line.split("/").map(p => p.trim());
    const rawTitle = parts[0] || "";
    if (!rawTitle || rawTitle === "書名") {
      skippedHeader++;
      return;
    }

    const author = parts[1] || "未知學者";
    const category = parts[2] || defaultCategory;
    let copies = parseInt(parts[3], 10);
    if (isNaN(copies) || copies < 1) copies = 1;
    if (copies > 20) copies = 20;

    const formattedTitle = formatBookTitle(rawTitle);

    for (let c = 0; c < copies; c++) {
      booksToAdd.push({
        id: `b${now}_${lineIndex}_${c + 1}_${Math.random().toString(36).slice(2, 7)}`,
        title: formattedTitle,
        category,
        author,
        cover: BOOK_COVERS[Math.floor(Math.random() * BOOK_COVERS.length)],
        status: "available",
        borrowerId: null,
        copyNo: c + 1,
        copyTotal: copies
      });
    }
  });

  if (booksToAdd.length === 0) {
    throw new Error("沒有可匯入的資料，請檢查格式。");
  }

  const booksCol = getBooksCol();
  await Promise.all(booksToAdd.map(b => setDoc(doc(booksCol, b.id), b)));
  return { totalBooks: booksToAdd.length, totalTitles: lines.length - skippedHeader };
}

/**
 * 編輯書籍
 */
export async function updateBook(book) {
  const formattedTitle = formatBookTitle(book.title);
  const bookRef = doc(getBooksCol(), book.id);
  await setDoc(bookRef, {
    title: formattedTitle,
    author: book.author.trim() || "未知學者",
    category: book.category,
    cover: book.cover,
    coverLocked: !!book.coverLocked
  }, { merge: true });
}

/**
 * 刪除書籍
 */
export async function deleteBook(bookOrId) {
  const bookId = typeof bookOrId === "object" && bookOrId !== null ? bookOrId.id : bookOrId;
  if (!bookId) return;
  if (typeof bookOrId === "object" && bookOrId !== null && bookOrId.status === "borrowed") {
    throw new Error("這本書正被借走，請先歸還再刪除。");
  }
  await deleteDoc(doc(getBooksCol(), bookId));
}

/**
 * 強制釋放書籍（將書放回可借閱、結清借閱日誌）
 */
export async function forceReleaseBook(book, records, holidays = []) {
  const now = getCurrentDateTimeString();
  const activeRecords = records.filter(r => r.bookId === book.id && r.status === "active");

  const promises = activeRecords.map(r => {
    return setDoc(
      doc(getRecordsCol(), r.id),
      { status: "returned", returnDate: now, durationMinutes: calculateValidReadingMinutes(r.borrowDate, now, holidays) },
      { merge: true }
    );
  });

  promises.push(
    setDoc(doc(getBooksCol(), book.id), { status: "available", borrowerId: null }, { merge: true })
  );

  await Promise.all(promises);
}

/**
 * 新增分類
 */
export async function addCategory(name, existingCategories) {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (existingCategories.some(c => c.name === trimmed)) {
    throw new Error("已經有同名的類別了。");
  }

  const catId = `c${Date.now()}`;
  const maxOrder = existingCategories.length > 0
    ? Math.max(...existingCategories.map(c => c.order ?? 0)) + 1
    : 0;

  await setDoc(doc(getCategoriesCol(), catId), {
    id: catId,
    name: trimmed,
    order: maxOrder
  });
}

/**
 * 編輯分類名稱（連帶更新所有已歸類書籍）
 */
export async function renameCategory(categoryId, oldName, newName, arg4 = [], arg5 = []) {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return;

  // 智慧辨識 arg4 和 arg5 哪一個是 books 哪一個是 existingCategories
  let books = [];
  let existingCategories = [];
  if (Array.isArray(arg4) && arg4.length > 0 && arg4[0].category !== undefined) {
    books = arg4;
    existingCategories = Array.isArray(arg5) ? arg5 : [];
  } else if (Array.isArray(arg5) && arg5.length > 0 && arg5[0].category !== undefined) {
    books = arg5;
    existingCategories = Array.isArray(arg4) ? arg4 : [];
  } else {
    existingCategories = Array.isArray(arg4) ? arg4 : [];
    books = Array.isArray(arg5) ? arg5 : [];
  }

  if (existingCategories.some((c) => c.name === trimmed)) {
    throw new Error("已經有同名的類別了。");
  }

  await setDoc(doc(getCategoriesCol(), categoryId), { name: trimmed }, { merge: true });

  const matchingBooks = books.filter((b) => b.category === oldName);
  const booksCol = getBooksCol();
  await Promise.all(
    matchingBooks.map((b) =>
      setDoc(doc(booksCol, b.id), { category: trimmed }, { merge: true })
    )
  );
}

/**
 * 刪除分類（若分類下尚有書籍則禁止刪除）
 */
export async function deleteCategory(categoryId, categoryName, books) {
  if (categoryName && Array.isArray(books)) {
    const bookCount = books.filter((b) => b.category === categoryName).length;
    if (bookCount > 0) {
      throw new Error(
        `「${categoryName}」底下還有 ${bookCount} 本書，請先把這些書改分類或刪除，才能刪除此類別。`
      );
    }
  }
  await deleteDoc(doc(getCategoriesCol(), categoryId));
}

/**
 * 新增學徒
 */
export async function addStudent(existingStudents) {
  const randomAvatar = WIZARD_AVATARS[Math.floor(Math.random() * WIZARD_AVATARS.length)];
  const nextSeat = existingStudents.length > 0
    ? Math.max(...existingStudents.map(s => Number(s.seatNumber) || 0)) + 1
    : 1;

  const studentId = `s${Date.now()}`;
  const newStudent = {
    id: studentId,
    seatNumber: nextSeat.toString(),
    name: "新學徒",
    avatar: randomAvatar,
    magicPoints: 0
  };

  await setDoc(doc(getStudentsCol(), studentId), newStudent);
}

/**
 * 更新學徒欄位
 */
export async function updateStudentField(studentId, field, value) {
  await setDoc(doc(getStudentsCol(), studentId), { [field]: value }, { merge: true });
}

/**
 * 刪除學徒（並自動結算其進行中的借閱）
 */
export async function deleteStudent(studentId, arg2 = [], arg3 = [], holidays = []) {
  const now = getCurrentDateTimeString();

  // 智慧辨識 arg2 與 arg3 哪一個是 books 哪一個是 records
  let books = [];
  let records = [];
  if (Array.isArray(arg2) && arg2.length > 0 && (arg2[0].borrowDate || arg2[0].status === "active" || arg2[0].status === "returned")) {
    records = arg2;
    books = Array.isArray(arg3) ? arg3 : [];
  } else {
    books = Array.isArray(arg2) ? arg2 : [];
    records = Array.isArray(arg3) ? arg3 : [];
  }

  const activeRecords = records.filter((r) => r.studentId === studentId && r.status === "active");
  const borrowedBooks = books.filter((b) => b.borrowerId === studentId);

  const promises = [
    ...activeRecords.map((r) =>
      setDoc(
        doc(getRecordsCol(), r.id),
        {
          status: "returned",
          returnDate: now,
          durationMinutes: calculateValidReadingMinutes(r.borrowDate, now, holidays)
        },
        { merge: true }
      )
    ),
    ...borrowedBooks.map((b) =>
      setDoc(doc(getBooksCol(), b.id), { status: "available", borrowerId: null }, { merge: true })
    ),
    deleteDoc(doc(getStudentsCol(), studentId))
  ];

  await Promise.all(promises);
}

/**
 * 訂閱國定假日與放假日期即時變更
 */
export function subscribeHolidays(onUpdate, onError) {
  const col = getHolidaysCol();
  return onSnapshot(
    col,
    (snapshot) => {
      const list = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      onUpdate(list);
    },
    onError
  );
}

/**
 * 新增國定假日/放假日期（排除借閱計算）
 */
export async function addHoliday(dateStr, name = "") {
  const trimmedDate = String(dateStr || "").trim();
  if (!trimmedDate) return;
  const col = getHolidaysCol();
  const id = `h_${trimmedDate.replace(/[^0-9]/g, "")}_${Date.now()}`;
  const docRef = doc(col, id);
  await setDoc(docRef, {
    id,
    date: trimmedDate,
    name: (name || "").trim() || "放假日",
    createdAt: Date.now()
  });
}

/**
 * 刪除放假日期
 */
export async function deleteHoliday(id) {
  if (!id) return;
  const docRef = doc(getHolidaysCol(), id);
  await deleteDoc(docRef);
}

/**
 * 禁忌魔法：重置所有資料（銷毀全部紀錄、學徒魔力值歸零、書籍全數歸還）
 */
export async function resetAllData(arg1 = [], students = [], arg3 = []) {
  const recordsCol = getRecordsCol();
  const studentsCol = getStudentsCol();
  const booksCol = getBooksCol();

  // 智慧辨識 arg1 和 arg3 哪一個是 books 哪一個是 records
  let books = arg1;
  let records = arg3;
  if (Array.isArray(arg1) && arg1.length > 0 && (arg1[0].borrowDate || arg1[0].bookId)) {
    records = arg1;
    books = Array.isArray(arg3) ? arg3 : [];
  }

  const deleteRecordPromises = (records || []).map((r) => deleteDoc(doc(recordsCol, r.id)));
  const resetStudentPromises = (students || [])
    .filter((s) => s.magicPoints !== 0)
    .map((s) => setDoc(doc(studentsCol, s.id), { magicPoints: 0 }, { merge: true }));
  const resetBookPromises = (books || [])
    .filter((b) => b.status !== "available")
    .map((b) => setDoc(doc(booksCol, b.id), { status: "available", borrowerId: null }, { merge: true }));

  await Promise.all([
    ...deleteRecordPromises,
    ...resetStudentPromises,
    ...resetBookPromises
  ]);
}

/**
 * Google 帳號登入
 */
export async function loginWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

/**
 * 登出
 */
export async function logout() {
  return await signOut(auth);
}

