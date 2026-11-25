"use client";

import { useEffect, useRef } from "react";

/** A thin ink line at the top of the window that fills as you read the essay body. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => {
      const art = document.getElementById(targetId);
      if (!art || !bar.current) return;
      const top = art.getBoundingClientRect().top + scrollY - innerHeight * 0.3;
      const total = art.offsetHeight - innerHeight * 0.5;
      const p = Math.max(0, Math.min(1, (scrollY - top) / Math.max(1, total)));
      bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [targetId]);
  return (
    <div className="progress" aria-hidden="true">
      <i ref={bar} />
    </div>
  );
}
