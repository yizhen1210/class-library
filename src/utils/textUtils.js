/**
 * 將特殊圓圈數字（①②...㊿）轉為一般英數字符以利精確自然排序
 */
export function normalizeCircledNumbers(str) {
  return String(str || "").replace(
    /[\u2460-\u2473\u3251-\u325f\u32b1-\u32bf\u24ea]/g,
    (char) => {
      const code = char.codePointAt(0);
      if (code === 9450) return "0"; // ⓪
      if (code <= 9331) return String(code - 9312 + 1); // ① - ⑳
      if (code <= 12895) return String(code - 12881 + 21); // ㉑ - ㉟
      return String(code - 12977 + 36); // ㊱ - ㊿
    }
  );
}

/**
 * 智慧文字自然排序（支援繁體中文與內嵌數字、圓圈數字排序）
 */
export function naturalCompare(a, b) {
  const normA = normalizeCircledNumbers(a);
  const normB = normalizeCircledNumbers(b);
  return normA.localeCompare(normB, undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

/**
 * 書名自動補全書名號《》
 */
export function formatBookTitle(title) {
  const trimmed = (title || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("《") && trimmed.includes("》")) {
    return trimmed;
  }
  return `《${trimmed}》`;
}

