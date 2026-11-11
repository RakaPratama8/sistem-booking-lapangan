"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createBooking, type BookingState } from "@/app/actions";

export default function BookingForm({ date, hour, summary }: { date: string; hour: number; summary: string }) {
  const [state, action, pending] = useActionState<BookingState, FormData>(createBooking, {});

  if (state.ok) {
    return (
      <div id="form" className="card-success space-y-3 text-center">
        <p className="text-3xl" aria-hidden>✅</p>
        <h3 className="text-lg font-semibold">Permintaan terkirim</h3>
        <p className="text-sm">{summary}</p>
        <p className="text-sm opacity-80">
          Jadwal belum pasti sampai admin menyetujui. Admin akan menghubungi Anda lewat nomor HP yang Anda isi.
        </p>
        <Link href={`/?date=${date}`} className="btn-ghost">Kembali ke jadwal</Link>
      </div>
    );
  }

  return (
    <form id="form" action={action} className="card space-y-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="hour" value={hour} />
      {/* Honeypot, hidden from people. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
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
      <p className="muted text-center text-xs">Tidak perlu akun. Admin akan menghubungi Anda untuk konfirmasi.</p>
    </form>
  );
}
