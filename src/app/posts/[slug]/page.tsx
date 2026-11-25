import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/reading-progress";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { fmtDate } from "@/lib/format";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return post ? { title: post.title, description: post.dek } : {};
}

export default async function PostPage({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPostBySlug(slug), getPublishedPosts()]);
  if (!post) notFound();

  const i = all.findIndex((p) => p.slug === post.slug);
  const newer = i > 0 ? all[i - 1] : undefined;
  const older = i >= 0 ? all[i + 1] : undefined;
  const tagCounts: Record<string, number> = {};
  all.forEach((p) => p.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] ?? 0) + 1)));

  return (
    <article className="reader">
      <ReadingProgress targetId="essay" />
      <Link className="back" href="/">
        ← Back to the archive
      </Link>
      <header className="r-head">
        <div className="kicker">
          No. {post.no} — {post.tags.join(" · ")}
        </div>
        <h1>{post.title}</h1>
        <p className="dek">{post.dek}</p>
        <dl className="meta">
          <div>
            <dt>Published</dt>
            <dd>{fmtDate(post.date, true)}</dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>{post.minutes} minutes</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>{post.words.toLocaleString("en-GB")} words</dd>
          </div>
          <div>
            <dt>Written by</dt>
            <dd>Dayo</dd>
          </div>
        </dl>
      </header>

      {/* Bodies are written by signed-in admins only (see src/app/admin). */}
      <div
        id="essay"
        className="prose"
        dangerouslySetInnerHTML={{
          __html: `${post.html}<p><span class="end" aria-label="End of essay">∎</span></p>`,
        }}
      />

      <footer className="r-foot">
        <span className="lab">Filed under</span>
        <div className="r-tags-list">
          {post.tags.map((t) => (
            <Link key={t} className="chip" href={`/?tag=${encodeURIComponent(t)}`}>
              {t}
              <sup>{tagCounts[t]}</sup>
            </Link>
          ))}
        </div>
        <nav className="pn" aria-label="More essays">
          {older ? (
            <Link href={`/posts/${older.slug}`}>
              <span>← Older · No. {older.no}</span>
              <span>{older.title}</span>
            </Link>
          ) : (
            <span className="ghost" />
          )}
          {newer && (
            <Link href={`/posts/${newer.slug}`}>
              <span>Newer · No. {newer.no} →</span>
              <span>{newer.title}</span>
            </Link>
          )}
        </nav>
      </footer>
    </article>
  );
}
