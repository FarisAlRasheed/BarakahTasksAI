/**
 * API Route: POST /api/schedule
 *
 * Orchestrates the full schedule generation flow:
 * 1. Validates user input (city, taskText)
 * 2. Fetches prayer times from Aladhan API
 * 3. Sends tasks + prayer times to Groq AI for scheduling
 * 4. Merges AI study blocks with prayer blocks using lib/schedule.ts
 * 5. Returns the final sorted timeline
 *
 * SECURITY: The Groq API key is used only here (server-side).
 * It never reaches the browser.
 */

import { NextRequest } from "next/server";
import { findCity } from "@/lib/cities";
import {
  mergeScheduleWithPrayerTimes,
  prayerTimesToBlocks,
  type TimeBlock,
} from "@/lib/schedule";

// ─── Input Validation ────────────────────────────────────────────────

interface ScheduleRequest {
  city: string;
  taskText: string;
}

function validateInput(
  body: unknown
): { valid: true; data: ScheduleRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const { city, taskText } = body as Record<string, unknown>;

  if (typeof city !== "string" || !city.trim()) {
    return { valid: false, error: "المدينة مطلوبة" };
  }

  if (!findCity(city.trim())) {
    return { valid: false, error: "المدينة غير مدعومة" };
  }

  if (typeof taskText !== "string" || !taskText.trim()) {
    return { valid: false, error: "يرجى كتابة مهامك" };
  }

  if (taskText.length > 2000) {
    return {
      valid: false,
      error: "النص طويل جداً (الحد الأقصى ٢٠٠٠ حرف)",
    };
  }

  return {
    valid: true,
    data: { city: city.trim(), taskText: taskText.trim() },
  };
}

// ─── Aladhan Prayer Times ────────────────────────────────────────────

async function fetchPrayerTimes(
  cityNameEn: string
): Promise<Record<string, string>> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const url = new URL("https://api.aladhan.com/v1/timingsByCity");
  url.searchParams.set("city", cityNameEn);
  url.searchParams.set("country", "Saudi Arabia");
  url.searchParams.set("method", "4"); // Umm Al-Qura method
  url.searchParams.set("date", `${dd}-${mm}-${yyyy}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Aladhan API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.timings;
}

// ─── Groq AI Schedule Generation ─────────────────────────────────────

async function generateAISchedule(
  taskText: string,
  prayerBlocks: TimeBlock[]
): Promise<TimeBlock[]> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prayerInfo = prayerBlocks
    .map((p) => `${p.label}: ${p.startTime} - ${p.endTime}`)
    .join("\n");

  const prompt = `أنت مساعد ذكي لتنظيم جدول دراسة الطالب. الطالب كتب مهامه بالعربي وأنت تحتاج ترتبها حول أوقات الصلاة.

مهام الطالب:
${taskText}

أوقات الصلاة اليوم:
${prayerInfo}

القواعد:
1. رتّب المهام في فترات بين أوقات الصلاة
2. اترك فاصل 30 دقيقة بعد كل وقت أذان
3. كل فترة دراسة يجب أن تكون بين 25-120 دقيقة
4. اقترح وقت نوم مناسب في نهاية اليوم
5. استخدم تنسيق 24 ساعة للوقت (مثال: "14:30")

أعد النتيجة كـ JSON array فقط بدون أي نص إضافي. كل عنصر يحتوي:
- "type": "study" أو "sleep"
- "label": اسم المهمة بالعربي
- "startTime": وقت البداية بتنسيق "HH:mm"
- "endTime": وقت النهاية بتنسيق "HH:mm"
- "sub": وصف مختصر بالعربي

مثال للنتيجة:
[
  {"type":"study","label":"مراجعة الرياضيات","startTime":"08:00","endTime":"09:30","sub":"قبل صلاة الظهر"},
  {"type":"sleep","label":"موعد النوم","startTime":"22:00","endTime":"06:00","sub":"للاستيقاظ باكراً"}
]

أعد JSON array فقط:`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        reasoning_effort: "low",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API error:", errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Groq API");
  }

  // Parse the JSON from the AI response
  // The AI might wrap it in ```json ... ``` so we need to extract it
  let jsonStr = content.trim();

  // Remove markdown code block wrappers if present
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  try {
    const blocks: TimeBlock[] = JSON.parse(jsonStr);

    // Validate the structure
    return blocks.filter(
      (b) =>
        (b.type === "study" || b.type === "sleep") &&
        typeof b.label === "string" &&
        typeof b.startTime === "string" &&
        typeof b.endTime === "string" &&
        /^\d{2}:\d{2}$/.test(b.startTime) &&
        /^\d{2}:\d{2}$/.test(b.endTime)
    );
  } catch {
    console.error("Failed to parse AI response:", jsonStr);
    throw new Error("فشل في تحليل استجابة الذكاء الاصطناعي");
  }
}

// ─── Route Handler ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { city, taskText } = validation.data;
    const cityObj = findCity(city)!;

    // 2. Fetch prayer times from Aladhan
    const timings = await fetchPrayerTimes(cityObj.nameEn);
    const prayerBlocks = prayerTimesToBlocks(timings);

    // 3. Generate AI study schedule
    const aiBlocks = await generateAISchedule(taskText, prayerBlocks);

    // 4. Merge AI blocks with prayer blocks (30-min buffer)
    const timeline = mergeScheduleWithPrayerTimes(aiBlocks, prayerBlocks, 30);

    return Response.json({ timeline });
  } catch (error) {
    console.error("Schedule API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ غير متوقع",
      },
      { status: 500 }
    );
  }
}
