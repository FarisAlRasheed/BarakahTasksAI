"use client";

import React from "react";

interface BackgroundElementsProps {
  cityEn: string;
}

export default function BackgroundElements({ cityEn }: BackgroundElementsProps) {
  // SVG Definitions
  let MosqueSVG;

  switch (cityEn) {
    case "Makkah":
      // Makkah (Al-Masjid Al-Haram / Kaaba)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Kaaba */}
          <rect x="215" y="50" width="70" height="60" />
          <rect x="215" y="65" width="70" height="5" style={{ color: "var(--gold)" }} />
          {/* Minarets */}
          <rect x="150" y="10" width="10" height="100" />
          <polygon points="146,10 155,-5 164,10" />
          <rect x="340" y="10" width="10" height="100" />
          <polygon points="336,10 345,-5 354,10" />
          {/* Corridors */}
          <path d="M 170 110 L 170 80 Q 190 60 210 80 L 210 110 Z" />
          <path d="M 290 110 L 290 80 Q 310 60 330 80 L 330 110 Z" />
        </svg>
      );
      break;

    case "Madinah":
      // Madinah (Al-Masjid an-Nabawi / Green Dome)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Prophet's Dome */}
          <path d="M 210 110 L 210 60 Q 250 0 290 60 L 290 110 Z" style={{ color: "var(--gold)", opacity: 0.8 }} />
          {/* Secondary Domes */}
          <path d="M 130 110 L 130 90 Q 160 60 190 90 L 190 110 Z" />
          <path d="M 310 110 L 310 90 Q 340 60 370 90 L 370 110 Z" />
          {/* Minarets */}
          <rect x="100" y="10" width="12" height="100" />
          <polygon points="96,10 106,-5 116,10" />
          <rect x="388" y="10" width="12" height="100" />
          <polygon points="384,10 394,-5 404,10" />
        </svg>
      );
      break;

    case "Riyadh":
      // Riyadh (Masmak Fortress & Faisaliyah)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Faisaliyah background silhouette */}
          <path d="M 235 110 L 235 30 L 250 5 L 265 30 L 265 110 Z" style={{ opacity: 0.4 }} />
          {/* Masmak Fortress */}
          <path d="M 160 110 L 160 60 L 340 60 L 340 110 Z" />
          <rect x="145" y="40" width="25" height="70" rx="3" />
          <rect x="330" y="40" width="25" height="70" rx="3" />
          {/* Fortress Door */}
          <path d="M 240 110 L 240 85 A 10 10 0 0 1 260 85 L 260 110 Z" style={{ color: "var(--card)" }} />
          {/* Crenellations */}
          <path d="M 170 60 L 175 50 L 180 60 M 190 60 L 195 50 L 200 60 M 210 60 L 215 50 L 220 60 M 280 60 L 285 50 L 290 60 M 300 60 L 305 50 L 310 60 M 320 60 L 325 50 L 330 60" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      );
      break;

    case "Jeddah":
      // Jeddah (Al Rahma Floating Mosque)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Water waves */}
          <path d="M 60 120 Q 80 110 100 120 T 140 120 T 180 120 T 220 120 T 260 120 T 300 120 T 340 120 T 380 120 T 420 120" fill="none" stroke="var(--card)" strokeWidth="2" opacity="0.3" />
          {/* Floating Mosque Base */}
          <path d="M 180 110 L 180 90 L 320 90 L 320 110 Z" />
          {/* Central Dome */}
          <path d="M 210 90 A 40 40 0 0 1 290 90 Z" />
          {/* Small Minaret */}
          <rect x="330" y="20" width="8" height="90" />
          <polygon points="328,20 334,5 340,20" />
        </svg>
      );
      break;

    case "Dammam":
    case "Khobar":
    case "Dhahran":
      // Eastern Province (Ithra Center)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Ithra Main Structure */}
          <path d="M 250 20 C 330 20, 360 60, 360 110 L 160 110 C 160 60, 170 20, 250 20 Z" />
          {/* Secondary Structure */}
          <path d="M 340 60 C 390 60, 410 85, 410 110 L 270 110 C 270 85, 290 60, 340 60 Z" style={{ opacity: 0.8 }} />
          {/* Small structure */}
          <path d="M 140 80 C 170 80, 180 95, 180 110 L 100 110 C 100 95, 110 80, 140 80 Z" style={{ opacity: 0.6 }} />
        </svg>
      );
      break;

    case "Abha":
      // Abha (Traditional Asiri Architecture)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Mountainous base */}
          <path d="M 120 110 Q 250 90 380 110 Z" style={{ opacity: 0.4 }} />
          {/* Layered Houses */}
          <rect x="230" y="50" width="40" height="60" />
          <rect x="180" y="70" width="45" height="40" />
          <rect x="275" y="60" width="45" height="50" />
          {/* White borders / Al-Qatt Al-Asiri simplified representation */}
          <rect x="235" y="55" width="30" height="5" style={{ color: "var(--card)" }} />
          <rect x="185" y="75" width="35" height="5" style={{ color: "var(--card)" }} />
          <rect x="280" y="65" width="35" height="5" style={{ color: "var(--card)" }} />
        </svg>
      );
      break;

    case "Tabuk":
      // Tabuk Castle
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Hill */}
          <path d="M 150 110 Q 250 70 350 110 Z" style={{ opacity: 0.5 }} />
          {/* Fort Base */}
          <rect x="210" y="50" width="80" height="40" />
          {/* Fort Towers */}
          <rect x="200" y="40" width="20" height="30" />
          <rect x="280" y="40" width="20" height="30" />
          {/* Small door */}
          <path d="M 245 90 A 5 5 0 0 1 255 90 L 255 110 L 245 110 Z" style={{ color: "var(--card)" }} />
        </svg>
      );
      break;

    case "Hail":
      // A'arif Fort on hilltop
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Mountain */}
          <path d="M 100 110 L 250 30 L 400 110 Z" style={{ opacity: 0.3 }} />
          {/* Fort on top */}
          <rect x="220" y="45" width="60" height="35" />
          <rect x="210" y="35" width="15" height="45" />
          <rect x="275" y="35" width="15" height="45" />
          {/* Crenellations */}
          <path d="M 225 45 L 228 38 L 231 45 M 240 45 L 243 38 L 246 45 M 255 45 L 258 38 L 261 45 M 265 45 L 268 38 L 271 45" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      );
      break;

    case "Taif":
      // Shubra Palace with gardens
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Palace Base */}
          <rect x="175" y="60" width="150" height="50" />
          {/* Palace Upper Floor */}
          <rect x="190" y="40" width="120" height="25" />
          {/* Windows */}
          <rect x="205" y="70" width="12" height="15" rx="3" style={{ color: "var(--card)" }} />
          <rect x="235" y="70" width="12" height="15" rx="3" style={{ color: "var(--card)" }} />
          <rect x="265" y="70" width="12" height="15" rx="3" style={{ color: "var(--card)" }} />
          <rect x="295" y="70" width="12" height="15" rx="3" style={{ color: "var(--card)" }} />
          {/* Rose Gardens */}
          <circle cx="140" cy="100" r="10" style={{ opacity: 0.4 }} />
          <circle cx="120" cy="105" r="8" style={{ opacity: 0.3 }} />
          <circle cx="360" cy="100" r="10" style={{ opacity: 0.4 }} />
          <circle cx="380" cy="105" r="8" style={{ opacity: 0.3 }} />
          {/* Door */}
          <path d="M 243 110 L 243 95 A 7 7 0 0 1 257 95 L 257 110 Z" style={{ color: "var(--card)" }} />
        </svg>
      );
      break;

    case "Buraydah":
      // Unaizah Water Tower + palm groves (Qassim region)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Water Tower */}
          <rect x="238" y="20" width="24" height="90" />
          <ellipse cx="250" cy="25" rx="22" ry="12" />
          {/* Palm Grove Left */}
          <path d="M 140 110 L 140 70 L 143 70 L 143 110 Z" />
          <path d="M 141 70 Q 155 55 165 70 Q 155 60 141 70 Z" />
          <path d="M 142 70 Q 128 55 118 70 Q 128 60 142 70 Z" />
          <path d="M 141 70 Q 141 50 148 48 Q 145 58 141 70 Z" />
          {/* Palm Grove Right */}
          <path d="M 350 110 L 350 75 L 353 75 L 353 110 Z" />
          <path d="M 351 75 Q 365 60 375 75 Q 365 65 351 75 Z" />
          <path d="M 352 75 Q 338 60 328 75 Q 338 65 352 75 Z" />
          <path d="M 351 75 Q 351 55 358 53 Q 355 63 351 75 Z" />
          {/* Farm field pattern */}
          <rect x="160" y="100" width="80" height="10" style={{ opacity: 0.3 }} rx="2" />
          <rect x="270" y="100" width="70" height="10" style={{ opacity: 0.3 }} rx="2" />
        </svg>
      );
      break;

    case "Najran":
      // Emara Palace (قصر الإمارة التاريخي)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Palace Base */}
          <rect x="170" y="50" width="160" height="60" />
          {/* Corner Towers */}
          <rect x="155" y="25" width="30" height="85" />
          <rect x="315" y="25" width="30" height="85" />
          {/* Central Tower */}
          <rect x="235" y="15" width="30" height="95" />
          {/* Decorative Bands */}
          <rect x="170" y="70" width="160" height="4" style={{ color: "var(--card)" }} />
          <rect x="170" y="85" width="160" height="4" style={{ color: "var(--card)" }} />
          {/* Windows */}
          <rect x="195" y="58" width="10" height="10" style={{ color: "var(--card)" }} />
          <rect x="295" y="58" width="10" height="10" style={{ color: "var(--card)" }} />
          {/* Door */}
          <path d="M 243 110 L 243 95 A 7 7 0 0 1 257 95 L 257 110 Z" style={{ color: "var(--card)" }} />
        </svg>
      );
      break;

    case "Jazan":
      // Farasan Islands Bridge + coastal scene
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="120" width="400" height="30" />
          {/* Water */}
          <path d="M 50 120 Q 80 112 110 120 T 170 120 T 230 120 T 290 120 T 350 120 T 410 120 L 450 120 L 450 150 L 50 150 Z" style={{ opacity: 0.3 }} />
          {/* Bridge */}
          <path d="M 100 90 Q 160 50 250 50 Q 340 50 400 90" fill="none" stroke="currentColor" strokeWidth="5" />
          {/* Bridge pillars */}
          <rect x="160" y="55" width="6" height="65" style={{ opacity: 0.6 }} />
          <rect x="250" y="50" width="6" height="70" style={{ opacity: 0.6 }} />
          <rect x="335" y="58" width="6" height="62" style={{ opacity: 0.6 }} />
          {/* Island left */}
          <path d="M 60 120 Q 80 100 120 120 Z" style={{ opacity: 0.5 }} />
          {/* Island right */}
          <path d="M 380 120 Q 410 95 450 120 Z" style={{ opacity: 0.5 }} />
          {/* Small Mosque on right island */}
          <path d="M 405 110 A 10 10 0 0 1 425 110 Z" style={{ opacity: 0.6 }} />
          <rect x="430" y="95" width="4" height="25" style={{ opacity: 0.5 }} />
        </svg>
      );
      break;

    case "Yanbu":
      // Yanbu Port / Industrial City + sea
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="120" width="400" height="30" />
          {/* Water waves */}
          <path d="M 50 125 Q 80 115 110 125 T 170 125 T 230 125 T 290 125 T 350 125 T 410 125" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }} />
          {/* Lighthouse */}
          <rect x="120" y="40" width="16" height="80" />
          <path d="M 115 45 L 128 25 L 141 45 Z" />
          <ellipse cx="128" cy="50" rx="12" ry="4" style={{ color: "var(--card)" }} />
          {/* Cargo Ship */}
          <path d="M 230 100 L 350 100 L 340 120 L 220 120 Z" />
          <rect x="260" y="75" width="20" height="25" />
          <rect x="290" y="80" width="20" height="20" />
          <rect x="320" y="85" width="15" height="15" />
          {/* Crane */}
          <rect x="380" y="50" width="6" height="70" />
          <path d="M 360 55 L 386 50 L 386 55 L 360 60 Z" style={{ opacity: 0.7 }} />
          {/* Old town buildings */}
          <rect x="170" y="90" width="30" height="30" style={{ opacity: 0.5 }} />
          <rect x="185" y="85" width="20" height="35" style={{ opacity: 0.4 }} />
        </svg>
      );
      break;

    default:
      // Generic Islamic Heritage
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          <path d="M 180 110 L 180 80 L 210 60 L 240 80 L 240 110 Z" />
          <path d="M 250 110 L 250 60 L 290 30 L 330 60 L 330 110 Z" style={{ opacity: 0.8 }} />
          <path d="M 340 110 L 340 90 L 360 70 L 380 90 L 380 110 Z" />
          <path d="M 260 60 A 15 15 0 0 1 290 60 Z" />
          <rect x="280" y="80" width="10" height="15" rx="3" style={{ color: "var(--card)" }} />
          <rect x="200" y="90" width="10" height="10" style={{ color: "var(--card)" }} />
        </svg>
      );
      break;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

      {/* ═══════ السماء: شمس في النهار / هلال + نجوم في الليل ═══════ */}

      {/* ☀️ شمس — تظهر فقط في النهار */}
      <div 
        className="absolute top-8 left-8 md:top-14 md:left-14 transition-all duration-700 block dark:hidden"
        style={{ color: "var(--gold)" }}
      >
        {/* Glow effect behind sun */}
        <div className="absolute inset-0 animate-sunGlow" style={{ width: 90, height: 90 }} />
        <div className="animate-slowSpin" style={{ opacity: 0.55 }}>
          <svg width="90" height="90" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="20.5" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="3.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="20.5" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 🌙 هلال — يظهر فقط في الليل (نفس الموقع) */}
      <div 
        className="absolute top-8 left-8 md:top-14 md:left-14 transition-all duration-700 hidden dark:block"
        style={{ color: "var(--gold)", opacity: 0.5 }}
      >
        <div className="animate-float">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
      </div>

      {/* ⭐ نجوم وشهاب متألق — في الليل */}
      <div className="hidden dark:block">
        <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "0s" }} />
        <div className="absolute top-[8%] left-[50%] w-1 h-1 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "0.8s" }} />
        <div className="absolute top-[15%] left-[75%] w-1.5 h-1.5 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "1.5s" }} />
        <div className="absolute top-[5%] left-[65%] w-1 h-1 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "2.2s" }} />
        <div className="absolute top-[20%] left-[35%] w-1 h-1 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "0.5s" }} />
        <div className="absolute top-[12%] left-[85%] w-1.5 h-1.5 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "1.8s" }} />
        <div className="absolute top-[25%] left-[10%] w-1 h-1 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "2.5s" }} />
        <div className="absolute top-[18%] left-[92%] w-1 h-1 rounded-full animate-twinkle" style={{ background: "var(--gold)", animationDelay: "1.2s" }} />

        {/* 🌠 شهاب متحرك بعيد في الليل */}
        <div 
          className="absolute top-[8%] right-[8%] animate-shootingStar h-[2.5px] bg-gradient-to-l from-transparent via-[var(--gold)] to-white rounded-full shadow-[0_0_12px_var(--gold)] pointer-events-none"
        />
      </div>

      {/* 🦅 سرب طيور مهاجرة في النهار */}
      <div className="block dark:hidden opacity-70 pointer-events-none z-10">
        <div className="absolute top-[15%] animate-fly flex items-center gap-5" style={{ color: "var(--ink)" }}>
          <svg width="32" height="16" viewBox="0 0 24 12" fill="currentColor">
            <path d="M 0 6 Q 6 0 12 6 Q 18 0 24 6 Q 18 3 12 8 Q 6 3 0 6 Z" />
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="currentColor" className="-mt-4">
            <path d="M 0 6 Q 6 0 12 6 Q 18 0 24 6 Q 18 3 12 8 Q 6 3 0 6 Z" />
          </svg>
          <svg width="20" height="10" viewBox="0 0 24 12" fill="currentColor" className="mt-3">
            <path d="M 0 6 Q 6 0 12 6 Q 18 0 24 6 Q 18 3 12 8 Q 6 3 0 6 Z" />
          </svg>
        </div>
      </div>

      {/* 🍃 خطوط النسيم الخفيف العابر */}
      <div className="absolute bottom-[20%] w-full flex justify-between px-10 pointer-events-none opacity-15" style={{ color: "var(--ink-soft)" }}>
        <svg width="140" height="20" viewBox="0 0 140 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-breeze">
          <path d="M 10 10 Q 40 2 80 12 T 130 10" strokeDasharray="4 2" />
        </svg>
        <svg width="180" height="20" viewBox="0 0 180 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-breeze hidden md:block" style={{ animationDelay: "3s" }}>
          <path d="M 10 10 Q 50 18 100 8 T 170 10" />
        </svg>
      </div>

      {/* ═══════ غيوم متحركة (نهار أكثر، ليل أقل) ═══════ */}
      <div 
        className="absolute top-16 w-full opacity-12 dark:opacity-5 transition-opacity duration-500 animate-clouds flex justify-around"
        style={{ color: "var(--ink-soft)" }}
      >
        <svg width="160" height="60" viewBox="0 0 100 40" fill="currentColor">
          <path d="M 20 30 Q 10 30 10 20 Q 10 10 20 10 Q 25 0 40 5 Q 50 -5 60 5 Q 75 0 80 15 Q 90 15 90 25 Q 90 30 80 30 Z" />
        </svg>
        <svg width="130" height="50" viewBox="0 0 100 40" fill="currentColor" className="mt-8">
          <path d="M 20 30 Q 10 30 10 20 Q 10 10 20 10 Q 25 0 40 5 Q 50 -5 60 5 Q 75 0 80 15 Q 90 15 90 25 Q 90 30 80 30 Z" />
        </svg>
        <svg width="100" height="45" viewBox="0 0 100 40" fill="currentColor" className="mt-14 hidden md:block">
          <path d="M 20 30 Q 10 30 10 20 Q 10 10 20 10 Q 25 0 40 5 Q 50 -5 60 5 Q 75 0 80 15 Q 90 15 90 25 Q 90 30 80 30 Z" />
        </svg>
      </div>

      {/* طبقة غيوم ثانية أبطأ */}
      <div 
        className="absolute top-32 w-full opacity-8 dark:opacity-3 transition-opacity duration-500 flex justify-around"
        style={{ color: "var(--ink-soft)", animation: "cloudsMove 60s ease-in-out infinite reverse" }}
      >
        <svg width="120" height="45" viewBox="0 0 100 40" fill="currentColor" className="mt-4">
          <path d="M 20 30 Q 10 30 10 20 Q 10 10 20 10 Q 25 0 40 5 Q 50 -5 60 5 Q 75 0 80 15 Q 90 15 90 25 Q 90 30 80 30 Z" />
        </svg>
        <svg width="90" height="40" viewBox="0 0 100 40" fill="currentColor" className="mt-8 hidden md:block">
          <path d="M 20 30 Q 10 30 10 20 Q 10 10 20 10 Q 25 0 40 5 Q 50 -5 60 5 Q 75 0 80 15 Q 90 15 90 25 Q 90 30 80 30 Z" />
        </svg>
      </div>

      {/* ═══════ المعالم (تتغير حسب المدينة) ═══════ */}
      <div 
        key={cityEn}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-35 dark:opacity-25 transition-all duration-700 w-[600px] max-w-full flex justify-center pointer-events-none"
        style={{ color: "var(--ink-soft)" }}
      >
        {MosqueSVG}
      </div>

      {/* ═══════ نخيل ═══════ */}
      {/* نخلة يمين */}
      <div 
        className="absolute bottom-0 right-[-20px] md:right-10 opacity-25 dark:opacity-15 transition-opacity duration-500 animate-sway"
        style={{ color: "var(--ink-soft)" }}
      >
        <svg width="150" height="200" viewBox="0 0 100 150" fill="currentColor">
          <path d="M45 150 Q55 100 48 50 L52 50 Q65 100 55 150 Z" />
          <path d="M50 50 Q80 20 90 60 Q70 40 50 50 Z" />
          <path d="M50 50 Q90 5 70 0 Q60 20 50 50 Z" />
          <path d="M50 50 Q10 20 10 60 Q30 40 50 50 Z" />
          <path d="M50 50 Q10 5 30 0 Q40 20 50 50 Z" />
          <path d="M50 50 Q50 -10 60 -10 Q55 10 50 50 Z" />
          <path d="M50 50 Q50 -10 40 -10 Q45 10 50 50 Z" />
        </svg>
      </div>

      {/* نخلة يسار */}
      <div 
        className="absolute bottom-0 left-[-20px] md:left-10 opacity-25 dark:opacity-15 transition-opacity duration-500 animate-sway transform scale-x-[-1]"
        style={{ color: "var(--ink-soft)", animationDelay: "1s" }}
      >
        <svg width="120" height="160" viewBox="0 0 100 150" fill="currentColor">
          <path d="M45 150 Q55 100 48 50 L52 50 Q65 100 55 150 Z" />
          <path d="M50 50 Q80 20 90 60 Q70 40 50 50 Z" />
          <path d="M50 50 Q90 5 70 0 Q60 20 50 50 Z" />
          <path d="M50 50 Q10 20 10 60 Q30 40 50 50 Z" />
          <path d="M50 50 Q10 5 30 0 Q40 20 50 50 Z" />
          <path d="M50 50 Q50 -10 60 -10 Q55 10 50 50 Z" />
          <path d="M50 50 Q50 -10 40 -10 Q45 10 50 50 Z" />
        </svg>
      </div>

      {/* ═══════ جزيئات عائمة (نهار فقط) ═══════ */}
      <div className="block dark:hidden">
        <div className="absolute top-[30%] right-[15%] w-2 h-2 rounded-full opacity-15" style={{ background: "var(--gold)", animation: "driftUp 6s ease-in-out infinite", animationDelay: "0s" }} />
        <div className="absolute top-[50%] right-[40%] w-1.5 h-1.5 rounded-full opacity-10" style={{ background: "var(--gold)", animation: "driftUp 8s ease-in-out infinite", animationDelay: "2s" }} />
        <div className="absolute top-[45%] right-[70%] w-2 h-2 rounded-full opacity-15" style={{ background: "var(--gold)", animation: "driftUp 7s ease-in-out infinite", animationDelay: "4s" }} />
      </div>
    </div>
  );
}
