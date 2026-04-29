# Project Roadmap — Open Source 3D Device Repair Platform

## Overview

A community-driven platform where users can view interactive 3D models of devices, post repair problems, get AI-generated step-by-step guidance, and contribute CAD models to a growing open source library.

**Estimated Timeline:** 9–12 months  
**MVP Target:** Month 4  
**Public Launch:** Month 8

---

## Table of Contents

- [Phase 1 — Foundation](#phase-1--foundation-months-12)
- [Phase 2 — Core Build](#phase-2--core-build-months-35)
- [Phase 3 — AI Layer](#phase-3--ai-layer-months-57)
- [Phase 4 — Community](#phase-4--community-months-79)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Cost Estimate](#cost-estimate)

---

## Phase 1 — Foundation (Months 1–2)

> Lock in the engineering foundation before writing any product code. Every decision here is load-bearing — schema, auth, file pipeline, and repo structure will be lived with for years.

### Repo & Team Setup

- [ ] Create GitHub organization. Set up monorepo with Turborepo — `apps/web`, `apps/api`, `apps/worker`, `packages/ui`, `packages/shared`
- [ ] Enable branch protection on `main`. Require PRs with at least 1 review. No force push.
- [ ] Assign clear ownership: frontend lead, backend lead, AI/infra lead
- [ ] Set up Linear (or GitHub Projects) for task tracking. Create a board per phase.
- [ ] Write `CONTRIBUTING.md` — public OSS, contributors need clear guidelines from day one
- [ ] Choose a license. MIT or Apache 2.0 for the platform. CAD model contributions get their own submission license.
- [ ] Set up Discord server for team + early contributors

### Database Schema

Using PostgreSQL via Supabase. Core tables:

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| username | text | Unique |
| email | text | Unique |
| avatar_url | text | |
| reputation_score | integer | Default 0 |
| reviewer_tier | integer | 0–3 |
| created_at | timestamptz | |
| banned | boolean | Default false |

#### `devices`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| make | text | e.g. Apple |
| model | text | e.g. MacBook Pro |
| year | integer | |
| category | text | laptop / phone / console / appliance / etc |
| model_id | uuid | FK → models |
| created_by | uuid | FK → users |
| created_at | timestamptz | |

#### `models`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| device_id | uuid | FK → devices |
| file_url | text | Supabase Storage URL |
| format | text | gltf / obj / step |
| version | integer | Increments on re-submission |
| status | text | pending / ai_pass / approved / rejected |
| uploader_id | uuid | FK → users |
| annotations | jsonb | Part hotspot coordinates + labels |
| reviewed_by | uuid | FK → users (reviewer) |
| ai_verdict | jsonb | {pass, confidence, issues[]} |

#### `threads`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| device_id | uuid | FK → devices |
| title | text | |
| body | text | Markdown |
| author_id | uuid | FK → users |
| status | text | open / resolved |
| accepted_answer_id | uuid | FK → comments |
| upvotes | integer | Default 0 |
| created_at | timestamptz | |

#### `comments`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| thread_id | uuid | FK → threads |
| author_id | uuid | FK → users |
| body | text | Markdown |
| upvotes | integer | Default 0 |
| is_ai_generated | boolean | Default false |
| parent_comment_id | uuid | Nullable, for nested replies |
| created_at | timestamptz | |

#### `model_requests`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| device_name | text | |
| description | text | |
| requested_by | uuid | FK → users |
| upvotes | integer | Default 0 |
| bounty_amount | numeric | USD, held in escrow |
| status | text | open / fulfilled |
| created_at | timestamptz | |

### Auth Setup

- [ ] Use Supabase Auth — email/password + OAuth (GitHub, Google), JWT sessions
- [ ] Set up row-level security (RLS) in Postgres from day one. Never expose raw DB to client.
- [ ] Define roles: `anon` (read-only), `user` (post threads/comments), `contributor` (submit models), `reviewer`, `admin`

### File Upload Pipeline

- [ ] Supabase Storage buckets: `models-raw` (pre-validation) and `models-approved` (post-validation)
- [ ] Enforce max file size server-side (100MB). Accepted MIME types: `model/gltf+json`, `model/obj`, `application/step`
- [ ] On upload, trigger conversion worker to normalize everything to `.glb` (binary glTF) for the viewer
- [ ] Worker runs on Railway as a Docker container. Job queue via BullMQ + Redis (Upstash).
- [ ] Conversion tools: Blender headless or Open CASCADE (Python)

---

## Phase 2 — Core Build (Months 3–5)

> Build every core user-facing surface. By end of phase, a user can find a device, view its 3D model, read or post a problem thread, and submit a new model.

### Frontend Scaffolding

- [ ] Scaffold Next.js 14 app with App Router. TypeScript strict mode on.
- [ ] Set up Tailwind CSS + shadcn/ui component library
- [ ] Configure tRPC for end-to-end type-safe API calls
- [ ] Set up Drizzle ORM with schema matching Supabase tables

**Routes:**

| Route | Purpose |
|---|---|
| `/` | Home — search devices, trending threads |
| `/device/[slug]` | Device page — 3D viewer + thread list |
| `/device/[slug]/thread/[id]` | Individual problem thread |
| `/submit` | Model submission form |
| `/request` | Model request form |
| `/review` | Reviewer dashboard (gated by tier) |
| `/profile/[username]` | Public profile + rep + contributions |

### 3D Viewer

- [ ] Use `<model-viewer>` web component (Google) — wraps Three.js, glTF native, hotspot API built in
- [ ] Serve approved `.glb` files from Supabase Storage via CDN
- [ ] Part annotation system: store hotspot coordinates in `models.annotations` (JSONB). Render as `slot="hotspot-N"` on the viewer.
- [ ] When AI highlights a part in a repair step, pan/zoom viewer to that hotspot via `camera-target` attribute
- [ ] Fallback: if no model exists yet, show placeholder with link to request one

### Problem Thread System

- [ ] Thread creation: title + markdown body + optional image attachments, linked to a device
- [ ] Comments: nested one level (reply to a comment). Upvote on both threads and comments.
- [ ] OP can mark a comment as accepted answer. After 30 days with no accepted answer, top-upvoted comment auto-promotes.
- [ ] Model request threads: same structure, but with an upvote counter signaling demand to contributors
- [ ] Community flagging: flag button on any thread/comment. 5 flags triggers auto-hide pending mod review.

### Model Submission + Dual-Gate Validation

#### Gate 0 — Instant (client + server)
- File format check (reject non-STEP/OBJ/glTF before upload)
- File size within limit
- All metadata fields filled (make, model, year, category, description)
- Reject immediately with specific error message

#### Gate 1 — AI Review (async, ~2–5 min)
- Convert uploaded file to glTF via worker
- Render thumbnails at fixed angles (headless Blender)
- Send screenshots + claimed device metadata to Claude vision API
- Prompt asks: does model match claimed device? Are parts annotated? Is geometry coherent?
- Parse JSON verdict: `{pass: bool, confidence: float, issues: string[]}`
- Pass threshold: `confidence > 0.75`
- Store verdict in `models.ai_verdict`. Email contributor with result.

#### Gate 2 — Human Review (reviewer dashboard)
- AI-passed models enter the reviewer queue
- Reviewers see: 3D model preview, AI verdict summary, submission metadata
- Actions: Approve / Request changes (with notes) / Reject (with reason)
- Email contributor at each status change via Resend

---

## Phase 3 — AI Layer (Months 5–7)

> The AI layer is the main differentiator. It must feel like it understands the device — not just generate generic repair text. Model-awareness is what separates this from asking ChatGPT.

### AI Repair Agent

- [ ] Use Claude API (`claude-sonnet-4-6`) as the backbone
- [ ] Trigger automatically when a user posts a problem thread on a device with an approved model
- [ ] Context passed to agent: device metadata + `models.annotations` (JSONB) + user's problem description
- [ ] Prompt structure: system prompt sets role (expert repair technician). User message includes device info + annotation labels + problem description.
- [ ] Agent response references annotation IDs (e.g. "Remove screw at hotspot-3"). Frontend maps these to viewer camera positions — viewer pans to part as user reads each step.
- [ ] Stream response token-by-token to UI using Claude's streaming API
- [ ] If no model exists, agent falls back to general repair guidance + suggests requesting a model
- [ ] Cache AI answer per thread in DB — never regenerate the same answer twice

### Search & Indexing

- [ ] Postgres full-text search (`tsvector`) for device + thread search — fast enough at early scale
- [ ] When a thread is marked resolved, generate a summary embedding (Voyage AI or OpenAI embeddings)
- [ ] Store embedding in Postgres via `pgvector` extension (enabled on Supabase)
- [ ] Use vector search for "similar problems" sidebar on thread pages
- [ ] AI agent can also query past resolved threads as additional context

### Rate Limiting & Cost Control

- [ ] Cache AI-generated answers per thread — never regenerate
- [ ] Rate limit: max 5 AI-triggered answers per user per day on free tier
- [ ] Set Anthropic API spend alerts at $50, $100, $200
- [ ] AI validation job is async — never block the upload response waiting for verdict

---

## Phase 4 — Community (Months 7–9)

> Turn early users into contributors and contributors into reviewers. Reward participation visibly. Make community membership feel meaningful before launch.

### Reputation System

Points are earned as follows:

| Action | Rep Gained |
|---|---|
| Model approved | +10 |
| Comment marked as accepted answer | +5 |
| Upvote received on a comment | +1 |
| Upvote received on a thread | +2 |
| Bounty earned on model | +15 |

**Rep thresholds:**

| Rep | Permission Unlocked |
|---|---|
| 50 | Submit models |
| 200 | Reviewer Tier 1 |
| 500 | Reviewer Tier 2 |
| 1000 | Reviewer Tier 3 + income eligible |

- Rep is public and displayed on profiles and next to usernames on all posts
- Never auto-decrease — only admins can manually deduct

### Reviewer Tier System

| Tier | Rep Required | Privileges | Audit Rate |
|---|---|---|---|
| Tier 1 | 200 | Review models in declared category | 100% spot-checked |
| Tier 2 | 500 | Cross-category review, can escalate | 20% spot-checked |
| Tier 3 | 1000 | Review other reviewers' decisions, income eligible | 5% spot-checked |

- Team remains as arbiters — handling escalations and disputes
- Cross-review auditing: reviewers occasionally review the same model without knowing it, to detect rubber-stamping

### Bounty System

- [ ] Any user can add to a bounty pool on a model request (real money via Stripe)
- [ ] Bounty sits in escrow until model passes Gate 2
- [ ] If model rejected, bounty stays in pool for the next contributor
- [ ] On approval + fulfillment: bounty paid to contributor minus 10% platform fee
- [ ] Stripe Connect for contributor payouts. Identity verification required above payout threshold.

### Notifications

- [ ] Email (via Resend): thread reply, accepted answer, model status change, rep milestone, bounty earned
- [ ] In-app notification bell with unread count. Stored in `notifications` table, polled via Supabase Realtime.
- [ ] Weekly digest email: top new models, most-upvoted threads, open bounties

### Pre-Launch Checklist

- [ ] Seed at least 50 approved device models across 5+ categories
- [ ] Publish reviewer handbook (the review rubric — publicly accessible)
- [ ] Set up status page (Better Uptime) for uptime transparency
- [ ] GDPR-compliant privacy policy and Terms of Service
- [ ] Model upload terms clearly state license granted to platform
- [ ] Accessibility audit: keyboard nav, screen reader labels on 3D viewer, sufficient color contrast
- [ ] Load test viewer with 50 concurrent users before opening up

---

## Tech Stack

### Frontend

| Tool | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for SEO, API routes, React ecosystem |
| Language | TypeScript | Type safety across a multi-person team |
| Styling | Tailwind CSS | Fast iteration, consistent design tokens |
| Components | shadcn/ui | Accessible, copy-paste owned code |
| 3D Viewer | model-viewer (Google) | Wraps Three.js, glTF native, hotspot API built in |
| Global State | Zustand | Lightweight, viewer/thread sync |
| Data Fetching | TanStack Query | Caching, background refetch, optimistic updates |

### Backend

| Tool | Choice | Reason |
|---|---|---|
| API | Next.js API routes + tRPC | End-to-end type safety, no REST boilerplate |
| Database | PostgreSQL (Supabase) | RLS, realtime, storage, auth all in one |
| ORM | Drizzle ORM | Type-safe queries, schema-first, fast |
| Auth | Supabase Auth | OAuth + email/pass + JWT, zero infra to manage |
| File Storage | Supabase Storage | Tied to RLS, CDN delivery, presigned URLs |
| Job Queue | BullMQ + Redis (Upstash) | Async model conversion + AI validation jobs |
| Email | Resend | Developer-friendly, React email templates |
| Payments | Stripe + Stripe Connect | Bounties, escrow, contributor payouts |

### AI

| Tool | Choice | Reason |
|---|---|---|
| Repair agent | Claude API (claude-sonnet-4-6) | Best-in-class reasoning, streaming support |
| Model validation | Claude vision API | Screenshot analysis of 3D renders |
| Embeddings | Voyage AI or OpenAI | Semantic search over resolved threads |
| Vector search | pgvector (Supabase) | Native Postgres extension, no extra infra |

### 3D Conversion Worker

| Tool | Choice | Reason |
|---|---|---|
| Language | Python | Best 3D/CAD library ecosystem |
| Conversion | Blender (headless) or Open CASCADE | STEP / OBJ / FBX → glTF pipeline |
| Hosting | Railway | Persistent workers, Docker deploy, easy scaling |

### Dev Tooling

| Tool | Choice | Reason |
|---|---|---|
| Monorepo | Turborepo | Shared packages, parallel builds, caching |
| Version control | GitHub | Public OSS repo, GitHub Actions CI/CD |
| CI/CD | GitHub Actions | Lint, test, type-check on every PR |
| Testing | Vitest + Playwright | Unit + E2E, both fast, modern |
| Linting | ESLint + Prettier + Husky | Pre-commit hooks enforce code quality |

---

## Deployment

### Hosting Architecture

| Service | What it hosts | Tier |
|---|---|---|
| Vercel | Next.js web app | Pro ($20/mo) |
| Supabase | Postgres DB, Auth, Storage, Realtime | Pro ($25/mo) |
| Railway | Python conversion worker (Docker) | Usage-based (~$10–30/mo) |
| Upstash | Redis for BullMQ job queue | Pay-per-request (~$5/mo) |

### Environments

| Environment | Trigger | Database |
|---|---|---|
| Local (dev) | Manual | Local Supabase or dev project |
| Preview (staging) | Every PR — auto Vercel preview URL | Staging Supabase project |
| Production | Merge to `main` | Production Supabase project |

> Never share a production database with staging.

### Environment Variables

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
UPSTASH_REDIS_URL
UPSTASH_REDIS_TOKEN
```

Store in Vercel env vars (production) and `.env.local` (development). Use Doppler or Vercel's env sync to keep staging and production in sync. **Never commit secrets.**

### CI/CD Pipeline

```
PR opened
  └─ ESLint
  └─ TypeScript type check
  └─ Vitest unit tests
  └─ Drizzle schema validation

Merge to main
  └─ Playwright E2E tests (against staging)
  └─ Drizzle migrate (runs before deploy)
  └─ Vercel production deploy (zero downtime)
  └─ Railway worker redeploy (via webhook)
```

### CDN for 3D Models

- Approved `.glb` files served from Supabase Storage (CDN included)
- Optionally front with Cloudflare free plan for additional edge caching
- glTF files are large — CDN caching is critical for viewer performance

### Monitoring & Observability

| Tool | Purpose |
|---|---|
| Sentry | Frontend JS errors + backend API errors |
| Vercel Analytics | Web vitals and page performance |
| Supabase Dashboard | DB query performance, slow query detection |
| Better Uptime | Uptime monitoring, Discord alerts on downtime |
| Anthropic Dashboard | API cost alerts at $50 / $100 / $200 |
| Stripe Dashboard | Webhook monitoring, failed payout visibility |

---

## Cost Estimate

Monthly costs at public launch:

| Service | Estimated Cost |
|---|---|
| Vercel Pro | $20/mo |
| Supabase Pro | $25/mo |
| Railway (worker) | $10–30/mo |
| Upstash Redis | ~$5/mo |
| Anthropic API | $50–100/mo (variable) |
| Resend | Free tier (3,000 emails/mo) |
| Sentry | Free tier |
| Better Uptime | Free tier |
| **Total** | **~$110–180/mo** |

Costs scale with usage. Anthropic API is the most variable line item — cache aggressively and rate-limit free users.

---

## Contributor Guidelines Summary

1. All model submissions must meet Gate 0 baseline requirements before entering the queue
2. CAD models must include part annotations to pass AI validation
3. Accepted formats: `.glb`, `.gltf`, `.obj`, `.step`
4. Maximum file size: 100MB
5. Device metadata is required: make, model, year, category, description
6. Submitted models grant the platform a perpetual license to host and display the file
7. Contributors retain credit on the device page and earn reputation for approved models
8. The review rubric is public — see `/docs/review-rubric.md`

---

*Last updated: April 2026*  
*Maintained by the core team. Open an issue to propose changes.*
