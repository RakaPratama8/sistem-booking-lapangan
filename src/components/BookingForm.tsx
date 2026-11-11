"use client";

import { useActionState } from "react";
import { createBooking, type BookingState } from "@/app/actions";

export default function BookingForm({ date, hour }: { date: string; hour: number }) {
  const [state, action, pending] = useActionState<BookingState, FormData>(createBooking, {});

  if (state.ok) {
    return (
      <p className="rounded bg-green-100 p-4 text-green-900">
        Permintaan terkirim. Admin akan menghubungi Anda lewat nomor HP untuk konfirmasi.
      </p>
    );
  }

  const input = "w-full rounded border border-zinc-300 p-2";
  return (
    <form action={action} className="space-y-3 rounded border border-zinc-200 p-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="hour" value={hour} />
      {/* Honeypot, hidden from people. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="block text-sm">
        Nama
        <input name="name" required minLength={2} maxLength={60} className={input} />
      </label>
      <label className="block text-sm">
        Nomor HP
        <input name="phone" type="tel" required placeholder="08123456789" className={input} />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Mengirim…" : "Ajukan booking"}
      </button>
    </form>
  );
}
