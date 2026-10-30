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
yarn icons:subset # Rebuild the Material Symbols subset font after adding a name to components/icon-names.ts (prebuild checks it)
npx tsc --noEmit  # Type check
```

### Backend (`backend/`)

```bash
yarn develop      # Start Strapi in dev mode
yarn build        # Build Strapi admin panel
yarn start        # Start production Strapi
yarn palette:default  # Regenerate frontend/src/config/default-palette.json ([seed] [variant])
```

Package manager: **Yarn** for both frontend and backend. Node **22.19+** (24 recommended): Strapi 5.60's dependencies refuse to install on older versions (backend `engines`: `>=22.19.0 <=26.x.x`).

## Architecture

### Frontend (`frontend/src/`)

- **App Router**: the `(client)` route group holds the pages; its `template.tsx` renders the single `<main id="main">` (skip-link target, list-page h1 inside it). File-based SEO routes: `app/robots.ts` (only ehilal.net is indexable; other hosts also get `X-Robots-Tag: noindex` from `next.config.mjs`), `app/sitemap.ts` (one sitemap, real `lastModified`, survives source outages), `app/manifest.ts`, `app/icon.tsx` + `app/apple-icon.tsx` (palette-coloured, `theme` tag)
- **`lib/api/fetchAPI.ts`** — Central API client for all Strapi requests. Bearer token auth, `qs` for query building, Next.js data cache (`force-cache`, 24h default revalidation, cache tags). Failures throw a typed `ApiError` that keeps the HTTP status; `orNotFound()` turns a Strapi 404 into `notFound()`.
- **`lib/services/`** — Service layer wrapping fetchAPI and external sources:
  - `pages.ts`, `index.ts` — Strapi CMS content (`getThemePalette()` reads the `theme` palette — the draft in draft mode — validates it and falls back to `config/default-palette.json`; `getSiteSettings()` reads the `site-setting` single type, never throws and falls back field by field to `DEFAULT_SITE_SETTINGS`)
  - `conferences.ts`, `videos.ts` — Strapi collections; `videos.ts` merges Strapi + YouTube videos
  - `youtube.ts` — YouTube Data API v3 via plain `fetch` (no googleapis)
  - `medium.ts`, `substack.ts` — Medium (internal GraphQL endpoint) and Substack (feed API) via `fetch`, responses parsed with Zod
  - `blog.ts` — Merges Medium + Substack (`Promise.allSettled`, one source may fail), paginates, looks up single articles
  - `udemy.ts` — Udemy courses via the public API with `fetch`
- **`lib/actions/contact.ts`** — Contact form server action: Zod validation (`lib/validations/contact.ts`, shared with the client form), honeypot, in-memory per-IP rate limit, email via Resend (the `react` template option needs `@react-email/render`, an optional peer of Resend 5+). Recipient is Strapi Contact Page `form_recipient_email`, falling back to `CONTACT_TO_EMAIL`.
- **`lib/getImage.ts`** — Blur placeholders (`getBlurDataURL`, `getStrapiBlurDataURL`, `withBlurDataURLs`). Strapi images use the blur Strapi stored in `provider_metadata.blurDataURL` (`getStoredBlurDataURL`); otherwise plaiceholder computes one from a small image variant, cached per source URL with `unstable_cache`. Pages add them only to the items they render (after pagination); services, sitemaps and `generateStaticParams` never compute blur.
- **SEO** — written in code, never read from the CMS: per-route titles/descriptions in `config/seo.ts` (titles ≤ 60, descriptions 140–160 chars, English), `lib/metadata.ts` (`buildMeta`/`buildPageMeta`: canonical, OG, Twitter, article times/author, `og:locale`; JSON-LD builders), `components/json-ld.tsx` (escaped `<script type="application/ld+json">`: Person + WebSite in the root layout, ProfilePage on home, BlogPosting + BreadcrumbList on articles, BreadcrumbList on lists). Site Settings only provide site identity (name, job title, default description, OG image, socials). `lib/language.ts` `detectLanguage()` decides `lang="tr"` and `og:locale` for Turkish articles.
- **`lib/palette.ts`** / **`lib/palette-css.ts`** — Material 3 palette: the 47 colour roles, the Zod schema for the palette JSON, `paletteToCss()` and `DEFAULT_PALETTE` (`palette-css.ts` has no Zod so Client Components such as `global-error.tsx` can use it).
- **`config/site.ts`** — Public site constants (`SITE_URL`, `SITE_NAME`, Twitter, default banner, `DEFAULT_SITE_SETTINGS`). The env-based name/Twitter/banner values are only fallbacks for Strapi Site Settings. **`config/env.ts`** — Zod-validated server env; never import it from a Client Component.
- **`config/constants/`** — Route definitions (`app-routes.ts`) and external service IDs
- **`containers/`** — Page-level components (home, blog, article, videos, conferences, courses, contact)
- **`components/`** — Shared components; `components/ui/` are shadcn/ui components (Radix UI + Tailwind CSS 4), `components/full-screen-gallery.tsx` is the shared image lightbox (conference gallery and article images)
- **`context/providers.tsx`** — next-themes (dark/light, class based); Lenis smooth scroll and the rocket cursor are loaded once the page is idle (`hooks/use-idle-after-load.ts`)
- **`types.ts`** — TypeScript types for Strapi content models and external sources
- **Colours** — Material 3 colour roles only: `bg-surface`, `text-on-surface`, `text-on-surface-variant`, `bg-surface-container-low`, `bg-primary text-on-primary`, `bg-secondary-container`, `border-outline-variant`, `bg-scrim/40`, `bg-error-container` … (`--color-<role>: var(--m3-<role>)` in `globals.css`). The shadcn colour names (`background`, `foreground`, `muted`, `accent`, `card`, `destructive`, `border`, `input`, `ring`) are gone on purpose and not aliased, so a stale one produces no CSS. Hover is a state layer (`hover:bg-on-surface/8`), text on a coloured fill uses its `on-*` role, never `text-white`. Never build colour classes dynamically (`bg-${role}`). The only fixed colour outside the palette is the rating stars' Google yellow `#FBBC04`. No brand colours (YouTube/Udemy labels use palette roles).
- **Material 3 design system** (all in `app/globals.css`) — Type: the 15 `type-*` utilities (`type-display-large` … `type-label-small`), never `text-sm`/`text-lg`/`font-*`/`leading-*` for text roles (`.prose` is mapped to the roles in an unlayered rule; custom blocks inside an article need `not-prose`). Shape: `rounded-xs` 4 · `sm` 8 · `md` 12 (cards) · `lg` 16 · `xl` 28 (sheets) · `rounded-full` (buttons). Elevation: `shadow-elevation-0…5` only. Motion: M3 easings (`ease-standard`, `ease-emphasized-decelerate` …) with M3 durations as Tailwind numbers (`duration-200`, `duration-400`), keyframes `animate-m3-*`, all reduced-motion safe. Interaction: `.state-layer` or `hover:bg-on-surface/8`. Spacing: Tailwind's 4 px grid; window margins via `container` (16 px, 24 px from `sm`, `max-w-content` 1200). Breakpoints are the M3 window size classes: `sm` 600, `md` 840, `lg` 1200, `xl` 1600 (no `2xl`). Navigation: one `<nav>` (`components/header/navigation-links.tsx`), a labelled bottom bar below 600 px and a 96 px left rail from 600 px, with an active-indicator pill that slides between destinations (measured FLIP, skipped under reduced motion); the theme toggle is an icon button at the bottom of the rail (top-right row on compact). `<body>` is a top-down flex column carrying the offsets (`max-sm:pb-nav-bar sm:pl-rail`) — don't make it a stretching grid, short pages would centre their title. Icons: Material Symbols Rounded only, `<Icon name filled? size?>` (`components/icon.tsx`, names typed by `components/icon-names.ts`; self-hosted subset font, add a name then run `yarn icons:subset`); brand logos via `<BrandIcon brand>` (`components/brand-icon.tsx`, paths copied from react-icons, no dependency: Font Awesome 6 X, Instagram, LinkedIn-in, YouTube and Medium, Bootstrap Substack, Simple Icons Udemy; `currentColor`). Cards are M3 filled cards (tonal elevation `surface-container-highest`, `rounded-md`, no shadow); pass `interactive` for clickable cards to get the card-wide state layer. List pages share `containers/list-layout.ts` (grid 1/2/3 columns from `sm`/`lg` and the matching image `sizes`): change both together. `cn()` registers the custom names (`m3-type` group, radius, elevation, spacing, ease) with tailwind-merge; add new ones there. Also a `--z-*` z-index scale (`z-(--z-header)`). Dark mode is class based (`@custom-variant dark`).
- **View transitions** — React 19.3 `<ViewTransition>` (no config): M3 fade-through between the nav destinations (`app/template.tsx`, `app/(client)/template.tsx`, nav links tagged `nav-top`), blog card → article morph of cover and title (names from the Medium post id) with a staggered reveal of the rest, pagination shared axis X (`nav-forward`/`nav-back`), conference photo ↔ full-screen gallery morph (open/close in `startTransition`). Helpers in `components/view-transitions.tsx`, CSS in `globals.css`; the nav box is anchored (`data-nav-anchor`) so it never crossfades. React runs no view transition for a synchronous popstate update, so `components/history-morph.tsx` holds article ↔ blog-list popstate events back one task (replayed as a transition) and owns scroll restoration while mounted (`history.scrollRestoration = "manual"`, positions per Navigation API entry in sessionStorage); it relies on Next 16.4's popstate handler — re-check after Next upgrades. The conference gallery pushes a same-URL history entry, so Back closes it with the reverse morph. Transition names must be unique on the page at any moment (e.g. `conference-<id>-photo-<photoId>`). All of it is reduced-motion safe.
- **Article page** — sticky M3 top app bar (`containers/article/article-top-bar.tsx`: back button, article title once the `<h1>` scrolls under it), cover image as the LCP element, 70ch text column, side TOC from `lg`. Google Drive/Docs viewer iframes are rendered as a document link card (the framed viewer made browsers download a file called "viewer").
- **Rocket dock** — `components/header/rocket-dock.tsx` + `hooks/use-rocket-dock.ts`: hovering the pad in the rail for ~1 s parks the rocket cursor there (state in localStorage), again launches it; rocket, glow and fumes use palette roles. Same gate as the rocket (fine pointer, ≥ 769 px, no reduced motion).
- **Performance conventions** — Every `next/image` gets a `sizes` that matches its rendered width; only the LCP image (home hero, first list card) is eager with `fetchPriority="high"`. Entrance animations are CSS (`starting:` + `motion-reduce:`), never content hidden until hydration; there is no animation library (`motion` was removed); the 404 page (`containers/not-found/`) is a server component whose only animation is a CSS orbit (`orbit.module.css`). Keep decorative or on-demand code out of the first load: `next/dynamic` or `whenIdleAfterLoad` (Lenis, rocket cursor, mobile TOC drawer, full-screen gallery, sonner on first toast). Header links (`components/header/nav-link.tsx`) prefetch 2 s after load or on hover/focus/touch, not at render. Swiper CSS is imported by the gallery components, not globally. Geist Sans is preloaded; Geist Mono (`next/font/local`, `preload: false`) downloads only where code blocks render. The rocket cursor, Lenis, the nav indicator slide and the theme reveal turn off under `prefers-reduced-motion`. Measure on Linux or PSI: on Windows, Next 16 (still in 16.4.3) writes an empty font manifest, so local builds preload no fonts.
- **Accessibility conventions** — axe-clean on every route in both themes; keep it that way. Cards have one real link (the title); duplicate links to the same target (thumbnail, footer button) are `aria-hidden` + `tabIndex={-1}`, card images `alt=""`. External links say "(opens in a new tab)" to screen readers. Article body headings start at `h2`; TOC activation moves focus to the heading. Icon buttons get a 48 dp target on touch via the `touch-target` utility. Swiper speed is 0 under reduced motion (`useSlideSpeed`). Required form fields: asterisk + `aria-required`, `aria-describedby` only to visible errors.
- **Conventions** — TypeScript is strict (`noImplicitAny`, `noUncheckedIndexedAccess`). Comments and logs in English. No `console.log`; production builds strip it anyway (`compiler.removeConsole` keeps `error`/`warn`).

