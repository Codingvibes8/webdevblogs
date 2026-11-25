"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const roman = (n: number) =>
  ([[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]] as const).reduce((s, [v, r]) => {
    while (n >= v) {
      s += r;
      n -= v;
    }
    return s;
  }, "");

/** The date line in the top strip. Rendered on the client so the static shell never goes stale. */
export function TodaysDate() {
  const label = useSyncExternalStore(
    subscribe,
    () => {
      const now = new Date();
      return `Vol. ${roman(now.getFullYear() - 2018)} · ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;
    },
    () => "Vol. —",
  );
  return <span>{label}</span>;
}
