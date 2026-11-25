import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editor", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin pt-8">{children}</div>;
}
