export const privacyModeSettingsChangedEvent =
  "colortxt:privacy-mode-settings-changed";

const transparencyKey = "colortxt:privacy-background-transparency";
const middleMouseHideKey = "colortxt:privacy-middle-mouse-hide";

export type PrivacyModeSettings = {
  transparency: number;
  middleMouseHide: boolean;
};

export function loadPrivacyModeSettings(): PrivacyModeSettings {
  const rawTransparency = Number(localStorage.getItem(transparencyKey) ?? "70");
  return {
    transparency: Number.isFinite(rawTransparency)
      ? Math.max(0, Math.min(100, Math.round(rawTransparency)))
      : 70,
    middleMouseHide: localStorage.getItem(middleMouseHideKey) !== "false",
  };
}

export function savePrivacyModeSettings(settings: PrivacyModeSettings): void {
  const normalized: PrivacyModeSettings = {
    transparency: Math.max(0, Math.min(100, Math.round(settings.transparency))),
    middleMouseHide: settings.middleMouseHide === true,
  };
  localStorage.setItem(transparencyKey, String(normalized.transparency));
  localStorage.setItem(middleMouseHideKey, String(normalized.middleMouseHide));
  window.dispatchEvent(
    new CustomEvent<PrivacyModeSettings>(privacyModeSettingsChangedEvent, {
      detail: normalized,
    }),
  );
}
