import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto border-t transition-colors duration-300" style={{ borderColor: "var(--line)", background: "var(--card)" }}>
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-bold text-center" style={{ color: "var(--ink)" }}>
          تم تطوير المشروع بشغف بواسطة
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-6">
          {/* فارس الرشيد */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>فارس بن تركي الرشيد</span>
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/FarisAlRasheed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 hover:-translate-y-1 transition-all duration-200"
                style={{ color: "var(--ink-soft)" }}
                aria-label="حساب جيت هاب لفارس"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.38 6.52-1.6 6.52-7.03a5.36 5.36 0 0 0-1.5-3.87 5.2 5.2 0 0 0-.15-3.8s-1.2-.38-3.9 1.45a13.3 13.3 0 0 0-7 0C5.1 3.32 3.9 3.7 3.9 3.7a5.2 5.2 0 0 0-.15 3.8A5.36 5.36 0 0 0 2.25 11c0 5.43 3.34 6.65 6.52 7.03a4.8 4.8 0 0 0-1 3.03V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 hover:-translate-y-1 transition-all duration-200"
                style={{ color: "var(--ink-soft)" }}
                aria-label="حساب لينكد إن لفارس"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* فاصل */}
          <div className="hidden sm:block w-px h-8 opacity-50" style={{ background: "var(--line)" }}></div>

          {/* أسامة السحيباني */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>أسامة بن علي السحيباني</span>
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/OsamahAlsuhaibani" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 hover:-translate-y-1 transition-all duration-200"
                style={{ color: "var(--ink-soft)" }}
                aria-label="حساب جيت هاب لأسامة"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.38 6.52-1.6 6.52-7.03a5.36 5.36 0 0 0-1.5-3.87 5.2 5.2 0 0 0-.15-3.8s-1.2-.38-3.9 1.45a13.3 13.3 0 0 0-7 0C5.1 3.32 3.9 3.7 3.9 3.7a5.2 5.2 0 0 0-.15 3.8A5.36 5.36 0 0 0 2.25 11c0 5.43 3.34 6.65 6.52 7.03a4.8 4.8 0 0 0-1 3.03V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 hover:-translate-y-1 transition-all duration-200"
                style={{ color: "var(--ink-soft)" }}
                aria-label="حساب لينكد إن لأسامة"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* فاصل */}
          <div className="hidden sm:block w-px h-8 opacity-50" style={{ background: "var(--line)" }}></div>

          {/* نواف */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>نواف بن فيصل الضفيان</span>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/SKYPRG"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 hover:-translate-y-1 transition-all duration-200"
                style={{ color: "var(--ink-soft)" }}
                aria-label="حساب جيت هاب لنواف"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.38 6.52-1.6 6.52-7.03a5.36 5.36 0 0 0-1.5-3.87 5.2 5.2 0 0 0-.15-3.8s-1.2-.38-3.9 1.45a13.3 13.3 0 0 0-7 0C5.1 3.32 3.9 3.7 3.9 3.7a5.2 5.2 0 0 0-.15 3.8A5.36 5.36 0 0 0 2.25 11c0 5.43 3.34 6.65 6.52 7.03a4.8 4.8 0 0 0-1 3.03V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 hover:-translate-y-1 transition-all duration-200"
                style={{ color: "var(--ink-soft)" }}
                aria-label="حساب لينكد إن لنواف"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
