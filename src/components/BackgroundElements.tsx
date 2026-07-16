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
    case "Hail":
      // Historic Fortresses (Tabuk Castle / A'arif Fort)
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

    default:
      // Traditional Heritage Village (Generic for remaining cities like Taif, Buraydah, Jazan, Yanbu, Najran)
      MosqueSVG = (
        <svg viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transition-all duration-700">
          <rect x="50" y="110" width="400" height="40" />
          {/* Historic Mosque / Buildings */}
          <path d="M 180 110 L 180 80 L 210 60 L 240 80 L 240 110 Z" />
          <path d="M 250 110 L 250 60 L 290 30 L 330 60 L 330 110 Z" style={{ opacity: 0.8 }} />
          <path d="M 340 110 L 340 90 L 360 70 L 380 90 L 380 110 Z" />
          {/* Domes */}
          <path d="M 260 60 A 15 15 0 0 1 290 60 Z" />
          {/* Windows */}
          <rect x="280" y="80" width="10" height="15" rx="3" style={{ color: "var(--card)" }} />
          <rect x="200" y="90" width="10" height="10" style={{ color: "var(--card)" }} />
        </svg>
      );
      break;
  }

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

      {/* المساجد والمعالم في المنتصف السفلي (تتغير حسب المدينة) */}
      <div 
        key={cityEn} // key يُجبر المكون على إعادة الرسم عند التغيير إن رغبنا بحركة دخول، لكن استخدام transition يكفي عادة
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-15 dark:opacity-10 transition-all duration-700 w-[600px] max-w-full flex justify-center"
        style={{ color: "var(--ink-soft)" }}
      >
        {MosqueSVG}
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
