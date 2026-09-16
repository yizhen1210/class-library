/**
 * 班級魔法書局 - 有效閱讀修練時段規範
 *
 * 只有在下課與早自修時段才能累計借閱時長，上課時間、午休時間與週末一律不計入，
 * 防止學生故意於快上課時借閱刷取修行時長。
 */

export const VALID_READING_INTERVALS = [
  {
    id: "morning_study",
    name: "早自修",
    start: "08:00",
    end: "08:30",
    startMinute: 8 * 60, // 480
    endMinute: 8 * 60 + 30, // 510
    durationMinutes: 30
  },
  {
    id: "recess_1",
    name: "第一節下課",
    start: "09:10",
    end: "09:20",
    startMinute: 9 * 60 + 10, // 550
    endMinute: 9 * 60 + 20, // 560
    durationMinutes: 10
  },
  {
    id: "recess_2",
    name: "第二節下課",
    start: "10:00",
    end: "10:20",
    startMinute: 10 * 60, // 600
    endMinute: 10 * 60 + 20, // 620
    durationMinutes: 20
  },
  {
    id: "recess_3",
    name: "第三節下課",
    start: "11:00",
    end: "11:10",
    startMinute: 11 * 60, // 660
    endMinute: 11 * 60 + 10, // 670
    durationMinutes: 10
  },
  // 午休時間（12:00 ~ 13:20）完全禁止計算
  {
    id: "recess_lunch",
    name: "午休下課",
    start: "13:20",
    end: "13:30",
    startMinute: 13 * 60 + 20, // 800
    endMinute: 13 * 60 + 30, // 810
    durationMinutes: 10
  },
  {
    id: "recess_5",
    name: "第五節下課",
    start: "14:10",
    end: "14:20",
    startMinute: 14 * 60 + 10, // 850
    endMinute: 14 * 60 + 20, // 860
    durationMinutes: 10
  },
  {
    id: "recess_6",
    name: "第六節下課",
    start: "15:00",
    end: "15:10",
    startMinute: 15 * 60, // 900
    endMinute: 15 * 60 + 10, // 910
    durationMinutes: 10
  }
];

// 單日所有有效時段總合（30 + 10 + 20 + 10 + 10 + 10 + 10 = 100 分鐘）
export const MAX_DAILY_VALID_MINUTES = VALID_READING_INTERVALS.reduce(
  (sum, slot) => sum + slot.durationMinutes,
  0
);

