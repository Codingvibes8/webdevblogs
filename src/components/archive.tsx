"use client";

import Link from "next/link";
import { Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { PostSummary } from "@/lib/posts";
import { fmtDate } from "@/lib/format";
import { PreviewCard, type PreviewCardHandle } from "@/components/preview-card";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps every occurrence of the search terms in <mark>. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}

const headOf = (p: PostSummary) => `${p.title} ${p.dek} ${p.tags.join(" ")}`.toLowerCase();

/** A short excerpt around the first term that only appears in the body. */
function snippet(p: PostSummary, terms: string[]) {
  const head = headOf(p);
  const t = terms.find((x) => !head.includes(x));
  if (!t) return "";
  const lower = p.text.toLowerCase();
  const i = lower.indexOf(t);
  if (i < 0) return "";
  const a = Math.max(0, p.text.lastIndexOf(" ", Math.max(0, i - 48)));
  const bRaw = p.text.indexOf(" ", Math.min(p.text.length, i + t.length + 56));
  const b = bRaw < 0 ? p.text.length : bRaw;
  return `${a > 0 ? "…" : ""}${p.text.slice(a, b).trim()}${b < p.text.length ? "…" : ""}`;
}

export function Archive({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<PreviewCardHandle>(null);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => p.tags.forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)));
    return counts;
  }, [posts]);
  const tags = useMemo(
    () => Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a] || a.localeCompare(b)),
    [tagCounts],
  );

  const terms = useMemo(() => deferredQuery.toLowerCase().split(/\s+/).filter(Boolean), [deferredQuery]);
  const visible = useMemo(
    () =>
      posts.filter(
        (p) =>
          (tag === "All" || p.tags.includes(tag)) &&
          terms.every((t) => headOf(p).includes(t) || p.text.toLowerCase().includes(t)),
      ),
    [posts, tag, terms],
  );

  // The reader links to /?tag=AI; pick that up without making the page dynamic.
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get("tag");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl && posts.some((p) => p.tags.includes(fromUrl))) setTag(fromUrl);
  }, [posts]);

  // "/" focuses search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || (el && /input|textarea|select/i.test(el.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => cardRef.current?.hide(), [visible]);

  const clearAll = () => {
    setQuery("");
    setTag("All");
    inputRef.current?.focus();
  };

  const trimmed = deferredQuery.trim();

  return (
    <section className="archive" aria-labelledby="archive-h">
      <div className="archive-head">
        <h2 id="archive-h">
          The Archive <em>in reverse order</em>
        </h2>
        <div className="search">
          <label className="lab" htmlFor="q">
            Search titles, tags and full text
          </label>
          <input
            ref={inputRef}
            id="q"
            type="search"
            placeholder="cascade, evals, yield…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
          />
          <kbd aria-hidden="true">/</kbd>
        </div>
      </div>

      <ul className="chips" aria-label="Filter by topic">
        {["All", ...tags].map((t) => (
          <li key={t}>
            <button type="button" className="chip" aria-pressed={t === tag} onClick={() => setTag(t)}>
              {t}
              <sup>{t === "All" ? posts.length : tagCounts[t]}</sup>
            </button>
          </li>
        ))}
      </ul>

      <p className="status" aria-live="polite">
        Showing <b>{visible.length}</b> of {posts.length} essays
        {tag !== "All" && (
          <>
            {" "}
            · tagged <b>{tag}</b>
          </>
        )}
        {trimmed && (
          <>
            {" "}
            · matching <b>“{trimmed}”</b>
          </>
        )}
      </p>

      <ul
        className="rows"
        onPointerMove={(e) => {
          const row = (e.target as HTMLElement).closest<HTMLElement>(".row");
          const post = row ? posts.find((p) => p.slug === row.dataset.slug) : undefined;
          cardRef.current?.track(e.nativeEvent, post);
        }}
        onPointerLeave={() => cardRef.current?.hide()}
      >
        {visible.length === 0 ? (
          <li className="empty">
            <p>
              Nothing in the archive matches{trimmed ? ` “${trimmed}”` : ""}
              {tag !== "All" ? ` under ${tag}` : ""}.
            </p>
            <button className="link-btn" type="button" onClick={clearAll}>
              Clear search and filters
            </button>
          </li>
        ) : (
          visible.map((p) => {
            const hit = terms.length ? snippet(p, terms) : "";
            return (
              <li key={p.slug}>
                <Link className="row" href={`/posts/${p.slug}`} data-slug={p.slug}>
                  <span className="r-no">No. {p.no}</span>
                  <span className="r-main">
                    <span className="r-title">
                      <Highlight text={p.title} terms={terms} />
                    </span>
                    <span className="r-dek">
                      <Highlight text={p.dek} terms={terms} />
                    </span>
                    {hit && (
                      <span className="r-hit">
                        <Highlight text={hit} terms={terms} />
                      </span>
                    )}
                  </span>
                  <span className="r-tags">
                    <Highlight text={p.tags.join(" · ")} terms={terms} />
                  </span>
                  <span className="r-date">{fmtDate(p.date)}</span>
                  <span className="r-min">{p.minutes} min</span>
                </Link>
              </li>
            );
          })
        )}
      </ul>

      <PreviewCard ref={cardRef} />
    </section>
  );
}
