import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { posts } from "../src/db/schema";
import { seedPosts } from "../src/content/seed-posts";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL in .env before seeding.");
  const db = drizzle(neon(url));
  for (const post of seedPosts) {
    await db
      .insert(posts)
      .values(post)
      .onConflictDoUpdate({
        target: posts.slug,
        set: { title: post.title, dek: post.dek, tags: post.tags, body: post.body, issue: post.issue, status: post.status, publishedAt: post.publishedAt },
      });
    console.log(`Seeded No. ${String(post.issue).padStart(3, "0")} ${post.title}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
