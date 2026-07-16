import { useState, useRef, useEffect } from "react";
import { Moon, Sun, BookOpen, Bed, Timer, Check, Pencil, Trash2, MoreVertical, Dumbbell, Coffee } from "lucide-react";
import type { TimeBlock } from "@/lib/schedule";
import { parseTime } from "@/lib/schedule";

interface TimelineCardProps {
  item: TimeBlock;
  index: number;
  onStartTimer?: (label: string) => void;
  onToggleComplete?: (index: number) => void;
  onDelete?: (index: number) => void;
  onEdit?: (index: number) => void;
}

function iconFor(item: TimeBlock) {
  if (item.type === "prayer") {
    const mins = parseTime(item.startTime);
    // Daytime prayers (between 06:00 and 18:00, e.g. Dhuhr, Asr) get Sun, night prayers get Moon
    if (mins >= 360 && mins < 1080) {
      return Sun;
    }
    return Moon;
  }
  if (item.type === "sleep") return Bed;
  if (item.type === "workout") return Dumbbell;
  if (item.type === "meeting") return Coffee;
  return BookOpen;
}

/**
 * Formats a 24h "HH:mm" time string to Arabic-style display.
 * e.g. "14:30" → "٢:٣٠ م"
 */
function formatTimeArabic(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;

  // Convert to Arabic-Indic numerals
  const toArabicNum = (n: number) =>
    n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

  return `${toArabicNum(hour12)}:${toArabicNum(m).padStart(2, "٠")} ${period}`;
}

export default function TimelineCard({
  item,
  index,
  onStartTimer,
  onToggleComplete,
  onDelete,
  onEdit,
}: TimelineCardProps) {
  const Icon = iconFor(item);
  const isPrayer = item.type === "prayer";
  const isStudy = item.type === "study";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine colors
  let cardBg = "var(--card)";
  let cardColor = "var(--ink)";
  let subColor = "var(--ink-soft)";
  let borderColor = "var(--line)";
  let isColored = false;

  if (isPrayer) {
    cardBg = "var(--color-prayer)";
    cardColor = "var(--paper)";
    subColor = "var(--paper)";
    borderColor = "var(--color-prayer)";
    isColored = true;
  } else if (item.color && item.color !== "default") {
    cardBg = `var(--color-task-${item.color})`;
    cardColor = "var(--paper)";
    subColor = "var(--paper)";
    borderColor = `var(--color-task-${item.color})`;
    isColored = true;
  }

  // Calculate min-height based on duration (min 48px, max 160px)
  const durationMins = Math.max(parseTime(item.endTime) - parseTime(item.startTime), 15);
  const minHeight = Math.max(48, Math.min(160, durationMins * 1.2));

  return (
    <div
      className="group flex items-center gap-2 sm:gap-4 px-2.5 sm:px-5 py-2.5 sm:py-3 mb-2.5 sm:mb-3 rounded-xl sm:rounded-2xl border relative overflow-visible transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--gold)]/40 timeline-item backdrop-blur-sm"
      style={{
        background: cardBg,
        borderColor: borderColor,
        color: cardColor,
        minHeight: `${minHeight}px`,
      }}
      dir="rtl"
    >
      {/* ── RIGHT SIDE: Icon ── */}
      <div
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
        style={{
          background: isColored ? "rgba(255,255,255,0.15)" : "var(--paper)",
          borderColor: isColored ? "rgba(255,255,255,0.4)" : "var(--line)",
          color: isColored ? "var(--paper)" : (isPrayer ? "var(--gold)" : "var(--ink)"),
        }}
      >
        <Icon size={16} className="sm:w-5 sm:h-5" />
      </div>

      {/* ── MIDDLE: Label + Sub + Time (all inline) ── */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-3 overflow-hidden">
        {/* Label */}
        <span
          className={`text-xs sm:text-base font-bold truncate smooth-strikethrough ${
            item.completed ? "is-completed opacity-60" : ""
          }`}
        >
          {item.label}
        </span>

        {/* Sub (if exists) */}
        {item.sub && (
          <span className={`text-[10px] sm:text-[11px] truncate hidden md:inline ${isColored ? "opacity-70" : ""}`} style={{ color: subColor }}>
            {item.sub}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Time range */}
        <span
          className="text-[10px] sm:text-xs font-bold shrink-0 whitespace-nowrap opacity-85"
          style={{ color: isColored ? "var(--paper)" : "var(--gold)" }}
        >
          {formatTimeArabic(item.startTime)} – {formatTimeArabic(item.endTime)}
        </span>
      </div>

      {/* ── LEFT SIDE: Timer + Actions ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Timer button (always visible for study tasks) */}
        {isStudy && onStartTimer && (
          <button
            onClick={() => onStartTimer(item.label)}
            className="px-2 sm:px-2.5 py-1 rounded-lg border hover:scale-105 transition-all cursor-pointer flex items-center gap-1 text-[10px] sm:text-xs font-bold whitespace-nowrap"
            style={{
              background: isColored ? "rgba(255,255,255,0.15)" : "var(--paper)",
              borderColor: isColored ? "rgba(255,255,255,0.3)" : "var(--line)",
              color: isColored ? "var(--paper)" : "var(--gold)",
            }}
          >
            <Timer size={11} className="sm:w-3.5 sm:h-3.5" /> ابدأ التركيز
          </button>
        )}

        {/* 3-dots menu (for non-prayer tasks) */}
        {!isPrayer && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: isColored ? "var(--paper)" : "var(--ink-soft)" }}
              aria-label="خيارات المهمة"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-28 rounded-lg border shadow-lg flex flex-col overflow-hidden animate-fade-in-up"
                style={{ background: "var(--card)", borderColor: "var(--line)", zIndex: 100 }}
              >
                {onEdit && (
                  <button
                    onClick={() => { onEdit(index); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-right hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    style={{ color: "var(--ink)" }}
                  >
                    <Pencil size={13} /> تعديل
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(index); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-right text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} /> حذف
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Checkbox (far left, for non-prayer tasks) */}
        {!isPrayer && onToggleComplete && (
          <button
            onClick={() => onToggleComplete(index)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
              item.completed
                ? "bg-[var(--gold)] border-[var(--gold)] shadow-inner scale-110"
                : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--gold)] hover:scale-110"
            }`}
            aria-label={item.completed ? "تحديد كغير منجزة" : "تحديد كمنجزة"}
          >
            {item.completed && <Check size={14} style={{ color: "var(--paper)" }} />}
          </button>
        )}
      </div>
    </div>
  );
}
