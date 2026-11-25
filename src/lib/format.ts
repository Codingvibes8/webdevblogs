export const fmtDate = (iso: string, long = false) =>
  new Date(iso).toLocaleDateString(
    "en-GB",
    long
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
      : { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
