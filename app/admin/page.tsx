import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import AdminPanel from "./AdminPanel";

/**
 * /admin — Server component.
 * Verifies admin role (proxy also guards, but belt-and-suspenders).
 * Renders the client-side AdminPanel component.
 */
export default async function AdminPage() {
  const session = await getSessionFromCookie();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  return <AdminPanel adminName={session.name} adminEmail={session.email} />;
}
