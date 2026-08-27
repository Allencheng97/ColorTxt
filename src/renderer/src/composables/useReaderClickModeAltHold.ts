import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";
import {
  hasModalOrEscBeforeModalLayer,
  subscribeModalStackChange,
} from "../utils/modalStack";

function isAltOnlyModifier(ev: KeyboardEvent): boolean {
  return ev.altKey && !ev.ctrlKey && !ev.metaKey;
}

function isNonReaderTextInput(ev: Event): boolean {
  const t = ev.target;
  if (!(t instanceof HTMLElement)) return false;
  if (t.closest(".monaco-editor")) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(t.closest('[contenteditable="true"]'));
}

/**
 * 按住 Alt 时临时反转可选/点击模式（不改持久化偏好）。
 * 编辑模式、模态层打开、或焦点在阅读器以外的输入框时不启用。
 */
export function useReaderClickModeAltHold(deps: {
  persistedClickMode: Ref<boolean>;
  readerEditMode: Ref<boolean>;
}) {
  const altHold = ref(false);

  const effectiveClickMode = computed(() => {
    if (deps.readerEditMode.value) return deps.persistedClickMode.value;
    return altHold.value
      ? !deps.persistedClickMode.value
      : deps.persistedClickMode.value;
  });

  const clickModeAltHeld = computed(
    () => altHold.value && !deps.readerEditMode.value,
  );

  function clearAltHold() {
    altHold.value = false;
  }

  function syncFromEvent(ev: KeyboardEvent) {
    if (deps.readerEditMode.value || hasModalOrEscBeforeModalLayer()) {
      altHold.value = false;
      return;
    }
    if (!isAltOnlyModifier(ev)) {
      altHold.value = false;
      return;
    }
    if (isNonReaderTextInput(ev) && !altHold.value) return;
    altHold.value = true;
  }

  function onVisibilityChange() {
    if (document.visibilityState !== "visible") clearAltHold();
  }

  let unsubModal: (() => void) | null = null;

  onMounted(() => {
    window.addEventListener("keydown", syncFromEvent, true);
    window.addEventListener("keyup", syncFromEvent, true);
    window.addEventListener("blur", clearAltHold);
    document.addEventListener("visibilitychange", onVisibilityChange);
    unsubModal = subscribeModalStackChange(() => {
      if (hasModalOrEscBeforeModalLayer()) clearAltHold();
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", syncFromEvent, true);
    window.removeEventListener("keyup", syncFromEvent, true);
    window.removeEventListener("blur", clearAltHold);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    unsubModal?.();
    unsubModal = null;
    clearAltHold();
  });

  return {
    effectiveClickMode,
    clickModeAltHeld,
  };
}
