import { approveBooking, logout, rejectBooking } from "@/app/admin/actions";
import { formatDate, slotLabel } from "@/lib/slots";
import { waLink } from "@/lib/validate";
import ConfirmForm from "./ConfirmForm";
import SubmitButton from "./SubmitButton";

export type Booking = { id: string; date: string; start_hour: number; name: string; phone: string };

const ERRORS: Record<string, string> = {
  taken: "Slot ini sudah disetujui untuk orang lain. Tolak permintaan ini.",
  failed: "Gagal memperbarui. Coba lagi.",
};

const when = (b: Booking) =>
  `${formatDate(b.date, { weekday: "long", day: "numeric", month: "long" })} · ${slotLabel(b.start_hour)}`;

/** Card heading; the time range never splits across lines. */
const When = ({ b }: { b: Booking }) => (
  <p className="font-semibold">
    {formatDate(b.date, { weekday: "long", day: "numeric", month: "long" })} ·{" "}
    <span className="whitespace-nowrap">{slotLabel(b.start_hour)}</span>
  </p>
);

/** Who + big tap-friendly Call / WhatsApp buttons (WhatsApp message is prefilled). */
const Contact = ({ b, text }: { b: Booking; text: string }) => (
  <div className="space-y-2">
    <p className="muted break-words text-sm">{b.name} · {b.phone}</p>
    <div className="flex gap-2">
      <a href={`tel:${b.phone}`} className="btn-ghost flex-1">Telepon</a>
      <a href={waLink(b.phone, text)} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">WhatsApp</a>
    </div>
  </div>
);

export default function AdminDashboard({
  pending,
  approved,
  error,
  loadFailed,
}: {
  pending: Booking[];
  approved: Booking[];
  error?: string;
  loadFailed?: boolean;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <form action={logout}><SubmitButton className="btn-ghost">Keluar</SubmitButton></form>
      </header>

      {error && <p role="alert" className="alert-error">{ERRORS[error] ?? ERRORS.failed}</p>}
      {loadFailed && <p role="alert" className="alert-error">Data gagal dimuat. Muat ulang halaman.</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Menunggu persetujuan <span className="badge-warn">{pending.length}</span></h2>
        {pending.length === 0 && <p className="card muted text-center">Tidak ada permintaan baru.</p>}
        {pending.map((b) => (
          <div key={b.id} className="card space-y-3">
            <When b={b} />
            <Contact b={b} text={`Halo ${b.name}, ini admin lapangan. Soal permintaan booking ${when(b)}: `} />
            <div className="flex gap-2">
              <form action={approveBooking} className="flex-1">
                <input type="hidden" name="id" value={b.id} />
                <SubmitButton className="btn-primary w-full">Setujui</SubmitButton>
              </form>
              <ConfirmForm action={rejectBooking} message={`Tolak permintaan ${b.name} untuk ${when(b)}?`} className="flex-1">
                <input type="hidden" name="id" value={b.id} />
                <SubmitButton className="btn-danger w-full">Tolak</SubmitButton>
              </ConfirmForm>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sudah disetujui <span className="badge-ok">{approved.length}</span></h2>
        {approved.length === 0 && <p className="card muted text-center">Belum ada booking yang disetujui.</p>}
        {approved.map((b) => (
          <div key={b.id} className="card space-y-3">
            <When b={b} />
            <Contact b={b} text={`Halo ${b.name}, booking lapangan Anda untuk ${when(b)} sudah disetujui. `} />
          </div>
        ))}
      </section>
    </main>
  );
}
