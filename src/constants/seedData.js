export const INITIAL_STUDENTS = [
  { id: "s1", seatNumber: "1", name: "亞瑟 (Arthur)", avatar: "🧙‍♂️", magicPoints: 20 },
  { id: "s2", seatNumber: "2", name: "露娜 (Luna)", avatar: "🧚‍♀️", magicPoints: 50 },
  { id: "s3", seatNumber: "3", name: "賽門 (Simon)", avatar: "🧛‍♂️", magicPoints: 10 },
  { id: "s4", seatNumber: "4", name: "艾爾莎 (Elsa)", avatar: "🧝‍♀️", magicPoints: 0 },
  { id: "s5", seatNumber: "5", name: "奧立佛 (Oliver)", avatar: "🧞‍♂️", magicPoints: 30 }
];

export const INITIAL_BOOKS = [
  { id: "b1", title: "《小達文西 10月號》", category: "月刊：小達文西", author: "科學工坊", cover: "bg-blue-900", status: "available", borrowerId: null },
  { id: "b2", title: "《小達文西 11月號》", category: "月刊：小達文西", author: "科學工坊", cover: "bg-cyan-900", status: "available", borrowerId: null },
  { id: "b4", title: "《未來少年 10月號》", category: "月刊：未來少年", author: "未來編輯部", cover: "bg-indigo-900", status: "available", borrowerId: null },
  { id: "b6", title: "《太陽系的奧秘》", category: "i 學習百科：天文與地理（1~15）", author: "天文學家", cover: "bg-slate-800", status: "available", borrowerId: null },
  { id: "b8", title: "《人體運作大解密》", category: "i 學習百科：自然與健康（16~45）", author: "醫療中心", cover: "bg-red-900", status: "borrowed", borrowerId: "s2" },
  { id: "b10", title: "《改變世界的發明》", category: "i 學習百科：科技與生活（46~65）", author: "科技期刊", cover: "bg-amber-900", status: "available", borrowerId: null },
  { id: "b12", title: "《世界文明的起源》", category: "i 學習百科：歷史與社會（66~84）", author: "歷史學會", cover: "bg-yellow-900", status: "available", borrowerId: null },
  { id: "b14", title: "《走進名畫的世界》", category: "i 學習百科：藝術與文化（85~100）", author: "藝術導覽", cover: "bg-pink-900", status: "available", borrowerId: null },
  { id: "b16", title: "《三國演義精華》", category: "歷史故事", author: "羅貫中", cover: "bg-red-800", status: "available", borrowerId: null },
  { id: "b19", title: "《科學實驗王1：酸鹼中和》", category: "科學實驗王", author: "科學漫畫家", cover: "bg-emerald-800", status: "available", borrowerId: null }
];

export const INITIAL_RECORDS = [
  { id: "r1", bookId: "b8", studentId: "s2", borrowDate: "2023-10-25 10:30", returnDate: null, status: "active" }
];

export const DEFAULT_CATEGORY_NAMES = [
  "月刊：小達文西",
  "月刊：未來少年",
  "i 學習百科：天文與地理（1~15）",
  "i 學習百科：自然與健康（16~45）",
  "i 學習百科：科技與生活（46~65）",
  "i 學習百科：歷史與社會（66~84）",
  "i 學習百科：藝術與文化（85~100）",
  "歷史故事",
  "科學實驗王"
];

export const INITIAL_CATEGORIES = DEFAULT_CATEGORY_NAMES.map((name, index) => ({
  id: `c${index + 1}`,
  name,
  order: index
}));

export const DURATION_THRESHOLD_MINUTES = 30;
export const MAGIC_POINTS_REWARD = 10;

