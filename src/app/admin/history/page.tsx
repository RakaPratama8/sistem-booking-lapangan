import Link from "next/link";
import BookingHistory, { type HistoryRow } from "@/components/BookingHistory";
import { requireAdmin } from "@/lib/admin";
import { PAGE_SIZE, lastPage, parsePage, parseStatus } from "@/lib/history";
import { createAdminClient } from "@/lib/supabase/server";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const db = createAdminClient();

  let countQuery = db.from("bookings").select("id", { count: "exact", head: true });
  if (status) countQuery = countQuery.eq("status", status);
  const { count, error: countError } = await countQuery;

  const last = lastPage(count ?? 0);
  const page = Math.min(parsePage(sp.page), last);

  let rowsQuery = db
    .from("bookings")
    .select("id, date, start_hour, name, phone, status, created_at")
    .order("date", { ascending: false })
    .order("start_hour", { ascending: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) rowsQuery = rowsQuery.eq("status", status);
  const { data, error } = await rowsQuery;

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Riwayat Booking</h1>
        <Link href="/admin" className="btn-ghost">← Dashboard</Link>
      </header>
      {(error || countError) && <p role="alert" className="alert-error">Data gagal dimuat. Muat ulang halaman.</p>}
      <BookingHistory rows={(data ?? []) as HistoryRow[]} status={status} page={page} lastPage={last} />
    </main>
  );
}
