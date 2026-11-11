import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { slotLabel, todayInTZ } from "@/lib/slots";
import { approveBooking, logout, rejectBooking } from "./actions";

const ERRORS: Record<string, string> = {
  taken: "Slot ini sudah disetujui untuk orang lain. Tolak permintaan ini.",
  failed: "Gagal memperbarui. Coba lagi.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const db = createAdminClient();
  const [pending, approved] = await Promise.all([
    db.from("bookings").select("*").eq("status", "pending").gte("date", todayInTZ()).order("date").order("start_hour").order("created_at"),
    db.from("bookings").select("*").eq("status", "approved").gte("date", todayInTZ()).order("date").order("start_hour"),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <form action={logout}><button className="text-sm underline">Keluar</button></form>
      </header>

      {error && <p role="alert" className="rounded bg-red-100 p-3 text-red-900">{ERRORS[error] ?? ERRORS.failed}</p>}
      {(pending.error || approved.error) && <p role="alert" className="text-red-700">Data gagal dimuat.</p>}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Menunggu persetujuan ({pending.data?.length ?? 0})</h2>
        {pending.data?.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-2 rounded border border-zinc-300 p-3">
            <div>
              <p className="font-medium">{b.date} · {slotLabel(b.start_hour)}</p>
              <p className="text-sm">{b.name} · {b.phone}</p>
            </div>
            <div className="flex gap-2">
              <form action={approveBooking}><input type="hidden" name="id" value={b.id} /><button className="rounded bg-green-700 px-3 py-1 text-white">Setujui</button></form>
              <form action={rejectBooking}><input type="hidden" name="id" value={b.id} /><button className="rounded bg-red-700 px-3 py-1 text-white">Tolak</button></form>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Sudah disetujui</h2>
        {approved.data?.map((b) => (
          <p key={b.id} className="rounded bg-zinc-100 p-3 text-sm">
            {b.date} · {slotLabel(b.start_hour)} · {b.name} · {b.phone}
          </p>
        ))}
      </section>
    </main>
  );
}
