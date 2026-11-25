import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getAdmin } from "@/lib/admin";
import { deletePost } from "@/app/admin/actions";
import { PostForm } from "@/components/post-form";
import { Button } from "@/components/ui/button";

export default function EditPage({ params }: PageProps<"/admin/[slug]">) {
  return (
    <Suspense fallback={<p className="font-mono text-sm text-muted-foreground">Opening the draft…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/[slug]">["params"] }) {
  const { slug } = await params;
  const admin = await getAdmin();
  if (!admin) notFound();
  if (!db) {
    return (
      <p className="max-w-prose text-lg">
        Connect a database to write posts. See <Link href="/admin">the editor’s desk</Link> for the steps.
      </p>
    );
  }

  const isNew = slug === "new";
  const [row] = isNew ? [] : await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  if (!isNew && !row) notFound();
  const [latest] = isNew ? await db.select({ issue: posts.issue }).from(posts).orderBy(desc(posts.issue)).limit(1) : [];

  return (
    <section className="flex flex-col gap-6">
      <div className="border-b border-rule pb-4">
        <Link href="/admin" className="font-mono text-[0.8125rem] text-muted-foreground no-underline">
          ← Editor’s desk
        </Link>
        <h2 className="font-display text-4xl">{isNew ? "A new essay" : `Editing No. ${String(row.issue).padStart(3, "0")}`}</h2>
      </div>
      <PostForm
        initial={
          row
            ? { id: row.id, slug: row.slug, issue: row.issue, title: row.title, dek: row.dek, tags: row.tags, body: row.body, status: row.status }
            : { slug: "", issue: (latest?.issue ?? 0) + 1, title: "", dek: "", tags: [], body: "", status: "draft" }
        }
      />
      {row && (
        <form action={deletePost} className="border-t border-rule pt-4">
          <input type="hidden" name="id" value={row.id} />
          <Button variant="outline" type="submit" className="text-destructive">
            Delete this essay
          </Button>
        </form>
      )}
    </section>
  );
}
