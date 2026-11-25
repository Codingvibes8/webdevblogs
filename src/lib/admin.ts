import "server-only";
import { auth } from "@clerk/nextjs/server";

/**
 * Only Clerk users listed in ADMIN_USER_IDS can write. Signing in alone is not
 * enough, so a public sign-up page can't hand anyone the keys to the journal.
 */
export async function getAdmin(): Promise<{ userId: string } | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const allowed = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(userId) ? { userId } : null;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("You don’t have permission to edit the journal.");
  return admin;
}
