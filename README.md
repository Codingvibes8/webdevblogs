# The Render Tree

A personal journal for a web developer, written about the web platform and building with AI. It is set like a printed journal: warm paper, a big variable-font serif masthead, mono metadata and ruled lines.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · shadcn/ui · Drizzle ORM on Neon Postgres · Clerk

## What's in it

- **Masthead** (`src/components/masthead.tsx`): each letter of “Render Tree” gains weight and softness as the cursor passes, using Fraunces’ `wght`, `SOFT` and `WONK` axes.
- **Archive** (`src/components/archive.tsx`): full-text search across titles, standfirsts, tags and essay bodies with highlighted matches, plus topic filters. Press `/` to search and `Esc` to clear.
- **Preview card** (`src/components/preview-card.tsx`): an index card that trails the cursor across the archive and tilts with the lag. Mouse and trackpad only.
- **Reader** (`src/app/posts/[slug]/page.tsx`): drop cap, numbered sections, margin notes hung in the right margin on wide screens, a reading progress line and older/newer navigation.
- **Night edition**: light and dark themes through `next-themes`, following the system setting until you choose.
- **Editor’s desk** (`/admin`): Clerk-protected form to write, edit, publish and delete essays in Markdown (or HTML for margin notes). Only Clerk users listed in `ADMIN_USER_IDS` can save.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Without `DATABASE_URL`, the site serves the nine launch essays from `src/content/seed-posts.ts`, so you can work on the design straight away.

### Connect Neon

1. Create a Neon project and copy its connection string into `DATABASE_URL`.
2. `npm run db:push` creates the `posts` table.
3. `npm run db:seed` loads the launch essays.

Drizzle reads `.env` for these scripts, so either copy `DATABASE_URL` into `.env` too or run them with the variable exported.

### Connect Clerk

1. Create a Clerk application and copy its publishable and secret keys.
2. Sign in once at `/admin`, copy your user id from the Clerk dashboard, and put it in `ADMIN_USER_IDS`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:generate` | Generate SQL migrations into `drizzle/` |
| `npm run db:seed` | Upsert the launch essays |
| `npm run db:studio` | Open Drizzle Studio |

## Where things live

```
src/
  app/
    page.tsx                 archive
    posts/[slug]/page.tsx    reader
    admin/                   editor's desk, server actions
    globals.css              journal tokens, shadcn tokens, components
  components/                masthead, archive, preview card, theme, ui/
  content/seed-posts.ts      launch essays
  db/                        Drizzle schema and Neon client
  lib/posts.ts               cached reads ("use cache", tag "posts")
  proxy.ts                   Clerk, scoped to /admin
```

Published essays are cached for an hour and refreshed immediately when you save in the editor (`updateTag("posts")`).

## Notes

- The shadcn components in `src/components/ui` follow the standard shadcn source and `components.json` is set up, so `npx shadcn add <component>` works for anything else you need.
- Essay bodies are rendered as HTML. Only allow-listed editors can write them; don’t open the editor to untrusted authors without adding sanitisation.
