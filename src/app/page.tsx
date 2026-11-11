import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { createAdminClient } from "@/lib/supabase/server";
import { SLOT_HOURS, addDays, formatDate, hourInTZ, isValidDate, isValidSlot, slotLabel, todayInTZ } from "@/lib/slots";

const QUICK_DAYS = 7;

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string; slot?: string }> }) {
  const sp = await searchParams;
  const today = todayInTZ();
  const nowHour = hourInTZ();
  const date = sp.date && isValidDate(sp.date) && sp.date >= today ? sp.date : today;
  const selected = Number(sp.slot);

  // Only date + hour of approved bookings leave the server; names/phones stay private.
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("start_hour")
    .eq("date", date)
    .eq("status", "approved");
  const booked = new Set(data?.map((r) => r.start_hour));
  const isPast = (hour: number) => date === today && hour <= nowHour;

  const longDate = formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const canSelect = isValidSlot(selected) && !booked.has(selected) && !isPast(selected);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Jadwal Lapangan</h1>
        <p className="text-zinc-600">Pilih tanggal dan jam, lalu kirim permintaan. Tanpa akun.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">1. Pilih tanggal</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {Array.from({ length: QUICK_DAYS }, (_, i) => addDays(today, i)).map((d, i) => (
            <Link
              key={d}
              href={`/?date=${d}`}
              scroll={false}
              aria-current={d === date ? "date" : undefined}
              className={`flex shrink-0 flex-col items-center rounded-xl border px-4 py-2 text-sm ${
                d === date ? "border-green-700 bg-green-700 text-white" : "border-zinc-300 bg-white hover:bg-zinc-100"
              }`}
            >
              <span>{i === 0 ? "Hari ini" : i === 1 ? "Besok" : formatDate(d, { weekday: "short" })}</span>
              <span className="text-lg font-semibold">{formatDate(d, { day: "numeric" })}</span>
              <span className="text-xs opacity-80">{formatDate(d, { month: "short" })}</span>
            </Link>
          ))}
        </div>
        <form className="flex items-center gap-2 text-sm">
          <label htmlFor="date" className="text-zinc-600">Tanggal lain:</label>
          <input id="date" type="date" name="date" defaultValue={date} min={today} required className="input w-auto" />
          <button className="btn-ghost">Lihat</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">2. Pilih jam · <span className="font-normal text-zinc-600">{longDate}</span></h2>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">Jadwal gagal dimuat. Muat ulang halaman.</p>}
        <ul className="grid grid-cols-2 gap-3">
          {SLOT_HOURS.map((hour) => {
            const taken = booked.has(hour);
            const past = isPast(hour);
            const base = "block rounded-xl border p-3 text-center";
            if (taken || past) {
              return (
                <li key={hour} className={`${base} border-zinc-200 bg-zinc-100 text-zinc-400`}>
                  <span className="block font-semibold line-through">{slotLabel(hour)}</span>
                  <span className="text-xs">{taken ? "Sudah dibooking" : "Sudah lewat"}</span>
                </li>
              );
            }
            return (
              <li key={hour}>
                <Link
                  href={`/?date=${date}&slot=${hour}#form`}
                  aria-current={hour === selected ? "true" : undefined}
                  className={`${base} ${
                    hour === selected
                      ? "border-green-700 bg-green-700 text-white"
                      : "border-green-300 bg-white text-green-900 hover:bg-green-50"
                  }`}
                >
                  <span className="block font-semibold">{slotLabel(hour)}</span>
                  <span className="text-xs">{hour === selected ? "✓ Dipilih" : "Tersedia"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {canSelect ? (
        <section className="space-y-3">
          <h2 className="font-semibold">3. Isi data Anda</h2>
          <BookingForm
            key={`${date}-${selected}`}
            date={date}
            hour={selected}
            summary={`${longDate} · ${slotLabel(selected)}`}
          />
        </section>
      ) : (
        <p className="text-center text-sm text-zinc-500">Pilih jam yang tersedia untuk melanjutkan.</p>
      )}
    </main>
  );
}
