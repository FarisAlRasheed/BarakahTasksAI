"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Moon, Sun, Feather, Sparkles, Loader2, Plus, X, AlertCircle, Send, MessageCircle, Settings, ChevronDown } from "lucide-react";
import { SAUDI_CITIES, findCity } from "@/lib/cities";
import { sortBlocks, hasOverlap, type TimeBlock } from "@/lib/schedule";
import { type ChatTask } from "@/lib/chat";
import TimelineCard from "./TimelineCard";
import FocusTimer from "./FocusTimer";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import BackgroundElements from "./BackgroundElements";
import TimeRangeSlider from "./TimeRangeSlider";

export default function StudyFlow() {
  // ─── State ───────────────────────────────────────────────────────
  const [dark, setDark] = useState(false);
  const [city, setCity] = useState(SAUDI_CITIES[0].nameAr);
  
  // Chat State
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<{role: "user" | "ai", text: string}[]>([]);
  const [draftTasks, setDraftTasks] = useState<ChatTask[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const [formType, setFormType] = useState<"study" | "sleep" | "workout" | "meeting" | "prayer">("study");
  const [formColor, setFormColor] = useState<string>("default");
  const [hasConflict, setHasConflict] = useState(false);

  // Auto Animate ref for smooth list transitions
  const [parentRef] = useAutoAnimate<HTMLDivElement>();

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
    if (draftTasks.length === 0) {
      setError("لا يوجد مهام لترتيبها، اكتب مهامك في المحادثة أولاً");
      return;
    }

    setLoading(true);
    setError(null);
    setScheduleItems([]);
    setIsChatCollapsed(true);

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, tasks: draftTasks }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ في الخادم");
      }

      setScheduleItems(data.timeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      setIsChatCollapsed(false);
    } finally {
      setLoading(false);
    }
  }, [city, draftTasks]);

  // ─── Chat Message Handler ────────────────────────────────────────
  const handleSendMessage = useCallback(async (text = messageInput) => {
    if (!text.trim()) return;
    
    if (text.trim() === "رتّب") {
      handleOrganize();
      setMessageInput("");
      return;
    }

    const currentMsg = text.trim();
    setMessageInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", text: currentMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: currentMsg, 
          prevTasks: draftTasks,
          history: messages.slice(-6) // Send the last 6 messages for context
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطأ في الاتصال");

      setDraftTasks(data.tasks);
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  }, [messageInput, draftTasks, handleOrganize]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setFormColor("default");
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((index: number) => {
    const item = scheduleItems[index];
    setEditingIndex(index);
    setFormLabel(item.label);
    setFormSub(item.sub || "");
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormType(item.type as "study" | "sleep" | "workout" | "meeting" | "prayer");
    setFormColor(item.color || "default");
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
      color: formColor === "default" ? undefined : formColor,
    };

    let updated: TimeBlock[];
    if (editingIndex !== null) {
      updated = scheduleItems.map((item, idx) => (idx === editingIndex ? newBlock : item));
    } else {
      updated = [...scheduleItems, newBlock];
    }

    setScheduleItems(sortBlocks(updated));
    setIsModalOpen(false);
  }, [formLabel, formSub, formStartTime, formEndTime, formType, formColor, editingIndex, scheduleItems]);

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
  // Handled inside the textarea for chat directly.
  const cityEn = findCity(city)?.nameEn || "Riyadh";

  return (
    <div
      className="w-full min-h-screen p-4 sm:p-6 transition-colors duration-300 relative z-0"
      style={{ background: "transparent", color: "var(--ink)" }}
    >
      <BackgroundElements cityEn={cityEn} />
      <div className="max-w-2xl mx-auto relative z-10">
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

        {/* ─── Chat Area ─────────────────────────────────────────── */}
        {!isChatCollapsed && (
          <div className="mb-8">
            {messages.length > 0 && (
              <div className="max-h-60 sm:max-h-80 overflow-y-auto mb-4 space-y-3 px-2 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`} dir="rtl">
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                      style={{
                        background: msg.role === 'user' ? 'var(--gold)' : 'var(--card)',
                        color: msg.role === 'user' ? 'var(--paper)' : 'var(--ink)',
                        border: msg.role === 'ai' ? '1px solid var(--line)' : 'none',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-end" dir="rtl">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2"
                      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
                    >
                      <Loader2 size={16} className="animate-spin opacity-50" />
                      <span className="opacity-50">يتم تحديث المهام...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div
              className="rounded-lg border px-3 py-2 sm:px-4 sm:py-3 flex items-end gap-2"
              style={{
                background: "var(--card)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              <button
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !messageInput.trim()}
                className="shrink-0 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--gold)" }}
                aria-label="إرسال"
              >
                <Send size={18} className="rtl:-scale-x-100" />
              </button>
              
              <textarea
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب مهامك، عدّلها، أو قل 'رتّب' لإنشاء الجدول..."
                className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:opacity-60 resize-none max-h-32 min-h-[44px] pt-2"
                style={{ color: "var(--ink)" }}
                dir="rtl"
                rows={1}
              />
              <Feather size={18} style={{ color: "var(--ink-soft)", flexShrink: 0, marginBottom: '10px' }} />
            </div>
            
            <div className="flex justify-start mt-3">
              <button
                id="organize-btn"
                onClick={handleOrganize}
                disabled={loading || draftTasks.length === 0}
                className="text-xs sm:text-sm px-4 py-2 rounded-md border flex items-center gap-1.5 hover:opacity-80 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                style={{
                  background: "var(--gold)",
                  borderColor: "var(--gold)",
                  color: "var(--paper)",
                }}
              >
                {loading ? (
                  <>جارٍ الترتيب <Loader2 size={14} className="animate-spin" /></>
                ) : (
                  <>رتّب الجدول النهائي <Sparkles size={14} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {isChatCollapsed && (
           <div className="mb-6 flex justify-center">
             <button
                onClick={() => setIsChatCollapsed(false)}
                className="text-xs px-4 py-2 rounded-full border flex items-center gap-2 hover:opacity-80 transition-all cursor-pointer"
                style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink)" }}
              >
                <MessageCircle size={14} /> العودة للمحادثة وتعديل المهام
             </button>
           </div>
        )}

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
          <div ref={parentRef}>
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
        {!loading && scheduleItems.length === 0 && !error && isChatCollapsed && (
          <div
            className="text-center py-16 text-sm"
            style={{ color: "var(--ink-soft)" }}
          >
            <Feather
              size={32}
              className="mx-auto mb-3 opacity-30"
              style={{ color: "var(--gold)" }}
            />
            <p>لا يوجد جدول حالياً. افتح المحادثة لإضافة مهامك.</p>
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTask();
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
                className="w-full text-right px-3 py-2 text-sm rounded-md border outline-none bg-transparent focus:ring-2 focus:ring-opacity-50 transition-all duration-300"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                dir="rtl"
                required
                autoFocus
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
                className="w-full text-right px-3 py-2 text-sm rounded-md border outline-none bg-transparent focus:ring-2 focus:ring-opacity-50 transition-all duration-300"
                style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                dir="rtl"
              />
            </div>

            {/* Type selection */}
            <div className="mb-4 text-right relative">
              <label className="block text-xs mb-1 font-bold" style={{ color: "var(--ink-soft)" }}>
                النوع
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as "study" | "sleep" | "workout" | "meeting" | "prayer")}
                className="w-full text-right px-3 py-2 text-sm rounded-md border outline-none bg-transparent cursor-pointer appearance-none"
                style={{ borderColor: "var(--line)", color: "var(--ink)", background: "var(--card)" }}
                dir="rtl"
              >
                <option value="study">دراسة 📖</option>
                <option value="sleep">نوم 🛌</option>
                <option value="workout">نشاط بدني 🏋️</option>
                <option value="meeting">اجتماع ☕️</option>
                <option value="prayer">صلاة 🕌</option>
              </select>
              <ChevronDown className="absolute left-3 top-9 opacity-50 pointer-events-none" size={14} />
            </div>

            {/* Time Slider */}
            <div className="mb-6 text-right" dir="rtl">
              <label className="block text-xs mb-1 font-bold" style={{ color: "var(--ink-soft)" }}>
                وقت المهمة
              </label>
              <TimeRangeSlider
                startTime={formStartTime}
                endTime={formEndTime}
                onChange={(start, end) => {
                  setFormStartTime(start);
                  setFormEndTime(end);
                }}
              />
            </div>

            {/* Color Picker */}
            <div className="mb-6 text-right">
              <label className="block text-xs mb-2 font-bold" style={{ color: "var(--ink-soft)" }}>
                لون المهمة
              </label>
              <div className="flex items-center justify-end gap-3" dir="rtl">
                {[
                  { value: "default", label: "تلقائي", color: "var(--card)" },
                  { value: "sage", label: "زيتوني", color: "var(--color-sage)" },
                  { value: "terracotta", label: "طوبي", color: "var(--color-terracotta)" },
                  { value: "dustyblue", label: "أزرق رمادي", color: "var(--color-dustyblue)" },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setFormColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                      formColor === c.value ? "scale-110 shadow-md border-opacity-100" : "hover:scale-105 border-opacity-50 opacity-80 hover:opacity-100"
                    }`}
                    style={{
                      background: c.color,
                      borderColor: formColor === c.value ? "var(--ink)" : "var(--line)",
                    }}
                    title={c.label}
                    aria-label={`اختيار اللون ${c.label}`}
                  />
                ))}
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
                className="flex-[2] px-5 py-2 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--gold)",
                  borderColor: "var(--gold)",
                  color: "var(--paper)",
                }}
              >
                حفظ المهمة
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-5 py-2 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer"
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
