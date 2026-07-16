/**
 * lib/barakah.ts — Pure logic for the "بركة" quick-add worship options.
 *
 * Each option is anchored to a prayer block already present in the
 * generated schedule (see lib/schedule.ts prayerTimesToBlocks). Anchoring
 * this way means the 30-minute prayer buffer is respected automatically,
 * since a prayer block's endTime already equals azan time + 30 minutes.
 */

import { parseTime, minutesToTime, type TimeBlock } from "./schedule";

export interface BarakahOption {
  id: string;
  label: string;
  sub: string;
  duration: number; // minutes
  anchorLabel: string; // must match a prayer TimeBlock.label from schedule.ts
  placement: "after" | "before";
  gapMinutes: number; // extra gap beyond the anchor's own buffer
}

export const BARAKAH_OPTIONS: BarakahOption[] = [
  {
    id: "quran",
    label: "قراءة ورد من القرآن",
    sub: "بعد صلاة الفجر",
    duration: 15,
    anchorLabel: "أذان الفجر",
    placement: "after",
    gapMinutes: 0,
  },
  {
    id: "athkar_sabah",
    label: "أذكار الصباح",
    sub: "بعد صلاة الفجر",
    duration: 10,
    anchorLabel: "أذان الفجر",
    placement: "after",
    gapMinutes: 15,
  },
  {
    id: "rawatib",
    label: "السنة الراتبة",
    sub: "بعد صلاة الظهر",
    duration: 10,
    anchorLabel: "أذان الظهر",
    placement: "after",
    gapMinutes: 0,
  },
  {
    id: "athkar_masaa",
    label: "أذكار المساء",
    sub: "بعد صلاة العصر",
    duration: 10,
    anchorLabel: "أذان العصر",
    placement: "after",
    gapMinutes: 0,
  },
  {
    id: "sadaqah",
    label: "صدقة أو عمل خير",
    sub: "بعد صلاة المغرب",
    duration: 5,
    anchorLabel: "أذان المغرب",
    placement: "after",
    gapMinutes: 0,
  },
  {
    id: "duaa",
    label: "دعاء وتضرع",
    sub: "بعد صلاة العشاء",
    duration: 10,
    anchorLabel: "أذان العشاء",
    placement: "after",
    gapMinutes: 0,
  },
  {
    id: "qiyam",
    label: "قيام الليل والوتر",
    sub: "قبل صلاة الفجر",
    duration: 20,
    anchorLabel: "أذان الفجر",
    placement: "before",
    gapMinutes: 0,
  },
  {
    id: "duha",
    label: "صلاة الضحى",
    sub: "بعد شروق الشمس تقريباً",
    duration: 15,
    anchorLabel: "أذان الفجر",
    placement: "after",
    gapMinutes: 60,
  },
];

/**
 * Computes the concrete TimeBlock for a barakah option, anchored to the
 * matching prayer block in the current schedule. Returns null if the
 * anchor prayer isn't present (e.g. schedule not generated yet).
 */
export function computeBarakahBlock(
  option: BarakahOption,
  prayerBlocks: TimeBlock[]
): TimeBlock | null {
  const anchor = prayerBlocks.find((p) => p.label === option.anchorLabel);
  if (!anchor) return null;

  let startMinutes: number;
  if (option.placement === "after") {
    startMinutes = parseTime(anchor.endTime) + option.gapMinutes;
  } else {
    const endMinutes = parseTime(anchor.startTime) - 30 - option.gapMinutes;
    startMinutes = endMinutes - option.duration;
  }

  return {
    type: "study",
    label: option.label,
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(startMinutes + option.duration),
    sub: option.sub,
    completed: false,
    color: "sage",
  };
}
