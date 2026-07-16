"use client";

import React, { useState, useRef, useEffect } from "react";
import { parseTime, minutesToTime } from "@/lib/schedule";

interface TimeRangeSliderProps {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  onChange: (start: string, end: string) => void;
  minDuration?: number; // minimum duration in minutes (default 15)
}

export default function TimeRangeSlider({ startTime, endTime, onChange, minDuration = 15 }: TimeRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);

  const startMins = parseTime(startTime);
  const endMins = parseTime(endTime);
  const totalMins = 1440; // 24 hours

  // Use refs for latest state inside event listeners
  const stateRef = useRef({ startMins, endMins, onChange, minDuration });
  stateRef.current = { startMins, endMins, onChange, minDuration };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      // Calculate X relative to the track
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      
      // Snap to 1 minute
      let mins = Math.round(percentage * totalMins);
      
      const { startMins: currentStart, endMins: currentEnd, onChange: currentOnChange, minDuration: currentMin } = stateRef.current;

      if (isDragging === "start") {
        mins = Math.min(mins, currentEnd - currentMin);
        currentOnChange(minutesToTime(mins), minutesToTime(currentEnd));
      } else {
        mins = Math.max(mins, currentStart + currentMin);
        currentOnChange(minutesToTime(currentStart), minutesToTime(mins));
      }
    };

    const handlePointerUp = () => setIsDragging(null);

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isDragging]); // Only re-bind when isDragging changes

  const startPercent = (startMins / totalMins) * 100;
  const endPercent = (endMins / totalMins) * 100;

  // Format nicely for display
  const formatArabic = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "م" : "ص";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const toArabicNum = (n: number) => n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
    return `${toArabicNum(hour12)}:${toArabicNum(m).padStart(2, "٠")} ${period}`;
  };

  return (
    <div className="py-6 select-none w-full" dir="ltr">
      <div className="relative h-12 bg-[var(--paper)] rounded-xl border border-[var(--line)] overflow-visible touch-none" ref={trackRef}>
        
        {/* Selected Range Highlight Background */}
        <div 
          className="absolute top-0 bottom-0 bg-[var(--gold)] opacity-10 transition-all duration-75"
          style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
        />

        {/* Selected Range Borders */}
        <div 
          className="absolute top-0 bottom-0 border-y-2 border-[var(--gold)] transition-all duration-75"
          style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
        />

        {/* Start Thumb */}
        <div 
          className="absolute top-0 bottom-0 w-8 -ml-4 cursor-ew-resize flex items-center justify-center z-10 touch-none group transition-all duration-75"
          style={{ left: `${startPercent}%` }}
          onPointerDown={() => setIsDragging("start")}
        >
          <div className="h-full w-2.5 bg-[var(--gold)] rounded-sm shadow-md group-hover:scale-110 transition-transform" />
          <div 
            className="absolute -bottom-8 whitespace-nowrap text-xs font-bold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
            dir="rtl"
          >
            {formatArabic(startTime)}
          </div>
        </div>

        {/* End Thumb */}
        <div 
          className="absolute top-0 bottom-0 w-8 -ml-4 cursor-ew-resize flex items-center justify-center z-10 touch-none group transition-all duration-75"
          style={{ left: `${endPercent}%` }}
          onPointerDown={() => setIsDragging("end")}
        >
          <div className="h-full w-2.5 bg-[var(--gold)] rounded-sm shadow-md group-hover:scale-110 transition-transform" />
          <div 
            className="absolute -top-8 whitespace-nowrap text-xs font-bold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
            dir="rtl"
          >
            {formatArabic(endTime)}
          </div>
        </div>

        {/* Time Indicators inside the highlight */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-sm font-bold opacity-60" style={{ color: "var(--ink-soft)" }}>
            {formatArabic(startTime)} - {formatArabic(endTime)}
          </span>
        </div>

      </div>
    </div>
  );
}
