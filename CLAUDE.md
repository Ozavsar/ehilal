# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Elif Hilal Kara (ehilal.net). Monorepo with a **Next.js 16** frontend and **Strapi 5** headless CMS backend. No shared workspaces or monorepo tooling — each project is independent.

## Commands

### Frontend (`frontend/`)

```bash
yarn dev          # Start dev server (uses --webpack flag)
yarn build        # Production build (uses --webpack flag)
yarn start        # Start production server
yarn lint         # ESLint (flat config, eslint.config.mjs)
yarn analyze      # Production build + bundle treemaps in .next/analyze/
npx tsc --noEmit  # Type check
```

### Backend (`backend/`)

```bash
yarn develop      # Start Strapi in dev mode
yarn build        # Build Strapi admin panel
yarn start        # Start production Strapi
```

Package manager: **Yarn** for both frontend and backend. Node **22.19+** (24 recommended): Strapi 5.60's dependencies refuse to install on older versions (backend `engines`: `>=22.19.0 <=26.x.x`).

## Architecture

### Frontend (`frontend/src/`)

- **App Router** with route groups: `(client)` for pages, `(sitemaps)` for XML sitemaps
- **`lib/api/fetchAPI.ts`** — Central API client for all Strapi requests. Bearer token auth, `qs` for query building, Next.js data cache (`force-cache`, 24h default revalidation, cache tags). Failures throw a typed `ApiError` that keeps the HTTP status; `orNotFound()` turns a Strapi 404 into `notFound()`.
- **`lib/services/`** — Service layer wrapping fetchAPI and external sources:
  - `pages.ts`, `index.ts` — Strapi CMS content (`getThemeColors()` falls back to `DEFAULT_THEME_COLORS`; `getSiteSettings()` reads the `site-setting` single type, never throws and falls back field by field to `DEFAULT_SITE_SETTINGS`)
  - `conferences.ts`, `videos.ts` — Strapi collections; `videos.ts` merges Strapi + YouTube videos
  - `youtube.ts` — YouTube Data API v3 via plain `fetch` (no googleapis)
  - `medium.ts`, `substack.ts` — Medium (internal GraphQL endpoint) and Substack (feed API) via `fetch`, responses parsed with Zod
  - `blog.ts` — Merges Medium + Substack (`Promise.allSettled`, one source may fail), paginates, looks up single articles
  - `udemy.ts` — Udemy courses via the public API with `fetch`
- **`lib/actions/contact.ts`** — Contact form server action: Zod validation (`lib/validations/contact.ts`, shared with the client form), honeypot, in-memory per-IP rate limit, email via Resend (the `react` template option needs `@react-email/render`, an optional peer of Resend 5+). Recipient is Strapi Contact Page `form_recipient_email`, falling back to `CONTACT_TO_EMAIL`.
- **`lib/getImage.ts`** — Blur placeholders (`getBlurDataURL`, `getStrapiBlurDataURL`, `withBlurDataURLs`). Strapi images use the blur Strapi stored in `provider_metadata.blurDataURL` (`getStoredBlurDataURL`); otherwise plaiceholder computes one from a small image variant, cached per source URL with `unstable_cache`. Pages add them only to the items they render (after pagination); services, sitemaps and `generateStaticParams` never compute blur.
- **`lib/metadata.ts`** — async `buildMeta()` helper for page metadata (canonical, OG, Twitter), filled from `getSiteSettings()`
- **`config/site.ts`** — Public site constants (`SITE_URL`, `SITE_NAME`, Twitter, default banner, default theme colours, `DEFAULT_SITE_SETTINGS`). The env-based name/Twitter/banner values are only fallbacks for Strapi Site Settings. **`config/env.ts`** — Zod-validated server env; never import it from a Client Component.
- **`config/constants/`** — Route definitions (`app-routes.ts`) and external service IDs
- **`containers/`** — Page-level components (home, blog, article, videos, conferences, courses, contact)
- **`components/`** — Shared components; `components/ui/` are shadcn/ui components (Radix UI + Tailwind CSS 4), `components/full-screen-gallery.tsx` is the shared image lightbox (conference gallery and article images)
- **`context/providers.tsx`** — next-themes (dark/light, class based); Lenis smooth scroll and the rocket cursor are loaded once the page is idle (`hooks/use-idle-after-load.ts`)
- **`types.ts`** — TypeScript types for Strapi content models and external sources
- **Styling** — Tailwind 4 tokens live in `app/globals.css`: `@theme` spacing/text/radius tokens (e.g. `px-page-gutter`, `text-backdrop`, `rounded-card`) and a `--z-*` z-index scale used as `z-(--z-header)`. `cn()` in `lib/utils.ts` registers the custom token names with tailwind-merge; add new ones there too. Dark mode is class based (`@custom-variant dark`).
- **Performance conventions** — Every `next/image` gets a `sizes` that matches its rendered width; only the LCP image (home hero, first list card) is eager with `fetchPriority="high"`. Entrance animations are CSS (`starting:` + `motion-reduce:`), never content hidden until hydration; `motion` is left only in the 404 scene (`components/not-found-scene.tsx`, `LazyMotion`), which `not-found-client.tsx` loads with `next/dynamic` so it stays out of the shared bundle. Keep decorative or on-demand code out of the first load: `next/dynamic` or `whenIdleAfterLoad` (Lenis, rocket cursor, mobile TOC drawer, full-screen gallery, sonner on first toast). Header links (`components/header/nav-link.tsx`) prefetch 2 s after load or on hover/focus/touch, not at render. Swiper CSS is imported by the gallery components, not globally. Geist Sans is preloaded; Geist Mono (`next/font/local`, `preload: false`) downloads only where code blocks render. The rocket cursor, theme-toggle animations and Lenis turn off under `prefers-reduced-motion`. Measure on Linux or PSI: on Windows, Next 16 (still in 16.4.3) writes an empty font manifest, so local builds preload no fonts.
- **Conventions** — TypeScript is strict (`noImplicitAny`, `noUncheckedIndexedAccess`). Comments and logs in English. No `console.log`; production builds strip it anyway (`compiler.removeConsole` keeps `error`/`warn`).

