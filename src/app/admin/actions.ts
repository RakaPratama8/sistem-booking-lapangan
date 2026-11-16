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
  const db = createAdminClient();
  let query = db.from("bookings").update({ status }).eq("id", String(form.get("id")));
  if (from) query = query.eq("status", from);
  const { data, error } = await query.select("date, start_hour");
  // 23505 = unique violation: another booking is already approved for this slot.
  if (error) redirect(`/admin?error=${error.code === "23505" ? "taken" : "failed"}`);
  // First come, first served: approving one request settles the slot, so the other pending ones for it are rejected.
  const won = data?.[0];
  if (status === "approved" && won) {
    const { error: rejectError } = await db
      .from("bookings")
      .update({ status: "rejected" })
      .eq("date", won.date)
      .eq("start_hour", won.start_hour)
      .eq("status", "pending");
    if (rejectError) redirect("/admin?error=failed");
  }
  redirect("/admin");
}

export const approveBooking = async (form: FormData) => setStatus(form, "approved");
export const rejectBooking = async (form: FormData) => setStatus(form, "rejected");
export const cancelBooking = async (form: FormData) => setStatus(form, "cancelled", "approved");
