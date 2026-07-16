"use client";

import { useState, useCallback, useEffect } from "react";
import { Moon, Sun, Feather, Sparkles, Loader2, Plus, X, AlertCircle } from "lucide-react";
import { SAUDI_CITIES } from "@/lib/cities";
import { sortBlocks, hasOverlap, type TimeBlock } from "@/lib/schedule";
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

  // ─── Add/Edit Task Modal State ────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formSub, setFormSub] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("09:00");
  const [formType, setFormType] = useState<"study" | "sleep">("study");
  const [hasConflict, setHasConflict] = useState(false);

  // ─── LocalStorage Persistence ────────────────────────────────────
  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("barakah_schedule_items");
    if (stored) {
      try {
        setScheduleItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse schedule items from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage when scheduleItems change
  useEffect(() => {
    if (scheduleItems.length > 0) {
      localStorage.setItem("barakah_schedule_items", JSON.stringify(scheduleItems));
    } else {
      localStorage.removeItem("barakah_schedule_items");
    }
  }, [scheduleItems]);

  // ─── Conflict Check inside Modal ──────────────────────────────────
  useEffect(() => {
    if (!isModalOpen) return;

    const tempBlock: TimeBlock = {
      type: formType,
      label: formLabel,
      startTime: formStartTime,
      endTime: formEndTime,
      sub: formSub,
    };

    // Find all prayer blocks in current scheduleItems
    const prayers = scheduleItems.filter((item) => item.type === "prayer");

    // Check if there is an overlap (using 30 min buffer)
    const overlap = prayers.some((prayer) => hasOverlap(tempBlock, prayer, 30));
    setHasConflict(overlap);
  }, [formStartTime, formEndTime, formType, scheduleItems, isModalOpen, formLabel, formSub]);

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

  // ─── Focus Timer ─────────────────────────────────────────────────
  const handleStartTimer = useCallback((label: string) => {
    setTimerLabel(label);
  }, []);

  const handleCloseTimer = useCallback(() => {
    setTimerLabel(null);
  }, []);

  // ─── Task Modal Handlers ─────────────────────────────────────────
  const openAddModal = useCallback(() => {
    setEditingIndex(null);
    setFormLabel("");
    setFormSub("");
    setFormStartTime("08:00");
    setFormEndTime("09:00");
    setFormType("study");
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((index: number) => {
    const item = scheduleItems[index];
    setEditingIndex(index);
    setFormLabel(item.label);
    setFormSub(item.sub || "");
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormType(item.type as "study" | "sleep");
    setIsModalOpen(true);
  }, [scheduleItems]);

  const handleSaveTask = useCallback(() => {
    if (!formLabel.trim()) return;

    const newBlock: TimeBlock = {
      type: formType,
      label: formLabel.trim(),
      startTime: formStartTime,
      endTime: formEndTime,
      sub: formSub.trim() || undefined,
      completed: editingIndex !== null ? scheduleItems[editingIndex].completed : false,
    };

    let updated: TimeBlock[];
    if (editingIndex !== null) {
      updated = scheduleItems.map((item, idx) => (idx === editingIndex ? newBlock : item));
    } else {
      updated = [...scheduleItems, newBlock];
    }

    setScheduleItems(sortBlocks(updated));
    setIsModalOpen(false);
  }, [formLabel, formSub, formStartTime, formEndTime, formType, editingIndex, scheduleItems]);

  const handleToggleComplete = useCallback((index: number) => {
    setScheduleItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const handleDelete = useCallback((index: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
      setScheduleItems((prev) => prev.filter((_, idx) => idx !== index));
    }
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
          {/* City dropdown */}
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
              className="text-xs px-3 py-1.5 rounded-md border hover:opacity-80 transition-all duration-200 hover:scale-105 cursor-pointer"
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
            className="shrink-0 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border flex items-center gap-1 hover:opacity-80 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

        {/* ─── Timeline Header & Controls ─────────────────────────── */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <span style={{ color: "var(--ink-soft)" }}>الجدول الزمني — اليوم</span>
          {scheduleItems.length > 0 && !loading && (
            <div className="flex items-center gap-2">
              <button
                onClick={openAddModal}
                className="text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1 hover:opacity-85 transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--line)",
                  color: "var(--ink)",
                }}
              >
                <Plus size={12} /> إضافة مهمة
              </button>
              <button
                onClick={() => {
                  if (confirm("هل تريد مسح الجدول الزمني بالكامل؟")) {
                    setScheduleItems([]);
                  }
                }}
                className="text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1 hover:opacity-85 hover:text-red-500 transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--line)",
                  color: "var(--ink-soft)",
                }}
              >
                مسح الجدول
              </button>
            </div>
          )}
        </div>

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
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={openEditModal}
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
            <div className="mt-4">
              <button
                onClick={openAddModal}
                className="text-xs px-4 py-2 rounded-md border inline-flex items-center gap-1.5 hover:opacity-80 transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--line)",
                  color: "var(--ink)",
                }}
              >
                <Plus size={14} /> أو أضف مهمة يدوياً
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add/Edit Task Modal ───────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="timer-overlay fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="timer-modal relative rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 p-1 rounded-md hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={18} style={{ color: "var(--ink-soft)" }} />
            </button>

            {/* Title */}
            <h2
              className="text-right text-lg font-bold mb-6"
              style={{ fontFamily: "var(--font-aref-ruqaa), 'Aref Ruqaa', serif" }}
            >
              {editingIndex !== null ? "تعديل المهمة" : "إضافة مهمة جديدة"}
            </h2>

            {/* Label input */}
            <div className="mb-4 text-right">
              <label className="block text-xs mb-1 font-bold" style={{ color: "var(--ink-soft)" }}>
                العنوان
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="مثال: مراجعة الرياضيات"
                className="w-full text-right px-3 py-2 text-sm rounded-md border outline-none bg-transparent"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                dir="rtl"
                required
              />
            </div>

            {/* Sub/desc input */}
            <div className="mb-4 text-right">
              <label className="block text-xs mb-1 font-bold" style={{ color: "var(--ink-soft)" }}>
                الوصف (اختياري)
              </label>
              <input
                type="text"
                value={formSub}
                onChange={(e) => setFormSub(e.target.value)}
                placeholder="مثال: التركيز على الفصل الأول"
                className="w-full text-right px-3 py-2 text-sm rounded-md border outline-none bg-transparent"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                dir="rtl"
              />
            </div>

            {/* Type selection */}
            <div className="mb-4 text-right">
              <label className="block text-xs mb-1 font-bold" style={{ color: "var(--ink-soft)" }}>
                النوع
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as "study" | "sleep")}
                className="w-full text-right px-3 py-2 text-sm rounded-md border outline-none bg-transparent cursor-pointer"
                style={{ borderColor: "var(--line)", color: "var(--ink)", background: "var(--card)" }}
                dir="rtl"
              >
                <option value="study">دراسة 📖</option>
                <option value="sleep">نوم 🛌</option>
              </select>
            </div>

            {/* Start and End Times Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-right" dir="rtl">
              <div>
                <label className="block text-xs mb-1 font-bold" style={{ color: "var(--ink-soft)" }}>
                  وقت البدء
                </label>
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border outline-none bg-transparent text-center"
                  style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 font-bold" style={{ color: "var(--ink-soft)" }}>
                  وقت الانتهاء
                </label>
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border outline-none bg-transparent text-center"
                  style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                />
              </div>
            </div>

            {/* Prayer conflict warning */}
            {hasConflict && (
              <div
                className="mb-6 p-3 rounded-lg border flex items-start gap-2 text-xs animate-fade-in-up"
                style={{
                  background: "var(--accent-glow)",
                  borderColor: "var(--gold)",
                  color: "var(--ink)",
                }}
                dir="rtl"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
                <div>
                  <strong>تنبيه بالتعارض:</strong> هذا الوقت يتداخل مع وقت صلاة أو فترة الـ ٣٠ دقيقة المخصصة للراحة بعدها. يمكنك الحفظ مع ذلك، لكن يُفضل تعديل الوقت للبركة.
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3" dir="rtl">
              <button
                onClick={handleSaveTask}
                disabled={!formLabel.trim()}
                className="px-5 py-2 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--gold)",
                  borderColor: "var(--gold)",
                  color: "var(--paper)",
                }}
              >
                حفظ
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  background: "var(--paper)",
                  borderColor: "var(--line)",
                  color: "var(--ink)",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Focus Timer Modal ────────────────────────────────────── */}
      {timerLabel && (
        <FocusTimer label={timerLabel} onClose={handleCloseTimer} />
      )}
    </div>
  );
}
