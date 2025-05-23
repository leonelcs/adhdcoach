// lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get current session server-side (for route handlers and server components)
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}