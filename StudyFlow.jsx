import { useState, useEffect } from "react";
import { Moon, BookOpen, Bed, Sparkles, Feather } from "lucide-react";

const mockItems = [
  { type: "study", time: "٩:٠٠ ص", label: "دوام", sub: "حتى ٤:٠٠ م" },
  { type: "prayer", time: "١٢:١٥ م", label: "أذان الظهر", sub: "فاصل ٣٠ دقيقة" },
  { type: "study", time: "٤:٣٠ م", label: "مراجعة الرياضيات", sub: "١٠٠ صفحة — بعد الدوام" },
  { type: "prayer", time: "٦:٥٠ م", label: "أذان المغرب", sub: "فاصل ٣٠ دقيقة" },
  { type: "study", time: "٧:٣٠ م", label: "تحضير اختبار القيادة", sub: "استعداد لصباح الغد الساعة ٨" },
  { type: "prayer", time: "٨:٢٠ م", label: "أذان العشاء", sub: "فاصل ٣٠ دقيقة" },
  { type: "sleep", time: "٩:٠٠ م", label: "موعد النوم", sub: "للاستيقاظ باكرا للاختبار" },
];

const cities = ["الرياض", "جدة", "الدمام"];

function iconFor(type) {
  if (type === "prayer") return Moon;
  if (type === "sleep") return Bed;
  return BookOpen;
}

export default function StudyFlow() {
  const [dark, setDark] = useState(false);
  const [city, setCity] = useState(cities[0]);
  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const paper = dark ? "#2A2118" : "#F3E9D2";
  const card = dark ? "#352A1E" : "#EBDFC0";
  const ink = dark ? "#EAD9B5" : "#3B2A1A";
  const inkSoft = dark ? "#B8A582" : "#6B5842";
  const gold = dark ? "#C9A15C" : "#8C6A3F";
  const line = dark ? "#4A3B29" : "#C9B98E";

  return (
    <div
      dir="rtl"
      style={{ background: paper, fontFamily: "'Amiri', serif", color: ink }}
      className="w-full min-h-screen p-6 transition-colors duration-300"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ background: card, borderColor: line, color: inkSoft }}
            className="text-sm px-3 py-2 rounded-md border outline-none"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              aria-label="تبديل الوضع"
              style={{ background: card, borderColor: line, color: ink }}
              className="text-xs px-3 py-1.5 rounded-md border"
            >
              <Moon size={14} />
            </button>
            <span
              style={{ color: gold, fontFamily: "'Aref Ruqaa', serif" }}
              className="text-2xl font-bold"
            >
              سِجل الدراسة
            </span>
          </div>
        </div>

        <div
          style={{ background: card, borderColor: line, color: ink }}
          className="rounded-lg border px-4 py-3 mb-6 flex items-center gap-2"
        >
          <Feather size={16} />
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="اكتب مهامك اليوم كما تحدّث صديقاً..."
            style={{ color: ink }}
            className="flex-1 bg-transparent outline-none text-base placeholder:opacity-60"
          />
          <button
            style={{ background: paper, borderColor: line, color: ink }}
            className="text-xs px-3 py-1.5 rounded-md border flex items-center gap-1"
          >
            رتّب <Sparkles size={13} />
          </button>
        </div>

        <div style={{ color: inkSoft }} className="text-sm mb-2">
          الجدول الزمني — اليوم
        </div>

        <div>
          {mockItems.map((it, i) => {
            const Icon = iconFor(it.type);
            const accent = it.type === "prayer" ? gold : ink;
            return (
              <div
                key={i}
                style={{
                  background: card,
                  borderColor: line,
                  borderStyle: it.type === "prayer" ? "dashed" : "solid",
                  color: ink,
                }}
                className="rounded-lg border px-4 py-3 mb-2 flex items-center gap-3"
              >
                <Icon size={17} color={accent} />
                <div className="flex-1">
                  <div className="text-base font-bold">{it.label}</div>
                  <div style={{ color: inkSoft }} className="text-xs">
                    {it.sub}
                  </div>
                </div>
                <div style={{ color: accent }} className="text-sm font-bold">
                  {it.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
