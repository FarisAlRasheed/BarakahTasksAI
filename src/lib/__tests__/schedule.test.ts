/**
 * TDD Tests for lib/schedule.ts
 *
 * These tests were written BEFORE the implementation (Red → Green TDD cycle).
 * They define the expected behavior of the scheduling utility functions.
 */

import { describe, it, expect } from "vitest";
import {
  parseTime,
  minutesToTime,
  hasOverlap,
  prayerTimesToBlocks,
  mergeScheduleWithPrayerTimes,
  sortBlocks,
  type TimeBlock,
} from "../schedule";

// ─── parseTime ───────────────────────────────────────────────────────

describe("parseTime", () => {
  it("converts HH:mm to minutes since midnight", () => {
    expect(parseTime("00:00")).toBe(0);
    expect(parseTime("01:30")).toBe(90);
    expect(parseTime("12:00")).toBe(720);
    expect(parseTime("14:30")).toBe(870);
    expect(parseTime("23:59")).toBe(1439);
  });
});

// ─── minutesToTime ───────────────────────────────────────────────────

describe("minutesToTime", () => {
  it("converts minutes since midnight to HH:mm", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(90)).toBe("01:30");
    expect(minutesToTime(720)).toBe("12:00");
    expect(minutesToTime(870)).toBe("14:30");
  });
});

// ─── hasOverlap ──────────────────────────────────────────────────────

describe("hasOverlap", () => {
  const prayer: TimeBlock = {
    type: "prayer",
    label: "أذان الظهر",
    startTime: "12:00",
    endTime: "12:30",
  };

  it("returns true when study block overlaps prayer buffer (before)", () => {
    const study: TimeBlock = {
      type: "study",
      label: "مراجعة",
      startTime: "11:00",
      endTime: "11:45", // ends inside the 30-min pre-prayer buffer (11:30-12:00)
    };
    expect(hasOverlap(study, prayer, 30)).toBe(true);
  });

  it("returns true when study block overlaps prayer buffer (after)", () => {
    const study: TimeBlock = {
      type: "study",
      label: "مراجعة",
      startTime: "12:45", // starts inside the 30-min post-prayer buffer (12:30-13:00)
      endTime: "13:30",
    };
    expect(hasOverlap(study, prayer, 30)).toBe(true);
  });

  it("returns true when study block is entirely within prayer + buffer", () => {
    const study: TimeBlock = {
      type: "study",
      label: "مراجعة",
      startTime: "11:40",
      endTime: "12:50",
    };
    expect(hasOverlap(study, prayer, 30)).toBe(true);
  });

  it("returns false when study block is completely before the buffer", () => {
    const study: TimeBlock = {
      type: "study",
      label: "مراجعة",
      startTime: "09:00",
      endTime: "11:29", // ends before buffer starts at 11:30
    };
    expect(hasOverlap(study, prayer, 30)).toBe(false);
  });

  it("returns false when study block is completely after the buffer", () => {
    const study: TimeBlock = {
      type: "study",
      label: "مراجعة",
      startTime: "13:01", // starts after buffer ends at 13:00
      endTime: "14:00",
    };
    expect(hasOverlap(study, prayer, 30)).toBe(false);
  });
});

// ─── prayerTimesToBlocks ─────────────────────────────────────────────

describe("prayerTimesToBlocks", () => {
  const timings = {
    Fajr: "04:30",
    Sunrise: "06:00",
    Dhuhr: "12:15",
    Asr: "15:45",
    Sunset: "18:30",
    Maghrib: "18:30",
    Isha: "20:00",
    Imsak: "04:20",
    Midnight: "00:00",
    Firstthird: "22:00",
    Lastthird: "02:00",
  };

  it("returns exactly 5 prayer blocks (Fajr, Dhuhr, Asr, Maghrib, Isha)", () => {
    const blocks = prayerTimesToBlocks(timings);
    expect(blocks).toHaveLength(5);
    expect(blocks.every((b) => b.type === "prayer")).toBe(true);
  });

  it("uses correct Arabic labels", () => {
    const blocks = prayerTimesToBlocks(timings);
    const labels = blocks.map((b) => b.label);
    expect(labels).toContain("أذان الفجر");
    expect(labels).toContain("أذان الظهر");
    expect(labels).toContain("أذان العصر");
    expect(labels).toContain("أذان المغرب");
    expect(labels).toContain("أذان العشاء");
  });

  it("sets correct start times from the timings", () => {
    const blocks = prayerTimesToBlocks(timings);
    const fajr = blocks.find((b) => b.label === "أذان الفجر");
    expect(fajr?.startTime).toBe("04:30");
    const dhuhr = blocks.find((b) => b.label === "أذان الظهر");
    expect(dhuhr?.startTime).toBe("12:15");
  });

  it("handles timings with (timezone) suffix like '04:30 (EET)'", () => {
    const timingsWithTz = { ...timings, Fajr: "04:30 (EET)" };
    const blocks = prayerTimesToBlocks(timingsWithTz);
    const fajr = blocks.find((b) => b.label === "أذان الفجر");
    expect(fajr?.startTime).toBe("04:30");
  });
});

