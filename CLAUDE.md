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
yarn lint         # ESLint
```

### Backend (`backend/`)
```bash
yarn develop      # Start Strapi in dev mode
yarn build        # Build Strapi admin panel
yarn start        # Start production Strapi
```

Package manager: **Yarn** for both frontend and backend.

## Architecture

### Frontend (`frontend/src/`)
- **App Router** with route groups: `(client)` for pages, `(sitemaps)` for XML sitemaps
- **`lib/api/fetchAPI.ts`** — Central API client for all Strapi requests. Uses bearer token auth, `qs` for query building, and Next.js ISR caching (24h default revalidation).
- **`lib/services/`** — Service layer wrapping fetchAPI and external integrations:
  - `pages.ts`, `index.ts` — Strapi CMS content
  - `youtube.ts` — Google YouTube Data API
  - `medium.ts`, `udemy.ts` — Puppeteer web scraping (stealth mode)
  - `resend.ts` — Email via Resend (server action)
  - `videos.ts` — Aggregates Strapi + YouTube videos
- **`containers/`** — Page-level components (home, blog, videos, conferences, courses, contact, article)
- **`components/ui/`** — shadcn/ui components (Radix UI + Tailwind CSS 4)
- **`context/providers.tsx`** — next-themes (dark/light) + Lenis smooth scroll
- **`config/constants/`** — Route definitions and external service URLs/IDs
- **`types.d.ts`** — TypeScript types matching Strapi content models

### Backend (`backend/`)
- Standard Strapi 5 structure with factory-based controllers/routes/services
- Content types: `home-page`, `blog-page`, `conference`, `conferences-page`, `contact-page`, `courses-page`, `not-found-page`, `social-media-link`, `theme`, `video`, `videos-page`
- PostgreSQL database, AWS S3 for media uploads
- CORS configured for `ehilal.com`, `admin.ehilal.com`, `localhost:3169`

### Data Flow
Frontend server components call services → services call `fetchAPI()` → fetchAPI hits Strapi REST API with bearer token → responses follow `IStrapiResponse<T>` shape with `data` and `meta.pagination`. External content (YouTube, Medium, Udemy) is fetched directly from those services.

### Dynamic Theming
Primary colors are fetched from Strapi's `theme` content type, converted to HSL, and applied as CSS custom properties at the layout level.

### Deployment
GitHub Actions (`.github/workflows/deploy.yml`) deploys both projects to a VPS via SSH on push to `main` or `dev`. Both run as PM2 processes. Branch-specific env vars control ports and database names.

### API Routes
- `/api/og` — Dynamic Open Graph image generation
- `/api/revalidate` — On-demand ISR revalidation (requires `REVALIDATE_KEY`)
- `/api/send` — Contact form email submission

### Key Environment Variables
- **Frontend**: `NEXT_PUBLIC_STRAPI_API_URL`, `BEARER_TOKEN`, `YOUTUBE_API_KEY`, `RESEND_API_KEY`, `REVALIDATE_KEY`
- **Backend**: `DATABASE_*` (PostgreSQL), `AWS_*` (S3), `APP_KEYS`, `JWT_SECRET`
