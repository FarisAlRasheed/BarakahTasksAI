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

import type { ChatTask } from "@/lib/chat";

// ─── Input Validation ────────────────────────────────────────────────

interface ScheduleRequest {
  city: string;
  tasks: ChatTask[];
}

function validateInput(
  body: unknown
): { valid: true; data: ScheduleRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const { city, tasks } = body as Record<string, unknown>;

  if (typeof city !== "string" || !city.trim()) {
    return { valid: false, error: "المدينة مطلوبة" };
  }

  if (!findCity(city.trim())) {
    return { valid: false, error: "المدينة غير مدعومة" };
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { valid: false, error: "يرجى تقديم المهام المراد جدولتها" };
  }

  return {
    valid: true,
    data: { city: city.trim(), tasks: tasks as ChatTask[] },
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

// ─── Task-count sanity check ──────────────────────────────────────────
// Used to detect obvious drops/hallucinations from the AI response — not a
// hard requirement, just a warning signal in the logs.

function estimateTaskCount(tasks: ChatTask[]): number {
  return Math.max(tasks.length, 1);
}

// ─── Groq AI Schedule Generation ─────────────────────────────────────

async function generateAISchedule(
  tasks: ChatTask[],
  prayerBlocks: TimeBlock[]
): Promise<TimeBlock[]> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prayerInfo = prayerBlocks
    .map((p) => `${p.label}: ${p.startTime} - ${p.endTime}`)
    .join("\n");

  const prompt = `أنت محرك جدولة دقيق، ولست مساعداً محادثاً. مهمتك الوحيدة هي أخذ المهام المسجلة
ووضعها في جدول زمني (JSON)، بدقة تامة وبدون أي إبداع أو إضافات.

═══════════════════════════════════
القاعدة الأهم: الدقة في الجدولة
═══════════════════════════════════
- قم بجدولة المهام المسجلة أدناه فقط. لا تخترع أي مهام أخرى.
- يجب أن يتم جدولة كل مهمة مرسلة إليك دون استثناء.
- عدد عناصر "study" و "sleep" في الناتج يجب أن يساوي بالضبط عدد المهام المرسلة إليك.
- لا تضف مهام "راحة" أو "وجبة" من عندك كعناصر مستقلة.

═══════════════════════════════════
معالجة المهام ذات الوقت الثابت
═══════════════════════════════════
إذا كانت المهمة تحتوي على وقت ثابت أو ذكر الطالب لها وقتاً محدداً:
- التزم بكامل تلك المدة الزمنية، دون تقصير أو تحريك.
- إذا وقع وقت أذان داخل تلك المدة، قسّم المهمة إلى جزأين حول فاصل الصلاة
  بدل حذفها أو تحريكها (بدون حذف وقت الصلاة نفسه من الجدول).

═══════════════════════════════════
معالجة المهام بدون وقت محدد
═══════════════════════════════════
1. رتّبها حسب الإلحاح (مفتاح urgency): المهام الأكثر إلحاحاً تُوضع أولاً بوقت أطول نسبياً (60-120 دقيقة).
2. المهام الأقل إلحاحاً تُوضع لاحقاً بمدة أقصر (25-60 دقيقة).
3. إذا لم يتسع اليوم لكل المهام، أعطِ الأولوية للمهام الملحة، وضع الباقي
   في آخر الجدول.

═══════════════════════════════════
قواعد عامة
═══════════════════════════════════
1. اترك فاصل 30 دقيقة بعد كل أذان قبل بدء أي مهمة جديدة، إلا في حالة المهام
   ذات الوقت الثابت الموضحة أعلاه.
2. استخدم تنسيق 24 ساعة دائماً (مثال الصيغة فقط: "14:30").

أوقات الصلاة اليوم:
${prayerInfo}

قائمة المهام المطلوب جدولتها:
${JSON.stringify(tasks)}

═══════════════════════════════════
تنسيق الإخراج
═══════════════════════════════════
أعد النتيجة كـ JSON array فقط، بدون أي نص أو شرح أو أسوار كود قبل أو بعد.
كل عنصر:
- "type": "study" أو "sleep"
- "label": اسم المهمة (استخدم نفس "label" من المصفوفة المرسلة)
- "startTime": "HH:mm"
- "endTime": "HH:mm"
- "sub": سبب مختصر للترتيب (مثل: "أولوية — موعد غداً")

تذكير أخير قبل الإجابة: يجب جدولة جميع المهام المرسلة أعلاه تماماً. أعد JSON array فقط الآن:`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.15,
        max_tokens: 2048,
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
    const validBlocks = blocks.filter(
      (b) =>
        (b.type === "study" || b.type === "sleep") &&
        typeof b.label === "string" &&
        typeof b.startTime === "string" &&
        typeof b.endTime === "string" &&
        /^\d{2}:\d{2}$/.test(b.startTime) &&
        /^\d{2}:\d{2}$/.test(b.endTime)
    );

    // Sanity check: compare estimated task count to what came back.
    // This doesn't block the response, but logs a warning so silent
    // drops/hallucinations are visible during testing instead of hidden.
    const estimatedCount = estimateTaskCount(tasks);
    const studyCount = validBlocks.filter((b) => b.type === "study" || b.type === "sleep").length;
    if (Math.abs(estimatedCount - studyCount) > 0) {
      console.warn(
        `Task count mismatch: estimated ${estimatedCount} tasks in input, ` +
        `got ${studyCount} study/sleep blocks back from AI. Input tasks:`, tasks
      );
    }

    return validBlocks;
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

    const { city, tasks } = validation.data;
    const cityObj = findCity(city)!;

    // 2. Fetch prayer times from Aladhan
    const timings = await fetchPrayerTimes(cityObj.nameEn);
    const prayerBlocks = prayerTimesToBlocks(timings);

    // 3. Generate AI study schedule
    const aiBlocks = await generateAISchedule(tasks, prayerBlocks);

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