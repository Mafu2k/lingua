# Lingua

[![CI](https://github.com/Mafu2k/lingua/actions/workflows/ci.yml/badge.svg)](https://github.com/Mafu2k/lingua/actions/workflows/ci.yml)

A web translator for Polish, English, German, Italian and French. It has three modes:

- **Conversation**: two people share one phone, each on their half of the screen. The app
  listens, translates and reads the translation out loud.
- **Text**: type or paste text and the source language is detected automatically.
- **Photo (OCR)**: take a picture of a menu, sign or document and translate what's on it.

Built with Next.js 14 (App Router), TypeScript and Tailwind. Speech recognition and
text-to-speech use the browser's Web Speech API, and OCR runs in the browser with Tesseract.js.
Translation is done server-side behind a small provider interface: DeepL or Google Cloud when
an API key is set, otherwise a free fallback (MyMemory plus Google's unofficial endpoint) that is
fine for development.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

No configuration is needed in development. Conversation mode needs a Chromium-based browser
(Chrome or Edge) because of the Web Speech API, and on a phone it also needs HTTPS.

```bash
npm run typecheck
npm run lint
npm test           # Vitest
```

## Configuration

Everything is optional, see [`.env.example`](.env.example). The most useful variables are
`DEEPL_API_KEY` or `GOOGLE_TRANSLATE_API_KEY` for a real translation provider, and
`TRANSLATION_PROVIDER` to force one. Input length, rate limiting and upstream timeouts can
be tuned there too.

## How the code is organised

Each feature in `src/features/` (translation, conversation, ocr) is split into `domain`
(types and ports), `application` (use cases), `infrastructure` (DeepL, Google, MyMemory,
Tesseract and Web Speech adapters) and `ui`. API routes in `src/app/api/` only validate input,
apply the rate limit and call the use case. `translation.factory.ts` decides which provider
gets used.

The rate limiter is in memory, so with more than one instance it would have to move to
something like Redis.

## Deployment

The app needs a Node server for its API routes, so GitHub Pages won't work. Vercel picks it up
without any config: import the repo and optionally add `DEEPL_API_KEY`. There is also a
multi-stage `Dockerfile`:

```bash
docker build -t lingua .
docker run -p 3000:3000 --env-file .env lingua
```

## License

MIT