### Routing

- List pages (`blog`, `videos`, `courses`, `conferences`) live in `[page]` segments. Page 1 is served at the bare path (`/blog`) through a rewrite in `next.config.mjs`, and `/x/1` permanently redirects (308) to `/x`. Build list links with `INTERNAL_ROUTES.X.href()`, never hardcode `/x/1`.
- Page segments must match `^[1-9]\d*$` and be within range, otherwise `notFound()`.
- `/blog/[page]` also serves articles: `/blog/<slug>-<mediumPostId>`. Invalid ids 404 without a network request; a wrong slug 308-redirects to the canonical one.

### Error handling

"Content doesn't exist" → `notFound()`. "Source unreachable" (network error, 5xx) → throw, so `app/error.tsx` handles it and ISR keeps serving the last good version. `app/global-error.tsx` covers root layout failures.

### Backend (`backend/`)

- Standard Strapi 5 structure with factory-based controllers/routes/services
- Content types: `home-page`, `blog-page`, `conference`, `conferences-page`, `contact-page`, `courses-page`, `not-found-page`, `site-setting` (site name, job title, description, default OG image, Twitter, Karakod/Legalifi links), `social-media-link`, `theme` (M3 palette source: seed colour or photo, variant, generated `palette` + `image_candidates`; legacy `primaryDark`/`primaryLight` kept until the next release), `video`, `videos-page`
- Theme palette: `src/utils/m3-palette.ts` (generator, photo → candidate colours) and `src/utils/theme-palette.ts` (document-service middleware that regenerates `palette` on every theme save/publish, plus a startup backfill). The admin shows the `global::m3-palette` custom field (`src/admin/m3-palette/`) instead of raw JSON: variant description, photo candidates, palette state, and the colour sent from the preview bar (`src/admin/app.tsx` keeps it in sessionStorage until it is applied). `@material/material-color-utilities` 0.4.0 is patched with patch-package (`patches/`, `postinstall`) because its ESM imports lack `.js` extensions; the patch must apply on every `yarn install`.
- Strapi Preview (`config/admin.ts`, enabled when `FRONTEND_URL` and `PREVIEW_SECRET` are set) opens the frontend's `/api/preview` → `/` in draft mode for the theme; Publish is the approval step.
- PostgreSQL database, AWS S3 for media uploads (`config/plugins.ts`: one default export, S3 client options under `providerOptions.s3Options`). Keep every `@strapi/*` package pinned to the same version.
- `src/utils/upload-blur.ts` (registered in `src/index.ts` bootstrap) stores a blur placeholder in each image's `provider_metadata.blurDataURL` on upload/replace (sharp, `src/utils/blur.ts`) and backfills existing images ~10 s after start
- Admin field labels and descriptions (Turkish) are code, not DB settings: `src/utils/admin-field-labels.ts` applies them to the content-manager view configuration at every bootstrap (it also arranges the theme edit view). Add an entry for every new attribute — the map's type fails compilation otherwise; edits made under "Configure the view" are reset on the next start.
- `backend/.env` may point at the production database and S3: don't start Strapi locally against it
- CORS configured for `ehilal.com`, `admin.ehilal.com`, `localhost:3169`

