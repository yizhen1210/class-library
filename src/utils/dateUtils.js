import { VALID_READING_INTERVALS } from "../constants/readingSchedule.js";

/**
 * 取得當前時間字串，格式為 YYYY-MM-DD HH:mm
 */
export function getCurrentDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 解析時間字串為 Date 物件
 */
export function parseDateTime(dateStr) {
  if (!dateStr) return null;
  const parsed = new Date(String(dateStr).replace(" ", "T"));
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * 計算兩時間點之間的相差分鐘數（原始物理時間）
 */
export function calculateDurationMinutes(startDateStr, endDateStr) {
  const start = parseDateTime(startDateStr);
  const end = parseDateTime(endDateStr);
  if (!start || !end) return 0;
  return Math.max(0, Math.round((end - start) / 60000));
}

/**
 * 計算有效閱讀修行分鐘數
 * 
 * 規則：
 * 1. 僅累計指定早自修與下課時段（VALID_READING_INTERVALS）。
 * 2. 週末（週六、週日）自動排除，計為 0 分鐘。
 * 3. 國定假日與放假日期（holidays）整天排除，計為 0 分鐘。
 * 4. 跨日借閱自動按日切分精準累計。
 *
 * @param {string} startDateStr - 借閱開始時間 (YYYY-MM-DD HH:mm)
 * @param {string} endDateStr - 歸還時間 (YYYY-MM-DD HH:mm)
 * @param {Array} holidays - 放假日期陣列 (格式可為 ["YYYY-MM-DD"] 或 [{ date: "YYYY-MM-DD" }])
 * @returns {number} 有效閱讀分鐘數
 */
export function calculateValidReadingMinutes(startDateStr, endDateStr, holidays = []) {
  const start = parseDateTime(startDateStr);
  const end = parseDateTime(endDateStr);
  if (!start || !end || end < start) return 0;

  const holidaySet = new Set(
    holidays
      .map((h) => (typeof h === "string" ? h.trim() : (h?.date || "").trim()))
      .filter(Boolean)
  );

  let totalValidMinutes = 0;

  // 從開始日期的 00:00 開始遍歷
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDateOnly) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = current.getDay(); // 0: 週日, 6: 週六

    // 排除週末與教師設定的國定假日
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(dateStr);

    if (!isWeekend && !isHoliday) {
      const isStartDay = current.getTime() === new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const isEndDay = current.getTime() === endDateOnly.getTime();

      const dayStartMinute = isStartDay ? start.getHours() * 60 + start.getMinutes() : 0;
      const dayEndMinute = isEndDay ? end.getHours() * 60 + end.getMinutes() : 1440;

      for (const slot of VALID_READING_INTERVALS) {
        const overlap = Math.max(
          0,
          Math.min(dayEndMinute, slot.endMinute) - Math.max(dayStartMinute, slot.startMinute)
        );
        totalValidMinutes += overlap;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return totalValidMinutes;
}
