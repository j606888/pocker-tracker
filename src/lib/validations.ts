import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("請輸入有效的 email"),
  password: z.string().min(1, "請輸入密碼"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "請輸入暱稱").max(50),
  email: z.string().email("請輸入有效的 email"),
  password: z.string().min(6, "密碼至少 6 個字"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const sessionSchema = z.object({
  // YYYY-MM-DD from a <input type="date">
  playedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "請選擇日期"),
  levelPresetId: z
    .string()
    .optional()
    .transform((v) => (v ? v : null)),
  venueId: z
    .string()
    .optional()
    .transform((v) => (v ? v : null)),
  // Total buy-in, rebuys included.
  buyIn: z.coerce.number().int("請輸入整數").nonnegative("不能為負"),
  rebuys: z.coerce.number().int().min(0).max(99, "加買次數太多了").default(0),
  cashOut: z.coerce.number().int("請輸入整數").nonnegative("不能為負"),
  rake: z.coerce.number().int("請輸入整數").nonnegative("不能為負").default(0),
  mood: z
    .enum(["FOCUSED", "NORMAL", "TIRED", "TILT"])
    .nullish()
    .transform((v) => v ?? null),
  note: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type SessionInput = z.infer<typeof sessionSchema>;

export const presetSchema = z.object({
  label: z.string().trim().min(1, "請輸入名稱").max(10),
  buyIn: z.coerce.number().int("請輸入整數").positive("買入需大於 0"),
});

export type PresetInput = z.infer<typeof presetSchema>;

export const venueSchema = z.object({
  name: z.string().trim().min(1, "請輸入場子名稱").max(12, "最多 12 個字"),
});

export const bankrollSchema = z.object({
  // Empty clears it; "120,000" is fine.
  bankroll: z
    .string()
    .trim()
    .transform((v) => v.replace(/,/g, ""))
    .refine((v) => v === "" || /^\d+$/.test(v), "請輸入整數")
    .transform((v) => (v === "" ? null : Number(v))),
});
