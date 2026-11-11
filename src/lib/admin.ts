import { redirect } from "next/navigation";
import { createAuthClient } from "./supabase/server";

/** Call at the top of every admin page and action. Redirects to login unless the user is the admin. */
export async function requireAdmin() {
  const { data } = await (await createAuthClient()).auth.getUser();
  if (!data.user || data.user.email !== process.env.ADMIN_EMAIL) redirect("/admin/login");
}
