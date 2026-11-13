"use client";

import { useActionState } from "react";
import { createBooking, type BookingState } from "@/app/actions";
import { slotLabel } from "@/lib/slots";

/** Lives inside BookingDialog. `summary` is the long date. Buttons close the enclosing dialog. */
const closeDialog = (e: React.MouseEvent<HTMLElement>) => e.currentTarget.closest("dialog")?.close();

export default function BookingForm({
  date,
  hour,
  summary,
}: {
  date: string;
  hour: number;
  summary: string;
}) {
  const [state, action, pending] = useActionState<BookingState, FormData>(createBooking, {});

  if (state.ok) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 id="booking-title" className="title">Permintaan terkirim</h2>
          <p className="font-medium">{slotLabel(hour)}</p>
          <p className="muted">{summary}</p>
        </div>
        <p className="muted text-sm">
          Jadwal belum pasti sampai admin menyetujui. Admin akan menghubungi Anda lewat nomor HP yang Anda isi.
        </p>
        <button type="button" onClick={closeDialog} className="btn-primary w-full">Selesai</button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="hour" value={hour} />
      {/* Honeypot, hidden from people. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="space-y-1">
        <h2 id="booking-title" className="title">{slotLabel(hour)}</h2>
        <p className="muted">{summary}</p>
      </div>
      <label className="block space-y-1 text-sm font-medium">
        Nama
        <input name="name" required minLength={2} maxLength={60} autoComplete="name" placeholder="Contoh: Budi Santoso" className="input" />
      </label>
      <label className="block space-y-1 text-sm font-medium">
        Nomor HP / WhatsApp
        <input name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="08123456789" className="input" />
      </label>
      {state.error && <p role="alert" className="alert-error text-sm">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Mengirim…" : "Kirim permintaan booking"}
      </button>
      <button type="button" onClick={closeDialog} className="btn-ghost w-full">Batal</button>
      <p className="muted text-center text-xs">Tidak perlu akun. Admin akan menghubungi Anda untuk konfirmasi.</p>
    </form>
  );
}
