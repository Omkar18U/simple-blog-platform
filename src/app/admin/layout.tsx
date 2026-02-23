import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin check — redirects non-admins to "/"
  await requireAdmin();

  return <>{children}</>;
}
