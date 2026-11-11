import ConfirmForm from "@/components/ConfirmForm";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate, slotLabel, todayInTZ } from "@/lib/slots";
import { waLink } from "@/lib/validate";
import { approveBooking, logout, rejectBooking } from "./actions";

const ERRORS: Record<string, string> = {
  taken: "Slot ini sudah disetujui untuk orang lain. Tolak permintaan ini.",
  failed: "Gagal memperbarui. Coba lagi.",
};

type Booking = { id: string; date: string; start_hour: number; name: string; phone: string };

const when = (b: Booking) =>
  `${formatDate(b.date, { weekday: "long", day: "numeric", month: "long" })} · ${slotLabel(b.start_hour)}`;

/** Phone (tap to call) + WhatsApp button with a prefilled message. */
const Contact = ({ b, text }: { b: Booking; text: string }) => (
  <p className="muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
    <span>{b.name}</span>
    <a href={`tel:${b.phone}`} className="link">{b.phone}</a>
    <a href={waLink(b.phone, text)} target="_blank" rel="noopener noreferrer" className="link">WhatsApp</a>
  </p>
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

      {error && <p role="alert" className="alert-error">{ERRORS[error] ?? ERRORS.failed}</p>}
      {(pending.error || approved.error) && <p role="alert" className="alert-error">Data gagal dimuat. Muat ulang halaman.</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Menunggu persetujuan <span className="badge-warn">{pending.data?.length ?? 0}</span></h2>
        {pending.data?.length === 0 && <p className="card muted text-center">Tidak ada permintaan baru.</p>}
        {pending.data?.map((b: Booking) => (
          <div key={b.id} className="card space-y-3">
            <div>
              <p className="font-semibold">{when(b)}</p>
              <Contact b={b} text={`Halo ${b.name}, ini admin lapangan. Soal permintaan booking ${when(b)}: `} />
            </div>
            <div className="flex gap-2">
              <form action={approveBooking} className="flex-1"><input type="hidden" name="id" value={b.id} /><button className="btn-primary w-full">Setujui</button></form>
              <ConfirmForm action={rejectBooking} message={`Tolak permintaan ${b.name} untuk ${when(b)}?`} className="flex-1">
                <input type="hidden" name="id" value={b.id} />
                <button className="btn-danger w-full">Tolak</button>
              </ConfirmForm>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sudah disetujui <span className="badge-ok">{approved.data?.length ?? 0}</span></h2>
        {approved.data?.length === 0 && <p className="card muted text-center">Belum ada booking yang disetujui.</p>}
        {approved.data?.map((b: Booking) => (
          <div key={b.id} className="card">
            <p className="font-semibold">{when(b)}</p>
            <Contact b={b} text={`Halo ${b.name}, booking lapangan Anda untuk ${when(b)} sudah disetujui. `} />
          </div>
        ))}
      </section>
    </main>
  );
}
