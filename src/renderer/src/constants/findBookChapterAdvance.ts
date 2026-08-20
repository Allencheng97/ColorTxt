export type FindBookChapterAdvanceMode = "default" | "seamless" | "jump";

export const DEFAULT_FIND_BOOK_CHAPTER_ADVANCE_MODE: FindBookChapterAdvanceMode =
  "default";

export const FIND_BOOK_CHAPTER_ADVANCE_MODE_OPTIONS = [
  { id: "default" as const, label: "默认设置" },
  { id: "seamless" as const, label: "无缝衔接" },
  { id: "jump" as const, label: "跳转" },
];

export function isFindBookChapterAdvanceMode(
  value: unknown,
): value is FindBookChapterAdvanceMode {
  return value === "default" || value === "seamless" || value === "jump";
}