### Data Flow

Frontend server components call services → services call `fetchAPI()` → fetchAPI hits Strapi REST API with bearer token → responses follow `IStrapiResponse<T>` shape with `data` and `meta` (collections add `meta.pagination`). External content (YouTube, Medium, Substack, Udemy) is fetched directly from those services with `fetch` and the Next.js data cache.

### Dynamic Theming

All colours come from one Material 3 palette generated in Strapi from a seed colour or a photo and a scheme variant (`theme.palette`: 6 schemes × 47 roles). The root layout reads it with `getThemePalette()` and writes a `<style id="m3-palette">` with `--m3-*` variables for `:root` (light), `.dark` and `prefers-contrast: more` (high contrast). Without a valid published palette it uses `config/default-palette.json` (regenerate with `yarn palette:default` in `backend/`). The OG/favicon route and the contact email use the same palette. Plan and decisions: `local_docs/09-material-renk-sistemi-plani.md`.

### Caching

Strapi webhooks call `/api/revalidate`, which maps each model to its cache tags (`MODEL_TAGS`) and revalidates them. See `frontend/update.md` for the Next.js 16 cache audit.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys both projects to a VPS via SSH on push to `main` or `dev`. Both run as PM2 processes behind Nginx. Branch-specific env vars control ports and database names. The contact form rate limit reads the client IP from `X-Real-IP`, which Nginx must set.

