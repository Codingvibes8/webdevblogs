import { Suspense } from "react";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getAdmin } from "@/lib/admin";
import { fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="font-mono text-sm text-muted-foreground">Checking your access…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const admin = await getAdmin();
  if (!admin) return <NotAllowed />;

  const rows = db ? await db.select().from(posts).orderBy(desc(posts.issue)) : [];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
        <div>
          <p className="font-mono text-[0.8125rem] text-muted-foreground">Editor’s desk</p>
          <h2 className="font-display text-4xl">All issues</h2>
        </div>
        <div className="flex items-center gap-3">
          {db && (
            <Button asChild>
              <Link href="/admin/new">Write a new essay</Link>
            </Button>
          )}
          <UserButton />
        </div>
      </div>

      {!db ? (
        <p className="max-w-prose text-lg">
          No database is connected, so the site is serving the launch essays from <code>src/content/seed-posts.ts</code>.
          Add <code>DATABASE_URL</code> to <code>.env</code>, run <code>npm run db:push</code> and <code>npm run db:seed</code>, and
          this page will list them for editing.
        </p>
      ) : (
        <ul className="border-t border-foreground">
          {rows.map((p) => (
            <li key={p.id} className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-rule py-3">
              <span className="font-mono text-[0.8125rem] text-muted-foreground">No. {String(p.issue).padStart(3, "0")}</span>
              <Link href={`/admin/${p.slug}`} className="font-display text-xl no-underline hover:text-accent">
                {p.title}
              </Link>
              <span className="font-mono text-[0.8125rem] text-muted-foreground">
                {p.status === "published" && p.publishedAt ? fmtDate(p.publishedAt.toISOString()) : "Draft"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function NotAllowed() {
  return (
    <div className="flex max-w-prose flex-col gap-4">
      <h2 className="font-display text-3xl">This desk is for the editor</h2>
      <p>
        You’re signed in, but your account isn’t on the editor list. Add your Clerk user id to <code>ADMIN_USER_IDS</code> in
        the environment and reload.
      </p>
      <UserButton />
    </div>
  );
}
