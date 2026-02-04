import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const VISITOR_KEY = "stats:visitors";

export async function GET() {
  if (!redis) {
    return Response.json({ count: 0 });
  }

  try {
    const count = await redis.get(VISITOR_KEY) || 0;
    return Response.json({ count: Number(count) });
  } catch (e) {
    console.error("Error getting visitors:", e);
    return Response.json({ count: 0 });
  }
}

export async function POST() {
  if (!redis) {
    return Response.json({ count: 0 });
  }

  try {
    const count = await redis.incr(VISITOR_KEY);
    return Response.json({ count });
  } catch (e) {
    console.error("Error incrementing visitors:", e);
    return Response.json({ count: 0 });
  }
}
