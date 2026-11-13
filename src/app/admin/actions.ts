"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient, createAuthClient } from "@/lib/supabase/server";

export async function login(form: FormData) {
  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  });
  // A valid Supabase user who isn't the admin gets no access.
  if (error || data.user.email !== process.env.ADMIN_EMAIL) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logout() {
  await (await createAuthClient()).auth.signOut();
  redirect("/admin/login");
}

// `from` limits the update to rows currently in that status (a stale page can't re-cancel or resurrect a row).
async function setStatus(form: FormData, status: "approved" | "rejected" | "cancelled", from?: "approved") {
  await requireAdmin();
  let query = createAdminClient().from("bookings").update({ status }).eq("id", String(form.get("id")));
  if (from) query = query.eq("status", from);
  const { error } = await query;
  // 23505 = unique violation: another booking is already approved for this slot.
  if (error) redirect(`/admin?error=${error.code === "23505" ? "taken" : "failed"}`);
  redirect("/admin");
}

export const approveBooking = async (form: FormData) => setStatus(form, "approved");
export const rejectBooking = async (form: FormData) => setStatus(form, "rejected");
export const cancelBooking = async (form: FormData) => setStatus(form, "cancelled", "approved");
