/** 选区浮动工具条上可由用户开关的按钮 */
export type SelectionToolbarButtons = {
  copy: boolean;
  find: boolean;
  askAi: boolean;
};

export const defaultSelectionToolbarButtons: SelectionToolbarButtons = {
  copy: true,
  find: false,
  askAi: true,
};

export function mergeSelectionToolbarButtons(
  partial: Partial<SelectionToolbarButtons> | null | undefined,
): SelectionToolbarButtons {
  return {
    copy:
      typeof partial?.copy === "boolean"
        ? partial.copy
        : defaultSelectionToolbarButtons.copy,
    find:
      typeof partial?.find === "boolean"
        ? partial.find
        : defaultSelectionToolbarButtons.find,
    askAi:
      typeof partial?.askAi === "boolean"
        ? partial.askAi
        : defaultSelectionToolbarButtons.askAi,
  };
}
