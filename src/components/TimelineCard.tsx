import { useState, useRef, useEffect } from "react";
import { Moon, BookOpen, Bed, Timer, Check, Pencil, Trash2, MoreVertical } from "lucide-react";
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

  return (
    <div className={`transition-all duration-300 relative hover:-translate-y-[2px] hover:shadow-sm ${item.completed ? "opacity-50" : ""} ${isMenuOpen ? "z-50" : "z-10"}`}>
      <div
        className="timeline-item animate-fade-in-up opacity-0 rounded-lg border px-3 sm:px-4 py-3 mb-2 flex items-center gap-3 group transition-all duration-300"

        style={{
          background: "var(--card)",
          borderColor: "var(--line)",
          borderStyle: isPrayer ? "dashed" : "solid",
          color: "var(--ink)",
          animationDelay: `${index * 0.05}s`,
          animationFillMode: "forwards",
        }}
      >
        {/* Checkbox (for study/sleep blocks) */}
        {!isPrayer && onToggleComplete && (
          <button
            onClick={() => onToggleComplete(index)}
            className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
            style={{
              borderColor: item.completed ? "var(--gold)" : "var(--line)",
              background: item.completed ? "var(--gold)" : "transparent",
              color: item.completed ? "var(--paper)" : "transparent",
            }}
            aria-label={item.completed ? "إلغاء الإنجاز" : "تحديد كمنجز"}
          >
            <Check size={12} className={item.completed ? "opacity-100" : "opacity-0"} />
          </button>
        )}

        {/* Icon */}
        <div
          className="flex-shrink-0 p-1.5 rounded-md"
          style={{
            background: isPrayer ? "var(--accent-glow)" : "transparent",
          }}
        >
          <Icon
            size={17}
            style={{ color: isPrayer ? "var(--gold)" : "var(--ink)" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-base font-bold truncate transition-all duration-300 ${
              item.completed ? "line-through opacity-60 decoration-gold/40" : ""
            }`}
          >
            {item.label}
          </div>
          {item.sub && (
            <div className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
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

            {/* Mobile: 3 dots menu */}
            <div className="sm:hidden relative flex items-center" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                style={{ color: "var(--ink-soft)" }}
                aria-label="خيارات المهمة"
              >
                <MoreVertical size={18} />
              </button>

              {isMenuOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-32 rounded-lg border shadow-lg flex flex-col overflow-hidden animate-fade-in-up"
                  style={{ background: "var(--card)", borderColor: "var(--line)", zIndex: 100 }}
                >
                  {isStudy && onStartTimer && (
                    <button
                      onClick={() => { onStartTimer(item.label); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-right hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: "var(--gold)" }}
                    >
                      <Timer size={14} /> بدء المؤقت
                    </button>
                  )}
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
    </div>
  );
}
