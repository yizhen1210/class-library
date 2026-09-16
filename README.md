# 🧙‍♂️ 霍格華茲班級魔法書局 (Class Library)

> 專為國小班級設計的沉浸式主題圖書借閱與魔法閱讀修練系統。
> 
> *「每翻開一頁，都是一次靈魂的魔法修行。」*

![Class Library Badge](https://img.shields.io/badge/Stack-Vite%20%7C%20React%2018%20%7C%20TailwindCSS-indigo)
![Database](https://img.shields.io/badge/Backend-Firebase%20Firestore-amber)
![License](https://img.shields.io/badge/License-MIT-emerald)

---

## 📖 專案簡介

「霍格華茲班級魔法書局」將日常班級圖書借閱轉化為充滿魔法氛圍的閱讀修練遊戲化系統：
- **魔法學徒**：學生擁有獨立座號、專屬魔法頭像與累積魔力值。
- **魔導書庫**：每本藏書均有專屬魔法書皮配色，支援類別篩選、自然排序與人氣排行榜。
- **閱讀修行**：學生借閱書籍達指定修練時長（30 分鐘）並歸還時，系統自動獎勵魔力值。
- **中控管理**：教師可批次收錄書籍、分類管理、學生名冊維護、強制釋放借出書籍與全域資料重置。

---

## 🏛️ 軟體工程架構 (Software Architecture)

本專案經過正規軟體工程架構重構，遵循**關注點分離 (Separation of Concerns)** 與**單一職責原則 (Single Responsibility Principle)**：

```
class-library/
├── .env.example                # 環境變數範本 (Firebase Config)
├── .gitignore                  # Git 忽略檔案規範
├── package.json                # 專案相依套件與指令 (Vite, React, Tailwind, Lucide, Firebase)
├── vite.config.js              # 現代化前端建置工具設定
├── tailwind.config.js          # Tailwind CSS 主題與動畫設定
├── postcss.config.js           # PostCSS 配置
├── index.html                  # 應用程式入口 HTML
├── README.md                   # 專案說明與工程文件
└── src/
    ├── main.jsx                # React 啟動掛載點
    ├── App.jsx                 # 頂層狀態協調與主畫面排版
    ├── index.css               # 全域樣式、字型與自訂動畫
    ├── components/             # 視圖元件層 (UI Components)
    │   ├── layout/             # 頁面佈局元件 (Header, NavTabs, Footer)
    │   ├── library/            # 魔導書庫視圖 (BookCard, BookGrid, PopularRanking, BorrowContractModal)
    │   ├── wizards/            # 魔法學徒視圖 (WizardList, WizardDetail)
    │   ├── admin/              # 中控室管理面板 (AdminDashboard, AddBookModal, EditBookModal, BatchImportModal, ForbiddenMagicModal)
    │   └── common/             # 通用元件 (BorrowSuccessModal, LoadingScreen, LoginScreen)
    ├── services/               # 業務邏輯與雲端資料存取層 (Service Layer)
    │   ├── firebase.js         # Firebase 初始化設定
    │   └── libraryService.js   # 書籍 CRUD、借還邏輯、魔力值獎勵、分類與學徒管理
    ├── hooks/                  # 自訂 React Hooks (副作用與狀態抽離)
    │   ├── useAuth.js          # Google 登入驗證狀態監聽
    │   └── useLibraryData.js   # Firestore 即時資料監聽與同步
    ├── constants/              # 專案常數庫
    │   ├── bookCovers.js       # 魔法書皮顏色列表
    │   ├── avatars.js          # 學徒頭像 Emoji 列表
    │   └── seedData.js         # 初始種子資料 (預設藏書、學徒、分類)
    └── utils/                  # 純函式工具庫 (Utilities)
        ├── dateUtils.js        # 時間格式化與閱讀時長計算
        └── textUtils.js        # 特殊圈號數字清洗、自然排序與書名號處理
```

---

## 🚀 快速上手 (Quick Start)

### 1. 安裝環境需求
- **Node.js**: >= 18.0.0
- **npm** 或 **pnpm** / **yarn**

### 2. 安裝相依套件
在終端機中進入專案目錄：
```bash
npm install
```

### 3. 配置環境變數
複製 `.env.example` 為 `.env` 並填入您的 Firebase 設定：
```bash
cp .env.example .env
```
檔案內容範例：
```ini
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=class-library-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=class-library-xxxx
VITE_FIREBASE_STORAGE_BUCKET=class-library-xxxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1087050073299
VITE_FIREBASE_APP_ID=1:1087050073299:web:...
```

### 4. 啟動本地開發伺服器
```bash
npm run dev
```
瀏覽器開啟 `http://localhost:3000` 即可預覽。

### 5. 建置生產環境代碼
```bash
npm run build
```
編譯後的靜態網頁檔案將產生於 `dist/` 目錄中。

---

## 🛠️ 核心功能模組

| 功能模組 | 說明 |
| :--- | :--- |
| **Google 驗證登入** | 整合 Firebase Authentication，保護班級借閱系統安全性。 |
| **魔導書庫 (Library)** | 支援全文即時搜尋、分類卡片篩選、人氣借閱排行榜。 |
| **借閱契約** | 點擊書籍即可選擇學徒締結契約，借出後即時更新全班狀態。 |
| **魔法學徒名冊 (Wizards)** | 檢視每位學徒的座號、頭像、魔力值與目前研讀書籍。 |
| **閱讀修行獎勵** | 單次借閱滿 30 分鐘並歸還，自動獎勵 +10 點魔力值。 |
| **書籍複本管理** | 支援同本書收錄多本複本（自動編號 `copyNo/copyTotal`）。 |
| **批量快速匯入** | 支援以 `書名 / 作者 / 類別 / 複本數量` 格式單次匯入數十本書籍。 |
| **中控管理室 (Admin)** | 提供分類增刪改名、學徒編輯除名、強制釋放卡住的借閱書籍。 |
| **禁忌魔法重置** | 教師端提供一鍵重置所有學徒魔力值與借閱日誌功能。 |

---

## ☁️ 部署指南 (Deployment)

### Vercel / Netlify
1. 將專案推送到 GitHub。
2. 連結至 Vercel 或 Netlify。
3. 建置指令填入：`npm run build`，輸出目錄填入：`dist`。
4. 在平台環境變數設定中填入 `.env` 內的所有 `VITE_FIREBASE_*` 變數。

### GitHub Pages (透過 GitHub Actions)
專案已設定 `base: './'`，可直接將 `dist/` 部署至 GitHub Pages 分支或透過官方 Actions 流程部署。

---

## 👩‍🏫 作者與致謝

- **系統設計與開發**：怡臻老師
- **架構重構**：Antigravity Agentic Assistant

