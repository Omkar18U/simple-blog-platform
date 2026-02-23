import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/** Get current session on server (pages/layouts) */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as
    | { id: string; name: string; email: string; role: string; image?: string }
    | undefined;
}

/** Require authentication — redirects to /login if not logged in */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require admin role — redirects to / if not admin */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
