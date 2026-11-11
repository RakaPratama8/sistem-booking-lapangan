import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { createAdminClient } from "@/lib/supabase/server";
import { SLOT_HOURS, isValidDate, isValidSlot, slotLabel, todayInTZ } from "@/lib/slots";

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string; slot?: string }> }) {
  const sp = await searchParams;
  const today = todayInTZ();
  const date = sp.date && isValidDate(sp.date) && sp.date >= today ? sp.date : today;
  const selected = Number(sp.slot);

  // Only date + hour of approved bookings leave the server; names/phones stay private.
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("start_hour")
    .eq("date", date)
    .eq("status", "approved");
  const booked = new Set(data?.map((r) => r.start_hour));

  return (
    <main className="mx-auto w-full max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Booking Lapangan</h1>

      <form className="flex gap-2">
        <input type="date" name="date" defaultValue={date} min={today} required className="flex-1 rounded border border-zinc-300 p-2" />
        <button className="rounded bg-zinc-800 px-4 py-2 text-white">Lihat</button>
      </form>

      {error && <p role="alert" className="text-red-700">Jadwal gagal dimuat. Coba lagi.</p>}

      <ul className="space-y-2">
        {SLOT_HOURS.map((hour) =>
          booked.has(hour) ? (
            <li key={hour} className="rounded bg-zinc-200 p-3 text-zinc-500">
              {slotLabel(hour)} · Sudah dibooking
            </li>
          ) : (
            <li key={hour}>
              <Link
                href={`/?date=${date}&slot=${hour}`}
                className={`block rounded border p-3 ${hour === selected ? "border-green-700 bg-green-50" : "border-zinc-300"}`}
              >
                {slotLabel(hour)} · Tersedia
              </Link>
            </li>
          ),
        )}
      </ul>

      {isValidSlot(selected) && !booked.has(selected) && (
        <BookingForm key={`${date}-${selected}`} date={date} hour={selected} />
      )}
    </main>
  );
}
