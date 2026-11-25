import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) await auth.protect();
});

// Only the editor needs a session on the server. Keeping Clerk off the public
// pages lets the archive and essays stay fully static.
export const config = {
  matcher: ["/admin(.*)", "/(api|trpc)(.*)"],
};
