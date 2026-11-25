"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const REST = 330;
const MAX = 900;

/**
 * The masthead. Each letter gains weight (and softness) as the cursor passes,
 * then eases back. Letter centres are measured at rest so a swelling letter
 * pushing its neighbours never feeds back into the calculation.
 */
export function Masthead({ word }: { word: string }) {
  const zoneRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    const mast = wordRef.current;
    if (!zone || !mast) return;
    const letters = Array.from(mast.querySelectorAll<HTMLSpanElement>(".ch"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const cur = letters.map(() => REST);
    const tgt = letters.map(() => REST);
    let centers: { x: number; y: number }[] = [];
    let fontPx = 100;
    let raf = 0;
    let sweep = 0;

    const apply = (i: number) => {
      const w = cur[i];
      const k = (w - REST) / (MAX - REST);
      letters[i].style.fontVariationSettings = `"wght" ${w.toFixed(1)}, "opsz" 144, "SOFT" ${(k * 100).toFixed(0)}, "WONK" ${k > 0.55 ? 1 : 0}`;
    };
    const measure = () => {
      letters.forEach((l) => (l.style.fontVariationSettings = ""));
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
      });
      fontPx = parseFloat(getComputedStyle(mast).fontSize) || 100;
      letters.forEach((_, i) => apply(i));
    };
    const step = () => {
      raf = 0;
      const ease = reduce.matches ? 1 : 0.16;
      let moving = false;
      for (let i = 0; i < letters.length; i++) {
        const d = tgt[i] - cur[i];
        if (Math.abs(d) > 0.4) {
          cur[i] += d * ease;
          moving = true;
        } else cur[i] = tgt[i];
        apply(i);
      }
      if (moving) kick();
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const aimAt = (x: number, y: number) => {
      const R = fontPx * 1.5;
      centers.forEach((c, i) => {
        const d = Math.hypot(x - c.x, (y - c.y) * 1.25);
        const t = Math.max(0, 1 - d / R);
        tgt[i] = REST + (MAX - REST) * t * t * (3 - 2 * t);
      });
      kick();
    };
    const release = () => {
      tgt.fill(REST);
      kick();
    };
    const onMove = (e: PointerEvent) => aimAt(e.clientX + scrollX, e.clientY + scrollY);

    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerdown", onMove);
    zone.addEventListener("pointerleave", release);
    zone.addEventListener("pointercancel", release);

    let resizeT: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(measure, 120);
    };
    addEventListener("resize", onResize);
    // The masthead shrinks on reader and editor pages (pure CSS, see .masthead
    // in globals.css), so re-measure whenever its box changes size.
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeT);
      resizeT = setTimeout(measure, 120);
    });
    ro.observe(mast);

    document.fonts.ready.then(() => {
      measure();
      const compact = !!document.querySelector(".reader, .admin");
      if (reduce.matches || compact || !centers.length || sessionStorageGet("rt-swept")) return;
      sessionStorageSet("rt-swept", "1");
      const x0 = centers[0].x - fontPx;
      const x1 = centers[centers.length - 1].x + fontPx;
      const y = centers[0].y;
      const t0 = performance.now();
      const frame = (t: number) => {
        const p = Math.min(1, (t - t0) / 1500);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        aimAt(x0 + (x1 - x0) * e, y);
        if (p < 1) sweep = requestAnimationFrame(frame);
        else release();
      };
      sweep = requestAnimationFrame(frame);
    });

    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerdown", onMove);
      zone.removeEventListener("pointerleave", release);
      zone.removeEventListener("pointercancel", release);
      removeEventListener("resize", onResize);
      clearTimeout(resizeT);
      ro.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sweep);
    };
  }, []);

  return (
    <header ref={zoneRef} className="masthead">
      <Link className="mast-link" href="/" aria-label={`The ${word}, back to the archive`}>
        <span className="mast-the" aria-hidden="true">
          The
        </span>
        <h1 ref={wordRef} className="mast" aria-label={`The ${word}`}>
          {[...word].map((ch, i) =>
            ch === " " ? (
              <span key={i} className="sp" aria-hidden="true">
                {" "}
              </span>
            ) : (
              <span key={i} className="ch" aria-hidden="true">
                {ch}
              </span>
            ),
          )}
        </h1>
      </Link>
    </header>
  );
}

function sessionStorageGet(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function sessionStorageSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}
