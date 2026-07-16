"use client";

import { useState, useCallback } from "react";
import { Moon, Sun, Feather, Sparkles, Loader2, Plus, Check, X } from "lucide-react";
import { SAUDI_CITIES } from "@/lib/cities";
import type { TimeBlock } from "@/lib/schedule";
import TimelineCard from "./TimelineCard";
import FocusTimer from "./FocusTimer";

export default function StudyFlow() {
  // ─── State ───────────────────────────────────────────────────────
  const [dark, setDark] = useState(false);
  const [city, setCity] = useState(SAUDI_CITIES[0].nameAr);
  const [taskText, setTaskText] = useState("");
  const [scheduleItems, setScheduleItems] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerLabel, setTimerLabel] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // ─── Dark Mode Toggle ────────────────────────────────────────────
  const toggleDark = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  // ─── Generate Schedule ───────────────────────────────────────────
  const handleOrganize = useCallback(async () => {
    if (!taskText.trim()) {
      setError("اكتب مهامك أولاً");
      return;
    }

    setLoading(true);
    setError(null);
    setScheduleItems([]);

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, taskText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ في الخادم");
      }

      setScheduleItems(data.timeline);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ غير متوقع"
      );
    } finally {
      setLoading(false);
    }
  }, [city, taskText]);

  // ─── Delete Schedule Item ────────────────────────────────────────
  const handleDeleteItem = useCallback((index: number) => {
    setScheduleItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Edit Schedule Item ──────────────────────────────────────────
  const handleEditItem = useCallback(
    (index: number, updated: Partial<TimeBlock>) => {
      setScheduleItems((prev) => {
        const next = prev.map((item, i) =>
          i === index ? { ...item, ...updated } : item
        );
        // Re-sort by start time so an edited time lands in the right place
        next.sort(
          (a, b) =>
            Number(a.startTime.replace(":", "")) -
            Number(b.startTime.replace(":", ""))
        );
        return next;
      });
    },
    []
  );

  // ─── Add Task Manually ───────────────────────────────────────────
  const openAddForm = useCallback(() => {
    setNewTaskLabel("");
    setNewTaskTime("");
    setAddError(null);
    setShowAddForm(true);
  }, []);

  const cancelAddForm = useCallback(() => {
    setShowAddForm(false);
    setAddError(null);
  }, []);

  const handleAddTask = useCallback(() => {
    const label = newTaskLabel.trim();
    if (!label) {
      setAddError("اكتب اسم المهمة");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(newTaskTime)) {
      setAddError("اختر وقتاً للمهمة");
      return;
    }

    // End time defaults to 30 minutes after the start (not displayed, kept sane)
    const [h, m] = newTaskTime.split(":").map(Number);
    const endMinutes = h * 60 + m + 30;
    const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(
      2,
      "0"
    )}:${String(endMinutes % 60).padStart(2, "0")}`;

    const newBlock: TimeBlock = {
      type: "study",
      label,
      startTime: newTaskTime,
      endTime,
      sub: "مهمة مضافة",
    };

    setScheduleItems((prev) => {
      const next = [...prev, newBlock];
      next.sort(
        (a, b) =>
          Number(a.startTime.replace(":", "")) -
          Number(b.startTime.replace(":", ""))
      );
      return next;
    });

    setShowAddForm(false);
    setAddError(null);
  }, [newTaskLabel, newTaskTime]);

  // ─── Focus Timer ─────────────────────────────────────────────────
  const handleStartTimer = useCallback((label: string) => {
    setTimerLabel(label);
  }, []);

  const handleCloseTimer = useCallback(() => {
    setTimerLabel(null);
  }, []);

  // ─── Keyboard Shortcut ───────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOrganize();
      }
    },
    [handleOrganize]
  );

  return (
    <div
      className="w-full min-h-screen p-4 sm:p-6 transition-colors duration-300"
      style={{ background: "var(--paper)", color: "var(--ink)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* City dropdown (top-right in RTL = appears on the right) */}
          <select
            id="city-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="text-sm px-3 py-2 rounded-md border outline-none cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              background: "var(--card)",
              borderColor: "var(--line)",
              color: "var(--ink-soft)",
            }}
          >
            {SAUDI_CITIES.map((c) => (
              <option key={c.nameAr} value={c.nameAr}>
                {c.nameAr}
              </option>
            ))}
          </select>

          {/* Site name + dark mode toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              aria-label="تبديل الوضع"
              className="text-xs px-3 py-1.5 rounded-md border hover:opacity-80 transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--card)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <span
              className="text-2xl font-bold"
              style={{
                color: "var(--gold)",
                fontFamily: "var(--font-aref-ruqaa), 'Aref Ruqaa', serif",
              }}
            >
              سِجل الدراسة
            </span>
          </div>
        </div>

        {/* ─── Task Input ─────────────────────────────────────────── */}
        <div
          className="rounded-lg border px-3 py-2 sm:px-4 sm:py-3 mb-6 flex items-center gap-2"
          style={{
            background: "var(--card)",
            borderColor: "var(--line)",
            color: "var(--ink)",
          }}
        >
          <Feather size={16} style={{ color: "var(--ink-soft)", flexShrink: 0 }} />
          <input
            id="task-input"
            type="text"
            value={taskText}
            onChange={(e) => {
              setTaskText(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="اكتب مهامك اليوم كما تحدّث صديقاً..."
            className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:opacity-60"
            style={{ color: "var(--ink)" }}
            dir="rtl"
          />
          <button
            id="organize-btn"
            onClick={handleOrganize}
            disabled={loading}
            className="shrink-0 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border flex items-center gap-1 hover:opacity-80 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--paper)",
              borderColor: "var(--line)",
              color: "var(--ink)",
            }}
          >
            {loading ? (
              <>
                جارٍ الترتيب <Loader2 size={13} className="animate-spin" />
              </>
            ) : (
              <>
                رتّب <Sparkles size={13} />
              </>
            )}
          </button>
        </div>

        {/* ─── Error Message ──────────────────────────────────────── */}
        {error && (
          <div
            className="animate-fade-in-up rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-2 mb-4 text-sm text-red-700 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* ─── Timeline Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
            الجدول الزمني — اليوم
          </span>
          {!loading && scheduleItems.length > 0 && !showAddForm && (
            <button
              onClick={openAddForm}
              className="text-xs px-3 py-1.5 rounded-md border flex items-center gap-1 hover:opacity-80 transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--card)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              <Plus size={13} /> إضافة مهمة
            </button>
          )}
        </div>

        {/* ─── Add Task Form ──────────────────────────────────────── */}
        {showAddForm && (
          <div
            className="animate-fade-in-up rounded-lg border px-3 sm:px-4 py-3 mb-2"
            style={{
              background: "var(--card)",
              borderColor: "var(--gold)",
              color: "var(--ink)",
            }}
          >
            <div className="flex flex-col gap-2">
              {/* Task name */}
              <input
                type="text"
                value={newTaskLabel}
                onChange={(e) => {
                  setNewTaskLabel(e.target.value);
                  if (addError) setAddError(null);
                }}
                placeholder="اسم المهمة"
                dir="rtl"
                className="w-full bg-transparent outline-none border rounded-md px-2 py-1.5 text-sm font-bold"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
              />

              {/* Time */}
              <div className="flex flex-col gap-0.5">
                <label className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  الوقت
                </label>
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => {
                    setNewTaskTime(e.target.value);
                    if (addError) setAddError(null);
                  }}
                  className="w-full bg-transparent outline-none border rounded-md px-2 py-1 text-sm"
                  style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                />
              </div>

              {/* Error */}
              {addError && (
                <div className="text-xs text-red-600 dark:text-red-400">
                  {addError}
                </div>
              )}

              {/* Add / Cancel */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={cancelAddForm}
                  className="p-1.5 rounded-md border transition-all duration-200 hover:scale-105"
                  style={{
                    background: "var(--paper)",
                    borderColor: "var(--line)",
                    color: "var(--ink-soft)",
                  }}
                  aria-label="إلغاء"
                  title="إلغاء"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={handleAddTask}
                  className="p-1.5 rounded-md border transition-all duration-200 hover:scale-105"
                  style={{
                    background: "var(--paper)",
                    borderColor: "var(--line)",
                    color: "var(--gold)",
                  }}
                  aria-label="إضافة"
                  title="إضافة"
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Loading Skeleton ────────────────────────────────────── */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-shimmer rounded-lg border px-4 py-4"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--line)",
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div
                  className="h-3 rounded w-1/3 mb-2"
                  style={{ background: "var(--line)" }}
                />
                <div
                  className="h-2 rounded w-1/4"
                  style={{ background: "var(--line)", opacity: 0.5 }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ─── Timeline ───────────────────────────────────────────── */}
        {!loading && scheduleItems.length > 0 && (
          <div>
            {scheduleItems.map((item, i) => (
              <TimelineCard
                key={`${item.startTime}-${item.label}-${i}`}
                item={item}
                index={i}
                onStartTimer={handleStartTimer}
                onDelete={handleDeleteItem}
                onEdit={handleEditItem}
              />
            ))}
          </div>
        )}

        {/* ─── Empty State ────────────────────────────────────────── */}
        {!loading && scheduleItems.length === 0 && !error && (
          <div
            className="text-center py-16 text-sm"
            style={{ color: "var(--ink-soft)" }}
          >
            <Feather
              size={32}
              className="mx-auto mb-3 opacity-30"
              style={{ color: "var(--gold)" }}
            />
            <p>اكتب مهامك واضغط &quot;رتّب&quot; لإنشاء جدولك</p>
            <p className="mt-1 text-xs opacity-60">
              مثال: عندي اختبار رياضيات بكرا وأبي أراجع ١٠٠ صفحة
            </p>
          </div>
        )}
      </div>

      {/* ─── Focus Timer Modal ────────────────────────────────────── */}
      {timerLabel && (
        <FocusTimer label={timerLabel} onClose={handleCloseTimer} />
      )}
    </div>
  );
}
