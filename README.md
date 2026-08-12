# HH Goa 2026 — Builder ID Card Generator

A full-stack Next.js (App Router) tool for the **HH Goa 2026 "Builder ID" task**:
upload a photo → get an instant, on-brand Builder ID card → download the PNG or
share straight to X with a working image preview. No login, no signup, one pass
start to finish.

Built with **Next.js 16, TypeScript, Tailwind CSS v4**, and a tiny Node backend
that uses `@napi-rs/canvas` for server-side rendering.

## What it does

1. **Upload** — tap/drag a photo. JPG, PNG, WebP, and iPhone **HEIC/HEIF** are all
   supported (HEIC is transcoded to JPEG in-browser with `heic2any` before it
   ever touches a `<canvas>`, since no browser can decode HEIC natively).
2. **Fill in details** — name, stack/role, and a builder title (with a
   "🎲 Shuffle" button that generates a fun Goa/hacker-themed title).
3. **Instant preview** — the card renders client-side on a `<canvas>`
   the moment a photo lands, so there's no loading screen, just live updates
   as you type.
4. **Download** — a real PNG file (`canvas.toBlob`/`toDataURL`), not a
   screenshot-only render.
5. **Share to X** — uploads the photo + fields to `/api/card`, which
   re-renders the exact same card **server-side** and stores it. That
   produces a real, durable image URL, which is required because X's tweet
   compose intent can't attach a binary image directly — the only way to
   make the tweet's link preview show the *actual generated graphic* is to
   share a link whose page has a working `og:image`. That's what
   `/s/[id]` is for.

Both the client canvas render and the server canvas render call the **exact
same drawing function** (`src/lib/drawCard.ts`), so the downloaded file and
the X preview are pixel-identical.

## Why the card looks the way it does

Every element in the card is either the user's photo or **hand-drawn vector
shapes** (palms, waves, sun, pin/ticket/calendar icons) — nothing is emoji
text. That's deliberate: headless server environments frequently have no
emoji font installed, which silently turns `🌴`/`📍`/`📅` into blank "tofu"
boxes in a server-rendered PNG. Drawing everything as paths/gradients
guarantees the share image looks right on any deploy target.

## Project structure

```
src/
  app/
    page.tsx                 Main UI (client component)
    layout.tsx                Root layout + metadata
    globals.css                Goa color tokens (Tailwind v4 @theme)
    api/
      card/route.ts            POST — server-renders + stores a share PNG
      card/[id]/route.ts        GET  — serves a stored PNG (also used as og:image)
    s/[id]/page.tsx            Share landing page w/ dynamic OG/Twitter metadata
  components/
    UploadZone.tsx              Drag/drop + tap-to-upload
    FieldsForm.tsx               Name / stack / builder-title inputs
    CardPreview.tsx               <canvas> preview + Download + Share to X
    Logo.tsx                       Inline SVG palm/sunset wordmark
  lib/
    drawCard.ts                   THE renderer — isomorphic canvas drawing code,
                                    runs identically in the browser and in Node
    builderTitles.ts                Fun title generator + stack suggestions
    loadImageFile.ts                 HEIC-aware file → <img> loader (client)
    cardStore.ts                      In-memory + on-disk store for share PNGs
```

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm start
```

## Configuration

Set `NEXT_PUBLIC_SITE_URL` to your deployed origin so Open Graph tags on
`/s/[id]` resolve to absolute, publicly-fetchable URLs (required for X's
link-preview crawler to fetch the image):

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Deployment notes

- **Share storage**: `src/lib/cardStore.ts` keeps generated share PNGs in
  memory plus a `.cache/cards` folder on disk. That's perfect for a normal
  Node server (a VM, Railway, Render, Fly.io, a Docker container) where the
  filesystem persists between requests. On a fully ephemeral serverless
  platform (e.g. Vercel's default functions), swap the two functions in that
  file for a call to S3 / Cloudflare R2 / Vercel Blob — the interface
  (`saveCard` / `loadCard`) is intentionally tiny so it's a drop-in change.
- **`@napi-rs/canvas`**: ships prebuilt native binaries for common platforms
  (Linux/macOS/Windows, x64/arm64) — no system Cairo/Pango install needed. It's
  marked as a `serverExternalPackages` entry in `next.config.ts` so the
  bundler leaves its native binding alone.
- **Logo**: the header badge uses a custom inline SVG (`src/components/Logo.tsx`)
  in the same sunset/ocean palette as the card itself, since the official
  hhgoa.com brand-kit files weren't reachable from this environment to embed
  directly. Drop real brand assets into `/public` and swap the `<Logo />`
  usage in `src/app/page.tsx` for an `<Image src="/logo.svg" />` if you have
  the official files.
- **Fonts**: uses the system font stack (no external Google Fonts fetch at
  build time), so `npm run build` works offline / behind restrictive
  network policies. If you want the display font shown in the design
  (Space Grotesk), just add it back via `next/font/google` in
  `src/app/layout.tsx` on a machine with normal internet access.

## Tech

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- `@napi-rs/canvas` for server-side PNG rendering
- `heic2any` for client-side iPhone HEIC → JPEG conversion
