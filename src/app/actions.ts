"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { hourInTZ, todayInTZ } from "@/lib/slots";
import { validateBooking } from "@/lib/validate";

export type BookingState = { ok?: boolean; error?: string };

export async function createBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  // Honeypot: real users never fill this hidden field.
  if (form.get("website")) return { ok: true };

  const booking = {
    date: String(form.get("date") ?? ""),
    hour: Number(form.get("hour")),
    name: String(form.get("name") ?? "").trim(),
    phone: String(form.get("phone") ?? "").replace(/[\s-]/g, ""),
  };
  const error = validateBooking(booking, todayInTZ(), hourInTZ());
  if (error) return { error };

  const { error: dbError } = await createAdminClient()
    .from("bookings")
    .insert({ date: booking.date, start_hour: booking.hour, name: booking.name, phone: booking.phone });
  if (dbError) return { error: "Gagal mengirim permintaan. Coba lagi." };
  return { ok: true };
}
