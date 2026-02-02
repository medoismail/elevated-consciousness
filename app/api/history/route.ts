import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!redis) {
    return Response.json({ thoughts: [], total: 0, message: "Storage not configured" });
  }

  try {
    // Get thought IDs from sorted set (newest first)
    const thoughtIds = await redis.zrange("thoughts:timeline", offset, offset + limit - 1, {
      rev: true,
    });

    if (!thoughtIds || thoughtIds.length === 0) {
      return Response.json({ thoughts: [], total: 0 });
    }

    // Fetch all thoughts
    const thoughts = await Promise.all(
      thoughtIds.map(async (id) => {
        const data = await redis.get(`thought:${id}`);
        if (typeof data === "string") {
          return JSON.parse(data);
        }
        return data;
      })
    );

    // Filter out nulls
    const filteredThoughts = thoughts.filter(Boolean);

    // Get total count
    const total = await redis.zcard("thoughts:timeline");

    return Response.json({
      thoughts: filteredThoughts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
