import Groq from "groq-sdk";
import { Redis } from "@upstash/redis";

// Force Node.js runtime (not Edge) for full API compatibility
export const runtime = "nodejs";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function POST(request: Request) {
  try {
    const { text, targetLang, thoughtId } = await request.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    if (!text || !targetLang) {
      return Response.json({ error: "Missing text or targetLang" }, { status: 400 });
    }

    // Check cache first
    if (redis && thoughtId) {
      const cached = await redis.get(`translation:${thoughtId}:${targetLang}`);
      if (cached) {
        return Response.json({ translation: cached, cached: true });
      }
    }

    // If target is English, return original
    if (targetLang === "en") {
      return Response.json({ translation: text, cached: false });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a translator. Translate the following text to ${targetLang}. Keep the philosophical and poetic tone. Only output the translation, nothing else.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const translation = completion.choices[0]?.message?.content || text;

    // Cache the translation
    if (redis && thoughtId) {
      await redis.set(`translation:${thoughtId}:${targetLang}`, translation, {
        ex: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return Response.json({ translation, cached: false });
  } catch (error) {
    console.error("Translation error:", error);
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}
