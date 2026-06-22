# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Academic portfolio for Dr. Kishora Nayak (Assistant Professor, Physics, Panchayat College Bargarh). A single-page React site plus an interactive "MSc Physics Computer Programming Laboratory" of numerical-methods simulators, an OpenAI-backed chatbot, and a contact form.

## Repository layout

The repo has **two `package.json` files**. The root one is a thin wrapper; the real app lives in `client/`.

- **`client/`** — the actual application. React 18 + TypeScript + Vite frontend AND the Express server. All dependencies are declared here (`client/package.json`).
- **`server/`** — Express server source (`index.ts`, `routes.ts`, `storage.ts`, `chatbot-knowledge.ts`, `vite.ts`). Resolved at runtime relative to repo root.
- **`shared/`** — `schema.ts`: Drizzle table definitions + drizzle-zod insert schemas, shared between client and server via the `@shared` alias.
- **`attached_assets/`** — PDFs, CVs, and images served at `/attached_assets/*`. Copied into `client/public/` at build time by `client/scripts/copy-attached-assets.cjs`.

## Commands

Run from the **repo root** unless noted:

```bash
npm run dev          # Dev server (Express + Vite middleware) on http://localhost:5000
```

Inside `client/` (where deps live):

```bash
cd client
npm install
npm run check        # tsc type-check of client/src (noEmit). No test runner or linter is configured.
npm run check:server # tsc type-check of server/ + shared/ (via tsconfig.server.json)
npm run check:all    # runs both checks
npm run db:push      # drizzle-kit push — sync schema.ts to the database
npm run vercel-build # Production build: copy assets + vite build → client/dist
```

There is **no test suite and no linter**. `npm run check` (tsc) is the verification gate. It type-checks `client/src` (the code that actually gets built/deployed). Because all runtime deps live in `client/node_modules`, `server/` and `shared/` can't resolve their imports from a check run inside `client/`; `tsconfig.server.json` fixes this with a `paths` fallback to `client/node_modules`, and `npm run check:server` uses it. Use `npm run check:all` to verify everything.

## Architecture

### Dev vs. production are different runtimes

- **Local dev** (`npm run dev`): `server/index.ts` runs via `tsx`, serves both the API and the client. Vite runs as Express middleware (`setupVite` in `server/vite.ts`). Everything is on port **5000**.
- **Production** (Vercel, `vercel.json`): a **static-only** deploy of `client/dist`. The Express server is **not** deployed — there are no Vercel serverless functions. `vercel.json` rewrites everything except `/api` and `/attached_assets` to `index.html` (SPA routing). Consequence: **`/api/*` endpoints (chatbot, contact, admin) do not work in production** as currently configured; they only function in local dev. Keep this in mind before relying on server endpoints for deployed behavior.

### Client routing (Wouter)

Routes are declared in `client/src/App.tsx`. Wouter matches in order, so static routes must precede dynamic `/:id` routes:

- `/` — `Homepage` (section components: hero, about, research, publications, teaching, contact, footer)
- `/admin` — contact-message inbox
- `/teaching/computer-programming` — `LabHome` (lab dashboard)
- `/teaching/computer-programming/comparison` — `ComparisonDashboard` (must come before `:id`)
- `/teaching/computer-programming/:id` — `ExperimentPage`

The `<Chatbot />` is mounted globally outside the router.

### The Lab feature

The numerical-methods lab is the most complex part of the frontend.

- **`client/src/lib/lab/registry.ts`** — the source of truth: `MODULES` (8 dashboard categories) and `EXPERIMENTS` (the master list). Each experiment has `status: "complete" | "soon"`; `"soon"` ones render a placeholder. Helpers `getExperiment(id)` / `getNeighbors(id)` drive page lookup and prev/next nav.
- **`client/src/lib/lab/{numerics,expr}.ts`** — numerical algorithms and a math-expression evaluator powering the live simulators.
- **`client/src/lib/lab/types.ts`** — `ExperimentMeta`, `LabModule`, etc.
- **`client/src/components/lab/`** — reusable simulator UI (`ExperimentScaffold`, `SimLayout`, `LabShell`, `ParamControl`, `ResultsTable`, `Charts`, `Pseudocode`, `VivaAccordion`, `PracticeProblems`). New experiments are composed from these, not built from scratch.

To add an experiment: add/flip its entry in `registry.ts` and build its page from the `lab/` scaffold components.

### Server

- **`server/routes.ts`** — all API routes: `POST /api/contact`, `GET /api/admin/messages`, `PATCH /api/admin/messages/:id/read`, `GET /api/download-publications`, `POST /api/chatbot`.
- **Chatbot** (`POST /api/chatbot`) calls OpenAI `gpt-4o` with an inline system prompt about Dr. Nayak. On any OpenAI error it falls back to hardcoded keyword-matched canned replies — so it degrades gracefully without `OPENAI_API_KEY`. Additional structured knowledge lives in `server/chatbot-knowledge.ts`.
- **Storage** (`server/storage.ts`) is an in-memory `MemStorage` (`IStorage` interface). Contact messages and users live in `Map`s and **do not persist across restarts**. Drizzle/Postgres schema exists in `shared/schema.ts` but storage is not yet wired to a real DB.

### Path aliases

Defined in both `client/vite.config.ts` and `client/tsconfig.json`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets` (Vite only)

### UI conventions

shadcn/ui components in `client/src/components/ui/` (config in `components.json`), Radix primitives, Tailwind CSS, Framer Motion for animation, TanStack Query for server state, React Hook Form + Zod for forms. Custom scroll/section animations are initialized once via `initAnimations()` in `client/src/lib/animations.ts`.

## Environment

- `OPENAI_API_KEY` — chatbot; optional (falls back to canned replies).
- `DATABASE_URL` — Neon Postgres, used by `drizzle.config.ts` / `db:push`; not required for dev since storage is in-memory.

## Notes

- `replit.md` documents the original Replit-era design intent and is somewhat aspirational (e.g. it describes planned PostgreSQL persistence that isn't wired up). Treat this file as ground truth where they disagree.
- The OpenAI model is pinned to `gpt-4o` in `routes.ts` with a comment not to change it without explicit request.
