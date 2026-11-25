"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePost, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Initial = {
  id?: number;
  slug: string;
  issue: number;
  title: string;
  dek: string;
  tags: string[];
  body: string;
  status: "draft" | "published";
};

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="font-mono text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="font-mono text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function PostForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePost, {});
  const e = state.errors ?? {};
  const invalid = (k: keyof typeof e) => (e[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {e.form && (
        <p role="alert" className="border-l-2 border-destructive pl-3 font-mono text-sm text-destructive">
          {e.form}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <Field id="issue" label="Issue no." error={e.issue}>
          <Input id="issue" name="issue" type="number" inputMode="numeric" defaultValue={initial.issue} {...invalid("issue")} />
        </Field>
        <Field id="slug" label="Slug" error={e.slug} hint="Becomes /posts/your-slug">
          <Input id="slug" name="slug" defaultValue={initial.slug} className="font-mono" {...invalid("slug")} />
        </Field>
      </div>

      <Field id="title" label="Title" error={e.title}>
        <Input id="title" name="title" defaultValue={initial.title} className="font-display text-2xl" {...invalid("title")} />
      </Field>

      <Field id="dek" label="Standfirst" error={e.dek} hint="One or two sentences shown under the title and in the archive.">
        <Textarea id="dek" name="dek" defaultValue={initial.dek} className="min-h-20 font-serif text-base" {...invalid("dek")} />
      </Field>

      <Field id="tags" label="Tags" error={e.tags} hint="Comma separated, e.g. AI, TypeScript">
        <Input id="tags" name="tags" defaultValue={initial.tags.join(", ")} className="font-mono" {...invalid("tags")} />
      </Field>

      <Field
        id="body"
        label="Body"
        error={e.body}
        hint="Markdown. Paste HTML instead if you want margin notes (<aside class=&quot;note&quot;>)."
      >
        <Textarea id="body" name="body" defaultValue={initial.body} className="min-h-[28rem]" {...invalid("body")} />
      </Field>

      <fieldset className="flex flex-wrap items-center gap-6">
        <legend className="mb-2 font-mono text-[0.8125rem] text-muted-foreground">Status</legend>
        {(["draft", "published"] as const).map((s) => (
          <label key={s} className="flex items-center gap-2 font-mono text-sm capitalize">
            <input type="radio" name="status" value={s} defaultChecked={initial.status === s} className="accent-[var(--accent)]" />
            {s}
          </label>
        ))}
      </fieldset>

      <div className="flex gap-3 border-t border-foreground pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save post"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
