import Link from "next/link";
import { approveBooking, cancelBooking, logout, rejectBooking } from "@/app/admin/actions";
import { formatDate, slotLabel } from "@/lib/slots";
import { waLink } from "@/lib/validate";
import AutoRefresh from "./AutoRefresh";
import ConfirmForm from "./ConfirmForm";
import SubmitButton from "./SubmitButton";

export type Booking = { id: string; date: string; start_hour: number; name: string; phone: string };

const ERRORS: Record<string, string> = {
  taken: "Slot ini sudah disetujui untuk orang lain. Tolak permintaan ini.",
  failed: "Gagal memperbarui. Coba lagi.",
};

const dateText = (b: Booking) => formatDate(b.date, { weekday: "long", day: "numeric", month: "long" });
const when = (b: Booking) => `${dateText(b)} jam ${slotLabel(b.start_hour)}`;

/** Date on top (muted), time range below; the time never splits across lines. */
const When = ({ b }: { b: Booking }) => (
  <div>
    <p className="muted text-sm">{dateText(b)}</p>
    <p className="time whitespace-nowrap">{slotLabel(b.start_hour)}</p>
  </div>
);

/** Who asked, on separate lines. */
const Who = ({ b }: { b: Booking }) => (
  <div>
    <p className="break-words font-medium">{b.name}</p>
    <p className="muted break-words text-sm">{b.phone}</p>
  </div>
);

/** Plain-text call / WhatsApp actions (WhatsApp message is prefilled). */
const Contact = ({ b, text }: { b: Booking; text: string }) => (
  <>
    <a href={`tel:${b.phone}`} className="btn-ghost">Telepon</a>
    <a href={waLink(b.phone, text)} target="_blank" rel="noopener noreferrer" className="btn-ghost">WhatsApp</a>
  </>
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
    <main className="mx-auto w-full max-w-lg space-y-8 px-4 py-6">
      <AutoRefresh />
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="title">Dashboard Admin</h1>
        <div className="-mx-4 flex items-center">
          <Link href="/admin/history" className="btn-ghost">Riwayat</Link>
          <form action={logout}><SubmitButton className="btn-ghost">Keluar</SubmitButton></form>
        </div>
      </header>

      {error && <p role="alert" className="alert-error">{ERRORS[error] ?? ERRORS.failed}</p>}
      {loadFailed && <p role="alert" className="alert-error">Data gagal dimuat. Muat ulang halaman.</p>}

      <section className="space-y-2">
        <h2 className="font-semibold">Menunggu persetujuan <span className="muted font-normal">{pending.length}</span></h2>
        {pending.length === 0 && <p className="muted border-t border-line py-4">Tidak ada permintaan baru.</p>}
        <ul className="border-t border-line">
          {pending.map((b) => (
            <li key={b.id} className="space-y-3 border-b border-line py-4">
              <When b={b} />
              <Who b={b} />
              <div className="flex items-center gap-2">
                <form action={approveBooking} className="flex-1">
                  <input type="hidden" name="id" value={b.id} />
                  <SubmitButton className="btn-primary w-full">Setujui</SubmitButton>
                </form>
                <ConfirmForm action={rejectBooking} message={`Tolak permintaan ${b.name} untuk ${when(b)}?`}>
                  <input type="hidden" name="id" value={b.id} />
                  <SubmitButton className="btn-danger">Tolak</SubmitButton>
                </ConfirmForm>
              </div>
              <div className="-mx-4 flex">
                <Contact b={b} text={`Halo ${b.name}, ini admin lapangan. Soal permintaan booking ${when(b)}: `} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Sudah disetujui <span className="muted font-normal">{approved.length}</span></h2>
        {approved.length === 0 && <p className="muted border-t border-line py-4">Belum ada booking yang disetujui.</p>}
        <ul className="border-t border-line">
          {approved.map((b) => (
            <li key={b.id} className="space-y-3 border-b border-line py-4">
              <When b={b} />
              <Who b={b} />
              <div className="-mx-4 flex flex-wrap items-center">
                <Contact b={b} text={`Halo ${b.name}, booking lapangan Anda untuk ${when(b)} sudah disetujui. `} />
                <ConfirmForm action={cancelBooking} message={`Batalkan booking ${b.name} untuk ${when(b)}?`}>
                  <input type="hidden" name="id" value={b.id} />
                  <SubmitButton className="btn-danger">Batalkan</SubmitButton>
                </ConfirmForm>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
