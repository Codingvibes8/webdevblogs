import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { desc, eq, and } from "drizzle-orm";
import { marked } from "marked";
import { db } from "@/db";
import { posts, type PostRow } from "@/db/schema";
import { seedPosts } from "@/content/seed-posts";

export type Post = {
  slug: string;
  issue: number;
  no: string;
  title: string;
  dek: string;
  tags: string[];
  date: string;
  html: string;
  /** Plain text of the body, used by full-text search and the preview card. */
  text: string;
  first: string;
  words: number;
  minutes: number;
};

/** What the archive needs on the client: everything except the rendered body. */
export type PostSummary = Omit<Post, "html">;

type Source = Pick<PostRow, "slug" | "issue" | "title" | "dek" | "tags" | "body" | "publishedAt">;

const decode = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

function toPost(row: Source): Post {
  const raw = row.body.trim();
  const html = raw.startsWith("<") ? raw : (marked.parse(raw, { async: false }) as string);
  const text = decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const firstMatch = html.match(/<p>([\s\S]*?)<\/p>/);
  const first = firstMatch ? decode(firstMatch[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim() : "";
  const words = text ? text.split(" ").length : 0;
  return {
    slug: row.slug,
    issue: row.issue,
    no: String(row.issue).padStart(3, "0"),
    title: row.title,
    dek: row.dek,
    tags: row.tags,
    date: (row.publishedAt ?? new Date(0)).toISOString(),
    html,
    text,
    first,
    words,
    minutes: Math.max(1, Math.round(words / 230)),
  };
}

const fromSeed = () =>
  seedPosts
    .filter((p) => p.status === "published")
    .map((p) => toPost({ ...p, tags: p.tags ?? [], publishedAt: p.publishedAt ?? null }))
    .sort((a, b) => b.issue - a.issue);

export async function getPublishedPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  if (!db) return fromSeed();
  const rows = await db.select().from(posts).where(eq(posts.status, "published")).orderBy(desc(posts.issue));
  return rows.map(toPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", `post:${slug}`);
  if (!db) return fromSeed().find((p) => p.slug === slug) ?? null;
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);
  return row ? toPost(row) : null;
}

export function summarise(post: Post): PostSummary {
  const { html, ...rest } = post;
  void html;
  return rest;
}
