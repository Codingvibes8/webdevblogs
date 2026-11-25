"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

const PostInput = z.object({
  id: z.coerce.number().int().positive().optional(),
  slug: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens, like tool-calls-are-api-design."),
  issue: z.coerce.number().int().positive("Enter the issue number, like 50."),
  title: z.string().trim().min(3, "Enter a title."),
  dek: z.string().trim().min(10, "Write a one or two sentence standfirst."),
  tags: z
    .string()
    .transform((s) => [...new Set(s.split(",").map((t) => t.trim()).filter(Boolean))])
    .pipe(z.array(z.string().max(24)).min(1, "Add at least one tag.").max(5, "Use five tags or fewer.")),
  body: z.string().trim().min(50, "Write the essay body (Markdown or HTML)."),
  status: z.enum(["draft", "published"]),
});

export type FormState = { errors?: Partial<Record<keyof z.infer<typeof PostInput> | "form", string>> };

export async function savePost(_prev: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await requireAdmin();
  if (!db) return { errors: { form: "Connect a database (DATABASE_URL) before saving posts." } };

  const parsed = PostInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: FormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<FormState["errors"]>;
      errors[key] ??= issue.message;
    }
    return { errors };
  }

  const { id, ...data } = parsed.data;
  const values = { ...data, authorId: userId, publishedAt: data.status === "published" ? new Date() : null };

  try {
    if (id) {
      const [existing] = await db.select({ publishedAt: posts.publishedAt }).from(posts).where(eq(posts.id, id));
      // Keep the original publication date when re-saving a published essay.
      await db
        .update(posts)
        .set({ ...values, publishedAt: data.status === "published" ? (existing?.publishedAt ?? new Date()) : null })
        .where(eq(posts.id, id));
    } else {
      await db.insert(posts).values(values);
    }
  } catch (err) {
    const msg = String(err);
    if (msg.includes("posts_slug_unique")) return { errors: { slug: "Another post already uses this slug." } };
    if (msg.includes("posts_issue_unique")) return { errors: { issue: "Another post already uses this issue number." } };
    throw err;
  }

  updateTag("posts");
  redirect("/admin");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!db || !Number.isInteger(id)) return;
  await db.delete(posts).where(eq(posts.id, id));
  updateTag("posts");
  redirect("/admin");
}
