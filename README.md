# Lingua — Premium Translator

[![CI](https://github.com/Mafu2k/lingua/actions/workflows/ci.yml/badge.svg)](https://github.com/Mafu2k/lingua/actions/workflows/ci.yml)

Real-time, low-latency translation between **Polish, English, German, Italian and French**.
One responsive web app that runs equally well on a phone browser and on desktop.

- **Conversation** (priority) — two people, two languages, one device. Live speech
  recognition, automatic translation and spoken replies in a split-screen layout.
- **Text** — instant translation with automatic source-language detection and one-tap copy.
- **Image (OCR)** — read and translate documents, menus, street signs and notes from a photo.

## Stack

| Concern        | Choice                              | Why |
|----------------|-------------------------------------|-----|
| App            | Next.js 14 (App Router) + TS        | One codebase serves mobile and desktop browsers |
| Styling        | Tailwind CSS + CSS variables        | Theming, dark/light, no runtime cost |
| Speech-to-Text | Web Speech API                      | On-device, lowest latency for live conversation |
| Text-to-Speech | Web Speech API (`speechSynthesis`)  | Spoken translations with no round-trip |
| OCR            | Tesseract.js                        | Runs in the browser, no server needed |
| Translation    | Provider port: DeepL / Google Cloud / MyMemory | Production-grade, swappable, with fallback |
| Detection      | Provider-native (DeepL/Google) + `franc-min` fallback | Accurate even on short text |

## Architecture

Feature-based Clean Architecture. Each feature is sliced into layers and depends only
inward (`ui → application → domain`, with `infrastructure` implementing domain ports):

```
src/
  core/                   # shared kernel
    domain/               # Language registry, Translation types
    config/env.ts         # validated environment configuration
  features/
    translation/
      domain/ports.ts             # TranslatorProvider, LanguageDetector (interfaces)
      application/translate.usecase.ts
      infrastructure/             # DeepL · Google Cloud · Google(web) · MyMemory · fallback · factory
      ui/                         # TextTranslator + hooks
    ocr/                          # Tesseract adapter + UI
    conversation/                 # Web Speech adapters, useConversation, split-screen UI
  shared/                 # design system, hooks, theme, rate-limit, http utilities
  app/                    # routes + API route handlers (the backend boundary)
```

API route handlers in `src/app/api/*` contain **no business logic** — they validate,
rate-limit, and delegate to the use case. The same `TranslateUseCase` and ports can be
lifted into a NestJS service unchanged; only the thin HTTP layer and the composition root
(`translation.factory.ts`) would move.

## Getting started

```bash
npm install
cp .env.example .env   # optional — works without it in dev
npm run dev            # http://localhost:3000
```

The app runs with **no configuration** in development (free fallback provider).
**Conversation mode requires a Chromium-based browser** (Google Chrome / Microsoft Edge,
desktop or Android) because it relies on the Web Speech API. On a phone it also requires
HTTPS (the dev `localhost` is exempt).

## Configuration

All variables are optional; see [`.env.example`](.env.example).

| Variable                   | Default | Purpose |
|----------------------------|---------|---------|
| `TRANSLATION_PROVIDER`     | auto    | `deepl` \| `google-cloud` \| `mymemory` \| `google` |
| `DEEPL_API_KEY`            | —       | Enables DeepL (recommended for production) |
| `GOOGLE_TRANSLATE_API_KEY` | —       | Enables official Google Cloud Translation |
| `MYMEMORY_CONTACT_EMAIL`   | —       | Raises MyMemory's anonymous rate limit |
| `MAX_TEXT_LENGTH`          | 5000    | Server-side input cap |
| `RATE_LIMIT_MAX`           | 60      | Requests per window per IP |
| `RATE_LIMIT_WINDOW_MS`     | 60000   | Rate-limit window |
| `PROVIDER_TIMEOUT_MS`      | 8000    | Upstream provider timeout |
| `NEXT_PUBLIC_SITE_URL`     | —       | Canonical URL for metadata |

**Provider selection** (when `TRANSLATION_PROVIDER` is empty): DeepL if a key is set →
otherwise Google Cloud if a key is set → otherwise a free fallback (unofficial Google
endpoint + MyMemory). The free endpoint is **unsupported and for development only**; set a
DeepL or Google Cloud key for production.

## Production notes

- **Security headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  a `frame-ancestors 'none'` CSP and a `Permissions-Policy` that grants only the microphone.
- **Rate limiting & input caps** on every API route. The limiter is in-memory (per
  instance) — for multi-instance deployments back it with Redis/Upstash.
- **Timeouts** on all upstream provider calls.
- **Standalone output** + multi-stage `Dockerfile` for container deploys.

## Deployment

**Vercel** — import the repo, set env vars, deploy. Zero extra config.

**Docker**

```bash
docker build -t lingua .
docker run -p 3000:3000 --env-file .env lingua
```

**Node**

```bash
npm run build
npm run start
```

## Scripts

| Script              | Purpose                       |
|---------------------|-------------------------------|
| `npm run dev`       | Development server            |
| `npm run build`     | Production build              |
| `npm run start`     | Run the production build      |
| `npm run typecheck` | Strict TypeScript check       |
| `npm run lint`      | ESLint (next/core-web-vitals) |
| `npm run test`      | Unit tests (Vitest)           |

## Accessibility & UX

- Full keyboard operation, visible focus rings, `aria-live` regions for translations and
  transcripts, labelled controls and microphone buttons.
- Dark / light themes with no flash on load (theme resolved before hydration) and respect
  for `prefers-reduced-motion`.
- Large tap targets, responsive split-screen, safe-area-aware bottom navigation, installable
  PWA manifest.

## Roadmap

- Server-side STT (Whisper / cloud) for speech recognition that works in every browser.
- Optional PostgreSQL persistence for conversation history and glossaries.

## License

[MIT](LICENSE).