### API Routes

- `/api/og` — Dynamic Open Graph images (Geist Bold title card, palette colours; Node runtime — the Edge runtime is deprecated in Next 16.4). Favicons are the file-based `app/icon.tsx` / `app/apple-icon.tsx`.
- `/api/revalidate` — On-demand ISR revalidation (requires `REVALIDATE_KEY`)
- `/api/preview` (GET, `PREVIEW_SECRET`) and `/api/preview/disable` (POST) — Draft Mode for Strapi Preview; In draft mode the root layout shows `components/theme-preview-bar.tsx`: a floating toolbar to change the seed colour and variant and recolour the whole site live (`lib/palette-generate.ts`, loaded on demand; `next.config.mjs` lets webpack resolve `@material/material-color-utilities`' extensionless imports), then send the choice to the Strapi theme (postMessage to `PREVIEW_PARENT_ORIGINS`) or copy it. Pages send `Content-Security-Policy: frame-ancestors` for the Strapi admin origin instead of `X-Frame-Options`, so the preview can be framed.

The contact form uses a server action, not an API route.

### Key Environment Variables

- **Frontend**: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRAPI_API_URL`, `BEARER_TOKEN` (required; a custom token needs `find` on every content type, including Site-setting), `YOUTUBE_API_KEY`, `RESEND_API_KEY`, `REVALIDATE_KEY`, `CONTACT_TO_EMAIL`, `PREVIEW_SECRET` (+ optional `PREVIEW_ALLOWED_ORIGINS`). See `frontend/.env.example`.
- **Backend**: `DATABASE_*` (PostgreSQL), `AWS_*` (S3), `APP_KEYS`, `JWT_SECRET`, `FRONTEND_URL` + `PREVIEW_SECRET` (Strapi Preview; same secret as the frontend)

You can read @frontend\AGENTS.md for frontend updates
