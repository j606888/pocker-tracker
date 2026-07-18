export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** 1234 -> "1,234"; always sign for deltas when `signed`. */
export function formatMoney(n: number, signed = false): string {
  const s = Math.abs(n).toLocaleString("en-US");
  if (signed) return `${n > 0 ? "+" : n < 0 ? "−" : ""}${s}`;
  return n < 0 ? `−${s}` : s;
}
