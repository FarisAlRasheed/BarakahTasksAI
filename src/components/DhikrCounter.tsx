"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RotateCcw, Sparkles, Volume2 } from "lucide-react";

interface DhikrCounterProps {
  onClose: () => void;
}

const DHIKR_PHRASES = [
  { text: "سبحان الله", target: 33 },
  { text: "الحمد لله", target: 33 },
  { text: "الله أكبر", target: 33 },
  { text: "لا إله إلا الله", target: 100 },
  { text: "أستغفر الله واتوب إليه", target: 100 },
  { text: "اللهم صلِّ وسلم على نبينا محمد", target: 10 },
];

export default function DhikrCounter({ onClose }: DhikrCounterProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem("barakah_dhikr_total");
    if (saved) {
      setTotalToday(parseInt(saved, 10) || 0);
    }
  }, []);

  // Web Audio Click sound
  const playClickSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio context policy
    }
  }, []);

  const handleIncrement = () => {
    playClickSound();
    const nextCount = count + 1;
    const nextTotal = totalToday + 1;
    setCount(nextCount);
    setTotalToday(nextTotal);
    localStorage.setItem("barakah_dhikr_total", nextTotal.toString());
  };

  const handleReset = () => {
    setCount(0);
  };

  const currentPhrase = DHIKR_PHRASES[phraseIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center border animate-fade-in-up"
        style={{
          background: "var(--card)",
          borderColor: "var(--line)",
          color: "var(--ink)",
          boxShadow: "0 20px 50px -12px rgba(187, 170, 136, 0.3)",
        }}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X size={18} style={{ color: "var(--ink-soft)" }} />
        </button>

        {/* Header Title */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold mb-4 opacity-70">
          <Sparkles size={14} style={{ color: "var(--gold)" }} />
          <span>سُبحة البركة الإلكترونية 📿</span>
        </div>

        {/* Phrase Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {DHIKR_PHRASES.map((p, idx) => (
            <button
              key={p.text}
              onClick={() => {
                setPhraseIndex(idx);
                setCount(0);
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-sm"
              style={{
                background: idx === phraseIndex ? "var(--gold)" : "var(--paper)",
                color: idx === phraseIndex ? "var(--paper)" : "var(--ink)",
                border: "1px solid var(--line)",
              }}
            >
              {p.text}
            </button>
          ))}
        </div>

        {/* Phrase Text */}
        <h2
          className="text-xl sm:text-2xl font-bold mb-4 min-h-[50px] flex items-center justify-center"
          style={{
            fontFamily: "var(--font-aref-ruqaa), 'Aref Ruqaa', serif",
            color: "var(--gold)",
          }}
        >
          {currentPhrase.text}
        </h2>

        {/* Counter Circle Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleIncrement}
            className="w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 active:scale-95 shadow-lg cursor-pointer hover:border-[var(--gold)]"
            style={{
              background: "var(--paper)",
              borderColor: "var(--gold)",
              boxShadow: "0 8px 24px rgba(187, 170, 136, 0.25), inset 0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <span
              className="text-4xl font-bold tabular-nums"
              style={{ color: "var(--ink)", fontFamily: "'Amiri', serif" }}
            >
              {count.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)])}
            </span>
            <span className="text-[11px] opacity-60 mt-1">اضغط للتسبيح</span>
          </button>
        </div>

        {/* Total Today & Reset */}
        <div className="flex items-center justify-between text-xs px-2 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
          <span className="opacity-70 font-semibold">
            المجموع اليوم: {totalToday.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)])} تسبيحة
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-red-500 transition-all cursor-pointer"
            title="تصفير الدورة الحالية"
          >
            <RotateCcw size={13} /> تصفير
          </button>
        </div>
      </div>
    </div>
  );
}
