"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import type { PostSummary } from "@/lib/posts";
import { fmtDate } from "@/lib/format";

export type PreviewCardHandle = {
  track: (e: PointerEvent, post: PostSummary | undefined) => void;
  hide: () => void;
};

/**
 * An index card that trails the cursor across the archive. Position eases
 * toward the pointer each frame and tilts with the lag, like paper being
 * dragged. Mouse and trackpad only; touch users get the plain list.
 */
export function PreviewCard({ ref }: { ref: Ref<PreviewCardHandle> }) {
  const el = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<PostSummary | null>(null);
  const s = useRef({ on: false, px: 0, py: 0, cx: 0, cy: 0, raf: 0, w: 320, h: 240 });

  useEffect(() => {
    const st = s.current;
    if (el.current && post) {
      st.w = el.current.offsetWidth;
      st.h = el.current.offsetHeight;
    }
  }, [post]);

  useEffect(() => {
    const st = s.current;
    const onScroll = () => {
      if (st.on) hideCard();
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(st.raf);
    };
  }, []);

  function step() {
    const st = s.current;
    st.raf = 0;
    const card = el.current;
    if (!card) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const k = reduce ? 1 : 0.17;
    st.cx += (st.px - st.cx) * k;
    st.cy += (st.py - st.cy) * k;
    const gap = 28;
    let x = st.cx + gap;
    if (x + st.w > innerWidth - 12) x = st.cx - st.w - gap;
    const y = Math.max(12, Math.min(innerHeight - st.h - 12, st.cy - st.h * 0.3));
    const tilt = reduce ? 0 : Math.max(-7, Math.min(7, (st.px - st.cx) * 0.06));
    card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    if (st.on && (Math.abs(st.px - st.cx) > 0.3 || Math.abs(st.py - st.cy) > 0.3)) st.raf = requestAnimationFrame(step);
  }

  function hideCard() {
    s.current.on = false;
    el.current?.classList.remove("on");
  }

  useImperativeHandle(ref, () => ({
    track(e, next) {
      const st = s.current;
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (e.pointerType !== "mouse" && !fine) return;
      st.px = e.clientX;
      st.py = e.clientY;
      if (!next) return hideCard();
      setPost((prev) => (prev?.slug === next.slug ? prev : next));
      if (!st.on) {
        st.cx = st.px;
        st.cy = st.py;
        st.on = true;
        el.current?.classList.add("on");
      }
      if (!st.raf) st.raf = requestAnimationFrame(step);
    },
    hide: hideCard,
  }));

  return (
    <div ref={el} className="peek" aria-hidden="true">
      {post && (
        <>
          <div className="p-tag">{post.tags.join(" · ")}</div>
          <div className="p-no">No. {post.no}</div>
          <div className="p-title">{post.title}</div>
          <p className="p-first">{post.first}</p>
          <div className="p-foot">
            <span>{fmtDate(post.date)}</span>
            <span>
              {post.minutes} min · {post.words.toLocaleString("en-GB")} words
            </span>
          </div>
        </>
      )}
    </div>
  );
}
