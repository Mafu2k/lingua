import { NextResponse } from "next/server";
import { env } from "@/core/config/env";
import { isLanguageCode } from "@/core/domain/language";
import { TranslationError } from "@/core/domain/translation";
import { getTranslateUseCase } from "@/features/translation/infrastructure/translation.factory";
import { clientKey, rateLimit } from "@/shared/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

interface TranslateBody {
  text?: unknown;
  source?: unknown;
  target?: unknown;
}

const ERROR_STATUS: Record<TranslationError["code"], number> = {
  EMPTY_INPUT: 400,
  UNSUPPORTED: 422,
  PROVIDER_ERROR: 502
};

export async function POST(request: Request): Promise<NextResponse> {
  const limit = rateLimit(`translate:${clientKey(request)}`, env.rateLimitMax, env.rateLimitWindowMs);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: TranslateBody;
  try {
    body = (await request.json()) as TranslateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text, source, target } = body;

  if (typeof text !== "string") {
    return NextResponse.json({ error: "`text` must be a string." }, { status: 400 });
  }
  if (text.length > env.maxTextLength) {
    return NextResponse.json(
      { error: `\`text\` exceeds the ${env.maxTextLength} character limit.` },
      { status: 413 }
    );
  }
  if (typeof target !== "string" || !isLanguageCode(target)) {
    return NextResponse.json({ error: "`target` must be a supported language code." }, { status: 422 });
  }
  if (source !== "auto" && (typeof source !== "string" || !isLanguageCode(source))) {
    return NextResponse.json({ error: "`source` must be a language code or \"auto\"." }, { status: 422 });
  }

  try {
    const result = await getTranslateUseCase().execute({ text, source, target });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TranslationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: ERROR_STATUS[error.code] });
    }
    return NextResponse.json({ error: "Unexpected translation failure." }, { status: 500 });
  }
}
