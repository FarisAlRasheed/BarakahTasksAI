"use client";

import React from "react";

export default function BackgroundElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {/* شمس في وضع النهار (تختفي في وضع الليل) */}
      <div 
        className="absolute top-10 right-10 md:top-20 md:right-20 opacity-20 dark:opacity-0 transition-opacity duration-500 animate-float block dark:hidden"
        style={{ color: "var(--gold)" }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* هلال رمضان في وضع الليل (يختفي في وضع النهار) */}
      <div 
        className="absolute top-10 left-10 md:top-20 md:left-20 opacity-0 dark:opacity-10 transition-opacity duration-500 animate-float hidden dark:block"
        style={{ color: "var(--gold)" }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* مساجد في المنتصف السفلي */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-15 dark:opacity-10 transition-opacity duration-500 w-[600px] max-w-full flex justify-center"
        style={{ color: "var(--ink-soft)" }}
      >
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <rect x="50" y="100" width="400" height="50" />
          <path d="M 180 100 Q 250 10 320 100 Z" />
          <path d="M 80 100 Q 120 50 160 100 Z" />
          <path d="M 340 100 Q 380 50 420 100 Z" />
          <rect x="60" y="30" width="10" height="70" />
          <polygon points="58,30 65,10 72,30" />
          <rect x="430" y="30" width="10" height="70" />
          <polygon points="428,30 435,10 442,30" />
        </svg>
      </div>

      {/* نخلة في الزاوية السفلية اليمنى */}
      <div 
        className="absolute bottom-0 right-[-20px] md:right-10 opacity-15 dark:opacity-10 transition-opacity duration-500 animate-sway"
        style={{ color: "var(--ink-soft)" }}
      >
        <svg width="150" height="200" viewBox="0 0 100 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 150 Q55 100 48 50 L52 50 Q65 100 55 150 Z" />
          <path d="M50 50 Q80 20 90 60 Q70 40 50 50 Z" />
          <path d="M50 50 Q90 5 70 0 Q60 20 50 50 Z" />
          <path d="M50 50 Q10 20 10 60 Q30 40 50 50 Z" />
          <path d="M50 50 Q10 5 30 0 Q40 20 50 50 Z" />
          <path d="M50 50 Q50 -10 60 -10 Q55 10 50 50 Z" />
          <path d="M50 50 Q50 -10 40 -10 Q45 10 50 50 Z" />
        </svg>
      </div>

      {/* نخلة في الزاوية السفلية اليسرى (معكوسة) */}
      <div 
        className="absolute bottom-0 left-[-20px] md:left-10 opacity-15 dark:opacity-10 transition-opacity duration-500 animate-sway transform scale-x-[-1]"
        style={{ color: "var(--ink-soft)", animationDelay: "1s" }}
      >
        <svg width="120" height="160" viewBox="0 0 100 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 150 Q55 100 48 50 L52 50 Q65 100 55 150 Z" />
          <path d="M50 50 Q80 20 90 60 Q70 40 50 50 Z" />
          <path d="M50 50 Q90 5 70 0 Q60 20 50 50 Z" />
          <path d="M50 50 Q10 20 10 60 Q30 40 50 50 Z" />
          <path d="M50 50 Q10 5 30 0 Q40 20 50 50 Z" />
          <path d="M50 50 Q50 -10 60 -10 Q55 10 50 50 Z" />
          <path d="M50 50 Q50 -10 40 -10 Q45 10 50 50 Z" />
        </svg>
      </div>
    </div>
  );
}
