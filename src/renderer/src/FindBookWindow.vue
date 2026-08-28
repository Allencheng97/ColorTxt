<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import FindBookPanel from "./bookSource/components/FindBookPanel.vue";
import AppCaptchaHost from "./components/AppCaptchaHost.vue";
import AppDialogHost from "./components/AppDialogHost.vue";
import AppLoadingHost from "./components/AppLoadingHost.vue";
import AppToastHost from "./components/AppToastHost.vue";
import {
  applyAppShellTheme,
  listenPersistedSettingsSync,
  readPersistedAppShellTheme,
} from "./utils/appShellThemeSync";
import {
  loadPrivacyModeSettings,
  privacyModeSettingsChangedEvent,
  type PrivacyModeSettings,
} from "./constants/privacyMode";

let offWindowRequestClose: (() => void) | null = null;
let offThemeSync: (() => void) | null = null;
const privacyMiddleMouseHide = ref(loadPrivacyModeSettings().middleMouseHide);
const isMacWindow = /mac|iphone|ipad|ipod/i.test(navigator.platform || "");

function onPrivacyMiddleMouse(event: MouseEvent) {
  if (event.button !== 1 || !privacyMiddleMouseHide.value) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.colorTxt.hideAllWindowsStealth();
}

function onPrivacySettingsChanged(event: Event) {
  privacyMiddleMouseHide.value = (
    event as CustomEvent<PrivacyModeSettings>
  ).detail.middleMouseHide;
}

function syncThemeFromStorage() {
  applyAppShellTheme(readPersistedAppShellTheme());
}

function closeWindow() {
  window.colorTxt.proceedCloseWindow();
}

function onGoMain() {
  window.colorTxt.focusOrOpenMainWindow();
}

onMounted(() => {
  document.documentElement.classList.toggle("platform-mac", isMacWindow);
  syncThemeFromStorage();
  offThemeSync = listenPersistedSettingsSync(syncThemeFromStorage);
  offWindowRequestClose = window.colorTxt.onWindowRequestClose(() => {
    closeWindow();
  });
  window.addEventListener("mousedown", onPrivacyMiddleMouse, true);
  window.addEventListener(
    privacyModeSettingsChangedEvent,
    onPrivacySettingsChanged,
  );
});

onBeforeUnmount(() => {
  offThemeSync?.();
  offThemeSync = null;
  offWindowRequestClose?.();
  offWindowRequestClose = null;
  window.removeEventListener("mousedown", onPrivacyMiddleMouse, true);
  window.removeEventListener(
    privacyModeSettingsChangedEvent,
    onPrivacySettingsChanged,
  );
  document.documentElement.classList.remove("platform-mac");
});
</script>

<template>
  <div class="findBookWindowRoot">
    <FindBookPanel standalone @go-main="onGoMain" />
    <AppCaptchaHost />
    <AppDialogHost />
    <AppLoadingHost />
    <AppToastHost />
  </div>
</template>

<style scoped>
.findBookWindowRoot {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--panel);
  color: var(--fg);
}
</style>