// ─── mergeScheduleWithPrayerTimes ────────────────────────────────────

describe("mergeScheduleWithPrayerTimes", () => {
  const prayerBlocks: TimeBlock[] = [
    {
      type: "prayer",
      label: "أذان الظهر",
      startTime: "12:00",
      endTime: "12:30",
      sub: "فاصل ٣٠ دقيقة",
    },
    {
      type: "prayer",
      label: "أذان المغرب",
      startTime: "18:30",
      endTime: "19:00",
      sub: "فاصل ٣٠ دقيقة",
    },
  ];

  it("trims study blocks that overlap with a prayer time's 30-minute buffer window", () => {
    const aiBlocks: TimeBlock[] = [
      {
        type: "study",
        label: "رياضيات",
        startTime: "11:00",
        endTime: "11:45", // Overlaps pre-prayer buffer (starts 11:30)
      },
      {
        type: "study",
        label: "فيزياء",
        startTime: "12:45", // Overlaps post-prayer buffer (ends 13:00)
        endTime: "14:00",
      },
      {
        type: "study",
        label: "كيمياء",
        startTime: "11:45", // Entirely inside buffer
        endTime: "12:15",
      },
    ];

    const result = mergeScheduleWithPrayerTimes(aiBlocks, prayerBlocks, 30);

    const studyBlocks = result.filter((b) => b.type === "study");
    
    // رياضيات should be trimmed to end at 11:30
    const math = studyBlocks.find((b) => b.label === "رياضيات");
    expect(math).toBeDefined();
    expect(math?.endTime).toBe("11:30");

    // فيزياء should be trimmed to start at 13:00
    const physics = studyBlocks.find((b) => b.label === "فيزياء");
    expect(physics).toBeDefined();
    expect(physics?.startTime).toBe("13:00");
    
    // كيمياء is entirely swallowed by the buffer, so it should be dropped
    expect(studyBlocks.find((b) => b.label === "كيمياء")).toBeUndefined();
  });

  it("study blocks and prayer blocks are sorted by startTime", () => {
    const aiBlocks: TimeBlock[] = [
      {
        type: "study",
        label: "كيمياء",
        startTime: "14:00",
        endTime: "16:00",
      },
      {
        type: "study",
        label: "رياضيات",
        startTime: "09:00",
        endTime: "11:00",
      },
    ];

    const result = mergeScheduleWithPrayerTimes(aiBlocks, prayerBlocks, 30);

    for (let i = 1; i < result.length; i++) {
      const prevStart = result[i - 1].startTime;
      const currStart = result[i].startTime;
      expect(prevStart <= currStart).toBe(true);
    }
  });

  it("prayer blocks are always preserved (never filtered out)", () => {
    const aiBlocks: TimeBlock[] = [
      {
        type: "study",
        label: "رياضيات",
        startTime: "12:00", // directly overlaps prayer — study removed, prayer kept
        endTime: "13:00",
      },
    ];

    const result = mergeScheduleWithPrayerTimes(aiBlocks, prayerBlocks, 30);

    const prayers = result.filter((b) => b.type === "prayer");
    expect(prayers).toHaveLength(2); // Both prayers remain
  });

  it("non-overlapping study blocks are kept", () => {
    const aiBlocks: TimeBlock[] = [
      {
        type: "study",
        label: "رياضيات",
        startTime: "08:00",
        endTime: "10:00",
      },
      {
        type: "study",
        label: "فيزياء",
        startTime: "15:00",
        endTime: "17:00",
      },
    ];

    const result = mergeScheduleWithPrayerTimes(aiBlocks, prayerBlocks, 30);

    const studyBlocks = result.filter((b) => b.type === "study");
    expect(studyBlocks).toHaveLength(2);
  });

  it("handles sleep blocks (treats them like study blocks for overlap)", () => {
    const aiBlocks: TimeBlock[] = [
      {
        type: "sleep",
        label: "موعد النوم",
        startTime: "22:00",
        endTime: "23:00",
      },
    ];

    const result = mergeScheduleWithPrayerTimes(aiBlocks, prayerBlocks, 30);

    const sleepBlocks = result.filter((b) => b.type === "sleep");
    expect(sleepBlocks).toHaveLength(1); // No overlap with prayers
  });
});

// ─── sortBlocks ──────────────────────────────────────────────────────

describe("sortBlocks", () => {
  it("sorts an array of TimeBlocks chronologically by their startTime", () => {
    const blocks: TimeBlock[] = [
      { type: "study", label: "كيمياء", startTime: "14:00", endTime: "15:00" },
      { type: "prayer", label: "أذان الظهر", startTime: "12:00", endTime: "12:30" },
      { type: "study", label: "رياضيات", startTime: "08:00", endTime: "09:00" },
    ];
    const sorted = sortBlocks(blocks);
    expect(sorted[0].label).toBe("رياضيات");
    expect(sorted[1].label).toBe("أذان الظهر");
    expect(sorted[2].label).toBe("كيمياء");
  });
});

