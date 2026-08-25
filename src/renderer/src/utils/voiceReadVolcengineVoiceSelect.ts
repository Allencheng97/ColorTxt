import type { CustomSelectItem } from "../components/AppCustomSelect.vue";
import {
  groupVolcengineTtsVoices,
  type VolcengineTtsVoice,
} from "@shared/voiceReadVolcengineVoices";
import { voiceReadGenderPrefixHtml } from "./voiceReadGenderPrefixHtml";

export function volcengineVoiceToSelectItem(
  voice: VolcengineTtsVoice,
): CustomSelectItem {
  return {
    kind: "item",
    id: voice.id,
    label: voice.label,
    description: voice.description,
    prefixHtml: voiceReadGenderPrefixHtml(voice.gender),
  };
}

export function volcengineVoiceGroupsToSelectItems(
  groups: ReturnType<typeof groupVolcengineTtsVoices> =
    groupVolcengineTtsVoices(),
): CustomSelectItem[] {
  const items: CustomSelectItem[] = [];
  for (const [groupLabel, voices] of groups) {
    items.push({ kind: "groupLabel", label: groupLabel });
    for (const voice of voices) {
      items.push(volcengineVoiceToSelectItem(voice));
    }
  }
  return items;
}
