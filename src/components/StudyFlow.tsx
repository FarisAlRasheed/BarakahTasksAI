"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Moon, Sun, Feather, Sparkles, Loader2, Plus, X, AlertCircle, Send, MessageCircle, Settings, ChevronDown, Star, Printer, Award } from "lucide-react";
import { SAUDI_CITIES, findCity } from "@/lib/cities";
import { sortBlocks, hasOverlap, parseTime, type TimeBlock } from "@/lib/schedule";
import { type ChatTask } from "@/lib/chat";
import { BARAKAH_OPTIONS, computeBarakahBlock } from "@/lib/barakah";
import TimelineCard from "./TimelineCard";
import FocusTimer from "./FocusTimer";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import BackgroundElements from "./BackgroundElements";
import TimeRangeSlider from "./TimeRangeSlider";
import DhikrCounter from "./DhikrCounter";

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
  const [isDhikrOpen, setIsDhikrOpen] = useState(false);

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

  // ─── Barakah Quick-Add Menu State ─────────────────────────────────
  const [isBarakahOpen, setIsBarakahOpen] = useState(false);
  const [barakahError, setBarakahError] = useState<string | null>(null);
  const barakahRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");

  // Current time for timeline indicator
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

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

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // ─── Barakah Quick-Add Handler ─────────────────────────────────────
  const handleAddBarakah = useCallback(
    (option: (typeof BARAKAH_OPTIONS)[number]) => {
      const prayerBlocks = scheduleItems.filter((item) => item.type === "prayer");
      const newBlock = computeBarakahBlock(option, prayerBlocks);

      if (!newBlock) {
        setBarakahError("لم يتم العثور على وقت الصلاة المناسب لهذه العبادة");
        return;
      }

      setBarakahError(null);
      setScheduleItems((prev) => sortBlocks([...prev, newBlock]));
    },
    [scheduleItems]
  );

  // Close barakah menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (barakahRef.current && !barakahRef.current.contains(event.target as Node)) {
        setIsBarakahOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Web Audio Synth Chime for task completion
  const playCompletionSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio context may be restricted by browser policy
    }
  }, []);

  const handleToggleComplete = useCallback((index: number) => {
    setScheduleItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const willComplete = !item.completed;
          if (willComplete) playCompletionSound();
          return { ...item, completed: willComplete };
        }
        return item;
      })
    );
  }, [playCompletionSound]);

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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-3 sm:p-4 rounded-2xl border backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md"
          style={{ background: "var(--card)", borderColor: "var(--line)" }}
        >
          {/* City dropdown + Subha button */}
          <div className="flex items-center gap-2">
            <select
              id="city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-xs sm:text-sm px-3 py-2 rounded-xl border outline-none cursor-pointer hover:opacity-85 transition-all duration-200"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              {SAUDI_CITIES.map((c) => (
                <option key={c.nameAr} value={c.nameAr}>
                  📍 {c.nameAr}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsDhikrOpen(true)}
              className="text-xs px-3 py-2 rounded-xl border flex items-center gap-1 hover:opacity-85 transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
              title="افتـح السبحة الإلكترونية"
            >
              📿 السبحة
            </button>
          </div>

          {/* Site name + dark mode toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              aria-label="تبديل الوضع"
              className="text-xs p-2 sm:px-3 sm:py-2 rounded-xl border hover:opacity-85 transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <span
              className="text-2xl sm:text-3xl font-bold tracking-wide"
              style={{
                color: "var(--gold)",
                fontFamily: "var(--font-aref-ruqaa), 'Aref Ruqaa', serif",
                textShadow: "0 2px 10px rgba(187, 170, 136, 0.2)",
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${
                        msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none backdrop-blur-sm'
                      }`}
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
                    <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm"
                      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
                    >
                      <Loader2 size={16} className="animate-spin opacity-60" style={{ color: "var(--gold)" }} />
                      <span className="opacity-70 font-semibold">يتم تحديث المهام...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 overflow-x-auto pb-1 no-scrollbar text-xs" dir="rtl">
              <span className="text-[11px] opacity-60 font-semibold shrink-0 ml-1">اقتراحات سريعة:</span>
              {[
                { label: "مذاكرة 📖", text: "أضف مهمة مذاكرة من 4 م إلى 6 م" },
                { label: "ورد القرآن 🕌", text: "أضف قراءة قرآن من 5 ص إلى 6 ص" },
                { label: "تمرين 🏋️", text: "أضف تمريناً رياضياً من 5 م إلى 6 م" },
                { label: "اجتماع ☕️", text: "أضف اجتماع عمل من 8 م إلى 9 م" },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setMessageInput(chip.text)}
                  className="px-2.5 py-1 rounded-full border text-[11px] font-medium shrink-0 transition-all hover:scale-105 hover:border-[var(--gold)] active:scale-95 cursor-pointer shadow-sm"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--line)",
                    color: "var(--ink)",
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div
              className="rounded-2xl border px-3 py-2 sm:px-4 sm:py-3 flex items-end gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[var(--gold)]/30 focus-within:border-[var(--gold)] shadow-sm"
              style={{
                background: "var(--card)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              <button
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !messageInput.trim()}
                className="shrink-0 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 hover:scale-110 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                placeholder="اكتب مهامك، عدّلها، أو اختر من الاقتراحات أعلاه..."
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
                className="text-xs sm:text-sm px-5 py-2.5 rounded-xl border flex items-center gap-2 font-bold hover:opacity-90 transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                style={{
                  background: "var(--gold)",
                  borderColor: "var(--gold)",
                  color: "var(--paper)",
                  boxShadow: "0 4px 14px rgba(187, 170, 136, 0.35)",
                }}
              >
                {loading ? (
                  <>جارٍ الترتيب <Loader2 size={15} className="animate-spin" /></>
                ) : (
                  <>رتّب الجدول <Sparkles size={15} /></>
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

        {/* ─── Inspirational Quranic Verse Banner ───────────────────── */}
        <div 
          className="mb-6 p-4 rounded-2xl border text-center relative overflow-hidden backdrop-blur-md shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink)" }}
          dir="rtl"
        >
          <div className="text-xs opacity-60 font-semibold mb-1 flex items-center justify-center gap-1">
            <Sparkles size={13} style={{ color: "var(--gold)" }} /> آية ودافع لليوم
          </div>
          <p 
            className="text-lg sm:text-xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-aref-ruqaa), 'Aref Ruqaa', serif", color: "var(--gold)" }}
          >
            ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
          </p>
        </div>

        {/* ─── Daily Progress & Next Prayer Info Bar ────────────────── */}
        {!loading && scheduleItems.length > 0 && (
          <div className="mb-6 space-y-3" dir="rtl">
            {/* Daily Progress Bar */}
            {(() => {
              const nonPrayerItems = scheduleItems.filter((item) => item.type !== "prayer");
              if (nonPrayerItems.length === 0) return null;
              const completedCount = nonPrayerItems.filter((item) => item.completed).length;
              const percent = Math.round((completedCount / nonPrayerItems.length) * 100);

              const toArNum = (n: number) => n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

              return (
                <div 
                  className="p-3.5 rounded-2xl border backdrop-blur-sm shadow-sm transition-all"
                  style={{ background: "var(--card)", borderColor: "var(--line)" }}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span style={{ color: "var(--ink)" }}>
                      نسبة إنجاز المهام اليومية 🎯
                    </span>
                    <span style={{ color: "var(--gold)" }}>
                      {toArNum(completedCount)} من {toArNum(nonPrayerItems.length)} ({toArNum(percent)}٪)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--paper)" }}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percent}%`, 
                        background: percent === 100 ? "var(--color-prayer)" : "var(--gold)",
                        boxShadow: "0 0 10px rgba(187, 170, 136, 0.4)"
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Next Prayer Countdown Badge */}
            {(() => {
              const currentMins = parseTime(currentTime);
              const upcomingPrayers = scheduleItems.filter(
                (item) => item.type === "prayer" && parseTime(item.startTime) > currentMins
              );
              if (upcomingPrayers.length === 0) return null;
              const nextPrayer = upcomingPrayers[0];
              const diffMins = parseTime(nextPrayer.startTime) - currentMins;
              const hours = Math.floor(diffMins / 60);
              const mins = diffMins % 60;

              const toArNum = (n: number) => n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
              let timeText = "";
              if (hours > 0) {
                timeText = `بعد ${toArNum(hours)} ساعة و ${toArNum(mins)} دقيقة`;
              } else {
                timeText = `بعد ${toArNum(mins)} دقيقة`;
              }

              return (
                <div 
                  className="px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs font-bold shadow-sm"
                  style={{ 
                    background: "rgba(130, 166, 146, 0.12)", 
                    borderColor: "var(--color-prayer)",
                    color: "var(--ink)"
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Moon size={14} style={{ color: "var(--color-prayer)" }} />
                    {nextPrayer.label}
                  </span>
                  <span className="opacity-80" style={{ color: "var(--color-prayer)" }}>
                    {timeText}
                  </span>
                </div>
              );
            })()}

            {/* 100% Completion Celebration Banner */}
            {(() => {
              const nonPrayerItems = scheduleItems.filter((item) => item.type !== "prayer");
              if (nonPrayerItems.length === 0) return null;
              const allDone = nonPrayerItems.every((item) => item.completed);
              if (!allDone) return null;

              return (
                <div 
                  className="p-4 rounded-2xl border flex items-center justify-between animate-fade-in-up shadow-md"
                  style={{ 
                    background: "rgba(187, 170, 136, 0.15)", 
                    borderColor: "var(--gold)",
                    color: "var(--ink)"
                  }}
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Award size={20} style={{ color: "var(--gold)" }} />
                    <span>ما شاء الله! أنجزت جميع مهامك اليوم بنجاح 🎉</span>
                  </div>
                  <span className="text-xs opacity-80 font-medium">بارك الله في وقتك!</span>
                </div>
              );
            })()}
          </div>
        )}

        {/* ─── Timeline Header & Controls ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm" style={{ color: "var(--ink-soft)" }}>جدول اليوم</span>
            
            {/* Category Filter Chips */}
            {scheduleItems.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                {[
                  { id: "all", label: "الكل" },
                  { id: "study", label: "دراسة 📖" },
                  { id: "prayer", label: "صلوات 🕌" },
                  { id: "workout", label: "رياضة 🏋️" },
                  { id: "meeting", label: "اجتماعات ☕️" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterType(cat.id)}
                    className="px-2 py-0.5 rounded-md transition-all cursor-pointer"
                    style={{
                      background: filterType === cat.id ? "var(--gold)" : "var(--card)",
                      color: filterType === cat.id ? "var(--paper)" : "var(--ink-soft)",
                      border: "1px solid var(--line)"
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span style={{ color: "var(--ink-soft)" }}>الجدول الزمني — اليوم</span>
          {scheduleItems.length > 0 && !loading && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1 hover:opacity-85 transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--line)",
                  color: "var(--ink)",
                }}
                title="طباعة الجدول الزمني"
              >
                <Printer size={13} /> طباعة
              </button>
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

              {/* بركة — Quick-add worship options */}
              <div className="relative" ref={barakahRef}>
                <button
                  onClick={() => setIsBarakahOpen((prev) => !prev)}
                  className="text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1 hover:opacity-85 transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{
                    background: "var(--color-sage)",
                    borderColor: "var(--color-sage)",
                    color: "var(--paper)",
                  }}
                >
                  <Star size={12} /> بركة
                </button>

                {isBarakahOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 w-64 rounded-lg border shadow-lg overflow-hidden animate-fade-in-up"
                    style={{ background: "var(--card)", borderColor: "var(--line)", zIndex: 100 }}
                    dir="rtl"
                  >
                    <div
                      className="px-3 py-2 text-xs font-bold border-b"
                      style={{ color: "var(--ink-soft)", borderColor: "var(--line)" }}
                    >
                      إضافة عبادة إلى الجدول
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                      {BARAKAH_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleAddBarakah(option)}
                          className="w-full text-right px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col"
                          style={{ color: "var(--ink)" }}
                        >
                          <span className="font-bold">{option.label}</span>
                          <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
                            {option.sub} · {option.duration} د
                          </span>
                        </button>
                      ))}
                    </div>
                    {barakahError && (
                      <div
                        className="px-3 py-2 text-xs border-t"
                        style={{ color: "#dc2626", borderColor: "var(--line)" }}
                      >
                        {barakahError}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
          <div className="relative" dir="rtl">
            {/* Vertical timeline line */}
            <div
              className="absolute right-5 top-0 bottom-0 w-0.5 rounded-full"
              style={{ background: "var(--line)" }}
            />

            {/* Current time indicator */}
            {(() => {
              const currentMins = parseTime(currentTime);
              const firstStart = scheduleItems.length > 0 ? parseTime(scheduleItems[0].startTime) : 0;
              const lastEnd = scheduleItems.length > 0 ? parseTime(scheduleItems[scheduleItems.length - 1].endTime) : 1440;
              const totalRange = Math.max(lastEnd - firstStart, 1);
              const currentPercent = Math.max(0, Math.min(100, ((currentMins - firstStart) / totalRange) * 100));
              
              if (currentMins >= firstStart && currentMins <= lastEnd) {
                const formatNow = (t: string) => {
                  const [h, m] = t.split(':').map(Number);
                  const p = h >= 12 ? 'م' : 'ص';
                  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                  const toAr = (n: number) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
                  return `${toAr(h12)}:${toAr(m).padStart(2, '٠')} ${p}`;
                };
                return (
                  <div
                    className="absolute right-0 flex items-center z-10 pointer-events-none"
                    style={{ top: `${currentPercent}%` }}
                  >
                    {/* Arrow + line */}
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full border-2 animate-pulse-gold"
                        style={{ background: "var(--gold)", borderColor: "var(--gold)" }}
                      />
                      <div
                        className="h-0.5 w-8"
                        style={{ background: "var(--gold)" }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-bold mr-1 whitespace-nowrap"
                      style={{ color: "var(--gold)" }}
                    >
                      {formatNow(currentTime)}
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Timeline items */}
            <div ref={parentRef} className="relative">
              {scheduleItems
                .filter((item) => filterType === "all" || item.type === filterType)
                .map((item, i) => (
                  <div 
                    key={`${item.startTime}-${item.label}-${i}`} 
                    className="flex items-stretch mb-0 relative"
                    style={{ zIndex: 100 - i }}
                  >
                    {/* Right time column */}
                    <div className="w-10 flex flex-col items-center flex-shrink-0 relative">
                      {/* Time dot on the line */}
                      <div
                        className="w-2.5 h-2.5 rounded-full border-2 mt-5 z-[1]"
                        style={{
                          background: item.type === 'prayer' ? 'var(--color-prayer)' : 'var(--card)',
                          borderColor: item.type === 'prayer' ? 'var(--color-prayer)' : 'var(--gold)',
                        }}
                      />
                    </div>
                    {/* Card */}
                    <div className="flex-1 min-w-0">
                      <TimelineCard
                        item={item}
                        index={i}
                        onStartTimer={handleStartTimer}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDelete}
                        onEdit={openEditModal}
                      />
                    </div>
                  </div>
                ))}
            </div>
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

      {/* ─── Focus Timer Modal ───────────────────────────────────── */}
      {timerLabel && (
        <FocusTimer label={timerLabel} onClose={handleCloseTimer} />
      )}

      {/* ─── Dhikr Electronic Subha Modal ──────────────────────────── */}
      {isDhikrOpen && (
        <DhikrCounter onClose={() => setIsDhikrOpen(false)} />
      )}
    </div>
  );
}
