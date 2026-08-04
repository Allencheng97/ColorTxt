/**
 * Monaco 布局层「行间距」：每个物理行（model line）结束后增加常数像素空隙。
 * 软换行产生的中间 view 行不加距。由 Vite transform 注入 LinesLayout 读取。
 */

import { maxLineSpacingPx, minLineSpacingPx } from "../constants/appUi";

export type LineSpacingModelLineResolver = (viewLineNumber: number) => number;
export type LineSpacingModelLineCountResolver = () => number;

type LayoutBridge = {
  modelLineForViewLine: LineSpacingModelLineResolver;
  modelLineCount: LineSpacingModelLineCountResolver;
};

let lineSpacingPx = 0;
/** 按 LinesLayout 实例隔离，避免主阅读器 / Diff / 弹窗编辑器互相覆盖 */
const bridges = new WeakMap<object, LayoutBridge>();
const heightInvalidationListeners = new Set<() => void>();

export function clampLineSpacingPx(px: number): number {
  if (!Number.isFinite(px)) return 0;
  return Math.max(
    minLineSpacingPx,
    Math.min(maxLineSpacingPx, Math.round(px)),
  );
}

export function getLineSpacingPx(): number {
  return lineSpacingPx;
}

export function setLineSpacingPx(px: number): void {
  const next = clampLineSpacingPx(px);
  if (next === lineSpacingPx) return;
  lineSpacingPx = next;
  for (const listener of heightInvalidationListeners) {
    listener();
  }
}

export function setLineSpacingBridgeForLayout(
  layout: object,
  modelLineForViewLine: LineSpacingModelLineResolver | null,
  modelLineCount: LineSpacingModelLineCountResolver | null,
): void {
  if (!modelLineForViewLine || !modelLineCount) {
    bridges.delete(layout);
    return;
  }
  bridges.set(layout, { modelLineForViewLine, modelLineCount });
}

export function subscribeLineSpacingHeightInvalidation(
  listener: () => void,
): () => void {
  heightInvalidationListeners.add(listener);
  return () => {
    heightInvalidationListeners.delete(listener);
  };
}

function modelLineFor(
  layout: object,
  viewLineNumber: number,
): number {
  const bridge = bridges.get(layout);
  if (!bridge) return Math.max(1, viewLineNumber | 0);
  try {
    const m = bridge.modelLineForViewLine(viewLineNumber | 0);
    return Number.isFinite(m) && m >= 1 ? m | 0 : Math.max(1, viewLineNumber | 0);
  } catch {
    return Math.max(1, viewLineNumber | 0);
  }
}

function modelLineCountFor(layout: object): number {
  const bridge = bridges.get(layout);
  if (!bridge) return 0;
  try {
    const n = bridge.modelLineCount();
    return Number.isFinite(n) && n >= 0 ? n | 0 : 0;
  } catch {
    return 0;
  }
}

/** view 行 v 之上已结束的物理行带来的间距累加 */
export function lineSpacingGapsBeforeViewLine(
  layout: object,
  viewLineNumber: number,
): number {
  const gap = lineSpacingPx;
  if (gap <= 0 || viewLineNumber <= 1) return 0;
  return gap * Math.max(0, modelLineFor(layout, viewLineNumber) - 1);
}

/** 文档总行间距（每个物理行后一段，含末行） */
export function lineSpacingTotalGaps(layout: object): number {
  const gap = lineSpacingPx;
  if (gap <= 0) return 0;
  return gap * Math.max(0, modelLineCountFor(layout));
}

/** 若该 view 行是其物理行的最后一行，则在其后加一段间距 */
export function lineSpacingGapAfterViewLine(
  layout: object,
  viewLineNumber: number,
  viewLineCount: number,
): number {
  const gap = lineSpacingPx;
  if (gap <= 0) return 0;
  const line = viewLineNumber | 0;
  const count = viewLineCount | 0;
  if (line < 1 || count < 1) return 0;
  if (line >= count) return gap;
  return modelLineFor(layout, line) !== modelLineFor(layout, line + 1)
    ? gap
    : 0;
}
