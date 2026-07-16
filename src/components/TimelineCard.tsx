import { useState, useRef, useEffect } from "react";
import { Moon, BookOpen, Bed, Timer, Check, Pencil, Trash2, MoreVertical, Dumbbell, Coffee } from "lucide-react";
import type { TimeBlock } from "@/lib/schedule";

interface TimelineCardProps {
  item: TimeBlock;
  index: number;
  onStartTimer?: (label: string) => void;
  onToggleComplete?: (index: number) => void;
  onDelete?: (index: number) => void;
  onEdit?: (index: number) => void;
}

function iconFor(type: TimeBlock["type"]) {
  if (type === "prayer") return Moon;
  if (type === "sleep") return Bed;
  if (type === "workout") return Dumbbell;
  if (type === "meeting") return Coffee;
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
  const Icon = iconFor(item.type);
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

  return (
    <div
      className="group flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 mb-4 rounded-xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md timeline-item"
      style={{
        background: cardBg,
        borderColor: borderColor,
        color: cardColor,
      }}
      dir="rtl"
    >
        {/* Checkbox (for study/sleep blocks) */}
        {!isPrayer && onToggleComplete && (
          <button 
            onClick={() => onToggleComplete(index)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ml-4 ${
              item.completed
                ? "bg-[var(--gold)] border-[var(--gold)] shadow-inner scale-110"
                : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--gold)] hover:scale-110"
            }`}
            aria-label={item.completed ? "تحديد كغير منجزة" : "تحديد كمنجزة"}
          >
            {item.completed && <Check size={14} style={{ color: "var(--paper)" }} />}
          </button>
        )}

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ml-4"
          style={{ 
            background: isColored ? "transparent" : "var(--paper)", 
            borderColor: isColored ? "var(--paper)" : "var(--line)",
            color: isColored ? "var(--paper)" : (isPrayer ? "var(--gold)" : "var(--ink)") 
          }}
        >
          <Icon
            size={18}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-base font-bold truncate transition-all duration-300 smooth-strikethrough ${
              item.completed ? "is-completed opacity-60" : ""
            }`}
          >
            {item.label}
          </div>
          {item.sub && (
            <div className={`text-xs truncate ${isColored ? "opacity-80" : ""}`} style={{ color: subColor }}>
              {item.sub}
            </div>
          )}
        </div>

        {/* Action buttons (only for study/sleep blocks) */}
        {!isPrayer && (
          <>
            {/* Desktop: show on hover */}
            <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onEdit && (
                <button
                  onClick={() => onEdit(index)}
                  className="p-1.5 rounded-md border hover:scale-105 transition-all cursor-pointer"
                  style={{ background: "var(--paper)", borderColor: "var(--line)", color: "var(--ink-soft)" }}
                  title="تعديل المهمة"
                >
                  <Pencil size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(index)}
                  className="p-1.5 rounded-md border hover:scale-105 hover:text-red-500 transition-all cursor-pointer"
                  style={{ background: "var(--paper)", borderColor: "var(--line)", color: "var(--ink-soft)" }}
                  title="حذف المهمة"
                >
                  <Trash2 size={13} />
                </button>
              )}
              {isStudy && onStartTimer && (
                <button
                  onClick={() => onStartTimer(item.label)}
                  className="p-1.5 rounded-md border hover:scale-105 transition-all cursor-pointer"
                  style={{ background: "var(--paper)", borderColor: "var(--line)", color: "var(--gold)" }}
                  title="ابدأ مؤقت التركيز"
                >
                  <Timer size={13} />
                </button>
              )}
            </div>

            {/* Mobile Actions: Timer (Standalone) + 3 dots menu */}
            <div className="sm:hidden relative flex items-center gap-1" ref={menuRef}>
              {/* Standalone Timer Button for Mobile */}
              {isStudy && onStartTimer && (
                <button
                  onClick={() => onStartTimer(item.label)}
                  className="p-2 rounded-full border hover:scale-105 transition-all cursor-pointer shadow-sm"
                  style={{ 
                    background: isColored ? "rgba(255,255,255,0.1)" : "var(--paper)", 
                    borderColor: isColored ? "rgba(255,255,255,0.3)" : "var(--line)", 
                    color: isColored ? "var(--paper)" : "var(--gold)" 
                  }}
                  aria-label="ابدأ مؤقت التركيز"
                >
                  <Timer size={16} />
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: isColored ? "var(--paper)" : "var(--ink-soft)" }}
                aria-label="خيارات المهمة"
              >
                <MoreVertical size={18} />
              </button>

              {isMenuOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-32 rounded-lg border shadow-lg flex flex-col overflow-hidden animate-fade-in-up"
                  style={{ background: "var(--card)", borderColor: "var(--line)", zIndex: 100 }}
                >
                  {onEdit && (
                    <button
                      onClick={() => { onEdit(index); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-right hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: "var(--ink)" }}
                    >
                      <Pencil size={14} /> تعديل
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { onDelete(index); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-right text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Trash2 size={14} /> حذف
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Time display */}
        <div
          className="text-xs sm:text-sm font-bold flex-shrink-0 whitespace-nowrap"
          style={{ color: isPrayer ? "var(--gold)" : "var(--ink)" }}
        >
          {formatTimeArabic(item.startTime)}
      </div>
    </div>
  );
}
