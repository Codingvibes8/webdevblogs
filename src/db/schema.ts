import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  /** The journal's running issue number, shown as "No. 049". */
  issue: integer("issue").notNull().unique(),
  title: text("title").notNull(),
  dek: text("dek").notNull(),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  /** Markdown, or HTML when the body starts with a tag. */
  body: text("body").notNull(),
  status: postStatus("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorId: text("author_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type PostRow = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
