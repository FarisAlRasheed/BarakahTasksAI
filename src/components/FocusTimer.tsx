"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, X, Minus, Plus } from "lucide-react";

interface FocusTimerProps {
  label: string;
  onClose: () => void;
}

export default function FocusTimer({ label, onClose }: FocusTimerProps) {
  const [totalMinutes, setTotalMinutes] = useState(25); // Pomodoro default
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Sync secondsLeft when totalMinutes changes and timer hasn't started
  useEffect(() => {
    if (!hasStarted) {
      setSecondsLeft(totalMinutes * 60);
    }
  }, [totalMinutes, hasStarted]);

  // Countdown tick
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setHasStarted(false);
    setSecondsLeft(totalMinutes * 60);
  }, [totalMinutes]);

  const adjustMinutes = useCallback(
    (delta: number) => {
      if (hasStarted) return; // Can't adjust while running
      setTotalMinutes((prev) => Math.max(5, Math.min(120, prev + delta)));
    },
    [hasStarted]
  );

  // Format display
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Progress percentage (for the visual ring)
  const total = totalMinutes * 60;
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  // Ring SVG calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isComplete = secondsLeft === 0 && hasStarted;

  return (
    <div
      className="timer-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="timer-modal relative rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl transition-all duration-300"
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          color: "var(--ink)",
          boxShadow: "0 20px 50px -12px rgba(187, 170, 136, 0.25), 0 0 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-md hover:opacity-70 transition-opacity"
          aria-label="إغلاق"
        >
          <X size={18} style={{ color: "var(--ink-soft)" }} />
        </button>

        {/* Task label */}
        <h2
          className="text-center text-lg font-bold mb-6"
          style={{ fontFamily: "var(--font-aref-ruqaa), 'Aref Ruqaa', serif" }}
        >
          {isComplete ? "🎉 أحسنت!" : label}
        </h2>

        {/* Timer ring */}
        <div className="relative flex items-center justify-center mb-6">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="var(--line)"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          {/* Time display in the center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-4xl font-bold tabular-nums"
              style={{
                color: isComplete ? "var(--gold)" : "var(--ink)",
                fontFamily: "'Amiri', serif",
              }}
            >
              {display}
            </span>
          </div>
        </div>

        {/* Duration adjuster (only before starting) */}
        {!hasStarted && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => adjustMinutes(-5)}
              className="p-2 rounded-lg border hover:opacity-80 transition-opacity"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
              aria-label="إنقاص 5 دقائق"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
              {totalMinutes} دقيقة
            </span>
            <button
              onClick={() => adjustMinutes(5)}
              className="p-2 rounded-lg border hover:opacity-80 transition-opacity"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
              aria-label="زيادة 5 دقائق"
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning && !isComplete && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity"
              style={{
                background: "var(--gold)",
                borderColor: "var(--gold)",
                color: "var(--paper)",
              }}
            >
              <Play size={16} />
              {hasStarted ? "استمرار" : "ابدأ"}
            </button>
          )}

          {isRunning && (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              <Pause size={16} />
              إيقاف مؤقت
            </button>
          )}

          {hasStarted && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity"
              style={{
                background: "var(--paper)",
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
            >
              <RotateCcw size={16} />
              إعادة
            </button>
          )}

          {isComplete && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-bold hover:opacity-80 transition-opacity"
              style={{
                background: "var(--gold)",
                borderColor: "var(--gold)",
                color: "var(--paper)",
              }}
            >
              إغلاق
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
