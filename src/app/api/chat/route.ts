import { NextRequest } from "next/server";
import { mergeTaskLists, type ChatTask } from "@/lib/chat";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, prevTasks = [], history = [] } = body;

    if (!message || typeof message !== "string") {
      return Response.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const formattedHistory = history
      .map((msg: { role: string; text: string }) => `${msg.role === 'user' ? 'الطالب' : 'المساعد'}: ${msg.text}`)
      .join('\n');

    const prompt = `أنت مساعد ذكي لتتبع مهام الطالب.
مهمتك هي قراءة رسالة الطالب وتحديث قائمة مهامه الحالية بناءً عليها (إضافة، تعديل، أو حذف).
يجب عليك دائماً إرجاع كامل قائمة المهام، وعدم نسيان المهام القديمة.
لا تقم بإنشاء جدول زمني ولا تضع أوقاتاً من عندك.

سجل المحادثة السابق (للسياق):
${formattedHistory || "لا يوجد سجل سابق"}

المهام الحالية المسجلة قبل التعديل:
${JSON.stringify(prevTasks)}

رسالة الطالب الحالية:
"${message}"

المطلوب:
أعد كائن JSON فقط يحتوي على مفتاحين:
1. "reply": رسالة باللغة العربية ترد فيها على الطالب، وتعرض له مسودة كامل المهام الحالية كنقاط واضحة.
2. "tasks": مصفوفة (Array) تحتوي على كامل قائمة المهام (يجب أن تشمل المهام السابقة التي لم تُحذف، مع تطبيق التعديلات والإضافات الجديدة). كل مهمة كائن يحتوي على "label" إلزامي، و "fixedTime" أو "urgency" اختياري.

أعد استجابة JSON صحيحة فقط بدون أي نصوص أخرى أو أسوار الكود (\`\`\`).`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          response_format: { type: "json_object" }
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

    let parsed;
    try {
      parsed = JSON.parse(content.trim());
    } catch {
      console.error("Failed to parse AI chat response:", content);
      throw new Error("فشل في تحليل استجابة الذكاء الاصطناعي");
    }

    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    
    // Merge to preserve stable IDs
    const updatedTasks = mergeTaskLists(prevTasks, rawTasks);

    return Response.json({
      reply: parsed.reply || "تم تحديث المهام.",
      tasks: updatedTasks,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
      },
      { status: 500 }
    );
  }
}
