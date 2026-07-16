"use client";

import { useState } from "react";
import { Moon, BookOpen, Bed, Timer, Trash2, Pencil, Check, X } from "lucide-react";
import type { TimeBlock } from "@/lib/schedule";

interface TimelineCardProps {
  item: TimeBlock;
  index: number;
  onStartTimer?: (label: string) => void;
  onDelete?: (index: number) => void;
  onEdit?: (index: number, updated: Partial<TimeBlock>) => void;
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

/** Validates an "HH:mm" 24-hour time string. */
function isValidTime(time: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [h, m] = time.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export default function TimelineCard({
  item,
  index,
  onStartTimer,
  onDelete,
  onEdit,
}: TimelineCardProps) {
  const Icon = iconFor(item.type);
  const isPrayer = item.type === "prayer";
  const isStudy = item.type === "study";

  // ─── Edit Mode State ─────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(item.label);
  const [draftStart, setDraftStart] = useState(item.startTime);
  const [editError, setEditError] = useState<string | null>(null);

  const startEditing = () => {
    setDraftLabel(item.label);
    setDraftStart(item.startTime);
    setEditError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError(null);
  };

  const saveEditing = () => {
    const label = draftLabel.trim();
    if (!label) {
      setEditError("العنوان مطلوب");
      return;
    }
    if (!isValidTime(draftStart)) {
      setEditError("الوقت غير صحيح");
      return;
    }
    onEdit?.(index, {
      label,
      startTime: draftStart,
    });
    setEditing(false);
    setEditError(null);
  };

  // ─── Edit Mode UI ────────────────────────────────────────────────
  if (editing) {
    return (
      <div
        className="rounded-lg border px-3 sm:px-4 py-3 mb-2"
        style={{
          background: "var(--card)",
          borderColor: "var(--gold)",
          color: "var(--ink)",
        }}
      >
        <div className="flex flex-col gap-2">
          {/* Label input */}
          <input
            type="text"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="اسم المهمة"
            dir="rtl"
            className="w-full bg-transparent outline-none border rounded-md px-2 py-1.5 text-sm font-bold"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          />

          {/* Time input */}
          <div className="flex flex-col gap-0.5">
            <label className="text-xs" style={{ color: "var(--ink-soft)" }}>
              الوقت
            </label>
            <input
              type="time"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              className="w-full bg-transparent outline-none border rounded-md px-2 py-1 text-sm"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            />
          </div>

          {/* Error message */}
          {editError && (
            <div className="text-xs text-red-600 dark:text-red-400">
              {editError}
            </div>
          )}

          {/* Save / Cancel */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={cancelEditing}
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
              onClick={saveEditing}
              className="p-1.5 rounded-md border transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--gold)",
              }}
              aria-label="حفظ"
              title="حفظ"
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Display Mode UI ─────────────────────────────────────────────
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

      {/* Edit button (non-prayer blocks only) */}
      {!isPrayer && onEdit && (
        <button
          onClick={startEditing}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md border transition-all duration-200 hover:scale-105"
          style={{
            background: "var(--paper)",
            borderColor: "var(--line)",
            color: "var(--ink)",
          }}
          aria-label={`تعديل ${item.label}`}
          title="تعديل"
        >
          <Pencil size={14} />
        </button>
      )}

      {/* Delete button (non-prayer blocks only) */}
      {!isPrayer && onDelete && (
        <button
          onClick={() => onDelete(index)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md border transition-all duration-200 hover:scale-105"
          style={{
            background: "var(--paper)",
            borderColor: "var(--line)",
            color: "#b91c1c",
          }}
          aria-label={`حذف ${item.label}`}
          title="حذف"
        >
          <Trash2 size={14} />
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
