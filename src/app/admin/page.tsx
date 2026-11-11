import AdminDashboard from "@/components/AdminDashboard";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { todayInTZ } from "@/lib/slots";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const db = createAdminClient();
  const today = todayInTZ();
  const [pending, approved] = await Promise.all([
    db.from("bookings").select("*").eq("status", "pending").gte("date", today).order("date").order("start_hour").order("created_at"),
    db.from("bookings").select("*").eq("status", "approved").gte("date", today).order("date").order("start_hour"),
  ]);

  return (
    <AdminDashboard
      pending={pending.data ?? []}
      approved={approved.data ?? []}
      error={error}
      loadFailed={!!(pending.error || approved.error)}
    />
  );
}
