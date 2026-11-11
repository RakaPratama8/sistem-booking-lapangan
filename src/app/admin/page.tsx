import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate, slotLabel, todayInTZ } from "@/lib/slots";
import { approveBooking, logout, rejectBooking } from "./actions";

const ERRORS: Record<string, string> = {
  taken: "Slot ini sudah disetujui untuk orang lain. Tolak permintaan ini.",
  failed: "Gagal memperbarui. Coba lagi.",
};

type Booking = { id: string; date: string; start_hour: number; name: string; phone: string };

const when = (b: Booking) =>
  `${formatDate(b.date, { weekday: "long", day: "numeric", month: "long" })} · ${slotLabel(b.start_hour)}`;

const Phone = ({ phone }: { phone: string }) => (
  <a href={`tel:${phone}`} className="text-green-800 underline">{phone}</a>
);

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
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <form action={logout}><button className="btn-ghost">Keluar</button></form>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{ERRORS[error] ?? ERRORS.failed}</p>}
      {(pending.error || approved.error) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">Data gagal dimuat. Muat ulang halaman.</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Menunggu persetujuan <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-900">{pending.data?.length ?? 0}</span>
        </h2>
        {pending.data?.length === 0 && <p className="card text-center text-zinc-500">Tidak ada permintaan baru.</p>}
        {pending.data?.map((b: Booking) => (
          <div key={b.id} className="card space-y-3">
            <div>
              <p className="font-semibold">{when(b)}</p>
              <p className="text-sm text-zinc-700">{b.name} · <Phone phone={b.phone} /></p>
            </div>
            <div className="flex gap-2">
              <form action={approveBooking} className="flex-1"><input type="hidden" name="id" value={b.id} /><button className="btn-primary w-full">Setujui</button></form>
              <form action={rejectBooking} className="flex-1"><input type="hidden" name="id" value={b.id} /><button className="btn-danger w-full">Tolak</button></form>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Sudah disetujui <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-sm text-green-900">{approved.data?.length ?? 0}</span>
        </h2>
        {approved.data?.length === 0 && <p className="card text-center text-zinc-500">Belum ada booking yang disetujui.</p>}
        {approved.data?.map((b: Booking) => (
          <div key={b.id} className="card">
            <p className="font-semibold">{when(b)}</p>
            <p className="text-sm text-zinc-700">{b.name} · <Phone phone={b.phone} /></p>
          </div>
        ))}
      </section>
    </main>
  );
}