### Routing

- List pages (`blog`, `videos`, `courses`, `conferences`) live in `[page]` segments. Page 1 is served at the bare path (`/blog`) through a rewrite in `next.config.mjs`, and `/x/1` permanently redirects (308) to `/x`. Build list links with `INTERNAL_ROUTES.X.href()`, never hardcode `/x/1`.
- Page segments must match `^[1-9]\d*$` and be within range, otherwise `notFound()`.
- `/blog/[page]` also serves articles: `/blog/<slug>-<mediumPostId>`. Invalid ids 404 without a network request; a wrong slug 308-redirects to the canonical one.

### Error handling

"Content doesn't exist" → `notFound()`. "Source unreachable" (network error, 5xx) → throw, so `app/error.tsx` handles it and ISR keeps serving the last good version. `app/global-error.tsx` covers root layout failures.

### Backend (`backend/`)

- Standard Strapi 5 structure with factory-based controllers/routes/services
- Content types: `home-page`, `blog-page`, `conference`, `conferences-page`, `contact-page`, `courses-page`, `not-found-page`, `site-setting` (site name, job title, description, default OG image, Twitter, Karakod/Legalifi links), `social-media-link`, `theme`, `video`, `videos-page`
- PostgreSQL database, AWS S3 for media uploads (`config/plugins.ts`: one default export, S3 client options under `providerOptions.s3Options`). Keep every `@strapi/*` package pinned to the same version.
- `src/utils/upload-blur.ts` (registered in `src/index.ts` bootstrap) stores a blur placeholder in each image's `provider_metadata.blurDataURL` on upload/replace (sharp, `src/utils/blur.ts`) and backfills existing images ~10 s after start
- `backend/.env` may point at the production database and S3: don't start Strapi locally against it
- CORS configured for `ehilal.com`, `admin.ehilal.com`, `localhost:3169`

### Data Flow

Frontend server components call services → services call `fetchAPI()` → fetchAPI hits Strapi REST API with bearer token → responses follow `IStrapiResponse<T>` shape with `data` and `meta` (collections add `meta.pagination`). External content (YouTube, Medium, Substack, Udemy) is fetched directly from those services with `fetch` and the Next.js data cache.

### Dynamic Theming

Primary colours (hex) come from Strapi's `theme` content type and are set as `--primary-dark` / `--primary-light` CSS variables on `<html>` in the root layout (`themeColorVariables()` in `config/site.ts`).

### Caching

Strapi webhooks call `/api/revalidate`, which maps each model to its cache tags (`MODEL_TAGS`) and revalidates them. See `frontend/update.md` for the Next.js 16 cache audit.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys both projects to a VPS via SSH on push to `main` or `dev`. Both run as PM2 processes behind Nginx. Branch-specific env vars control ports and database names. The contact form rate limit reads the client IP from `X-Real-IP`, which Nginx must set.

### API Routes

- `/api/og` — Dynamic Open Graph image and favicon generation (Node runtime; the Edge runtime is deprecated in Next 16.4)
- `/api/revalidate` — On-demand ISR revalidation (requires `REVALIDATE_KEY`)

The contact form uses a server action, not an API route.

### Key Environment Variables

- **Frontend**: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRAPI_API_URL`, `BEARER_TOKEN` (required; a custom token needs `find` on every content type, including Site-setting), `YOUTUBE_API_KEY`, `RESEND_API_KEY`, `REVALIDATE_KEY`, `CONTACT_TO_EMAIL`. See `frontend/.env.example`.
- **Backend**: `DATABASE_*` (PostgreSQL), `AWS_*` (S3), `APP_KEYS`, `JWT_SECRET`

You can read @frontend\AGENTS.md for frontend updates
