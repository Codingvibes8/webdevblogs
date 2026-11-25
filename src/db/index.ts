import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

/** `null` when no database is configured; the site then serves the seed essays. */
export const db = url ? drizzle(neon(url), { schema }) : null;
