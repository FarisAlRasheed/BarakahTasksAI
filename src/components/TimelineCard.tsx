"use client";

import { Moon, BookOpen, Bed, Timer } from "lucide-react";
import type { TimeBlock } from "@/lib/schedule";

interface TimelineCardProps {
  item: TimeBlock;
  index: number;
  onStartTimer?: (label: string) => void;
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
}: TimelineCardProps) {
  const Icon = iconFor(item.type);
  const isPrayer = item.type === "prayer";
  const isStudy = item.type === "study";

  return (
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
        <div className="text-base font-bold truncate">{item.label}</div>
        {item.sub && (
          <div className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
            {item.sub}
          </div>
        )}
      </div>

      {/* Timer button (study blocks only) */}
      {isStudy && onStartTimer && (
        <button
          onClick={() => onStartTimer(item.label)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md border transition-all duration-200 hover:scale-105"
          style={{
            background: "var(--paper)",
            borderColor: "var(--line)",
            color: "var(--gold)",
          }}
          aria-label={`بدء مؤقت ${item.label}`}
          title="ابدأ مؤقت التركيز"
        >
          <Timer size={14} />
        </button>
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
