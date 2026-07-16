"use client";

import { Moon, BookOpen, Bed, Timer, Check, Pencil, Trash2 } from "lucide-react";
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

  return (
    <div className={`transition-opacity duration-300 ${item.completed ? "opacity-50" : ""}`}>
      <div
        className="timeline-item animate-fade-in-up opacity-0 rounded-lg border px-3 sm:px-4 py-3 mb-2 flex items-center gap-3 group"
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
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                onClick={() => onEdit(index)}
                className="p-1.5 rounded-md border hover:scale-105 transition-all cursor-pointer"
                style={{
                  background: "var(--paper)",
                  borderColor: "var(--line)",
                  color: "var(--ink-soft)",
                }}
                aria-label="تعديل المهمة"
                title="تعديل المهمة"
              >
                <Pencil size={13} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(index)}
                className="p-1.5 rounded-md border hover:scale-105 hover:text-red-500 transition-all cursor-pointer"
                style={{
                  background: "var(--paper)",
                  borderColor: "var(--line)",
                  color: "var(--ink-soft)",
                }}
                aria-label="حذف المهمة"
                title="حذف المهمة"
              >
                <Trash2 size={13} />
              </button>
            )}

            {isStudy && onStartTimer && (
              <button
                onClick={() => onStartTimer(item.label)}
                className="p-1.5 rounded-md border hover:scale-105 transition-all cursor-pointer"
                style={{
                  background: "var(--paper)",
                  borderColor: "var(--line)",
                  color: "var(--gold)",
                }}
                aria-label={`بدء مؤقت ${item.label}`}
                title="ابدأ مؤقت التركيز"
              >
                <Timer size={13} />
              </button>
            )}
          </div>
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
