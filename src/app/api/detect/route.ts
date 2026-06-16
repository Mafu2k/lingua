import { NextResponse } from "next/server";
import { env } from "@/core/config/env";
import { FrancLanguageDetector } from "@/features/translation/infrastructure/franc.language-detector";
import { clientKey, rateLimit } from "@/shared/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const detector = new FrancLanguageDetector();

export async function POST(request: Request): Promise<NextResponse> {
  const limit = rateLimit(`detect:${clientKey(request)}`, env.rateLimitMax, env.rateLimitWindowMs);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: { text?: unknown };
  try {
    body = (await request.json()) as { text?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.text !== "string") {
    return NextResponse.json({ error: "`text` must be a string." }, { status: 400 });
  }
  if (body.text.length > env.maxTextLength) {
    return NextResponse.json({ error: "`text` is too long." }, { status: 413 });
  }

  return NextResponse.json({ language: detector.detect(body.text) });
}
