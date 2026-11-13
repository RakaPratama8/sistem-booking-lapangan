import Link from "next/link";
import BookingDialog from "@/components/BookingDialog";
import BookingForm from "@/components/BookingForm";
import { createAdminClient } from "@/lib/supabase/server";
import { SLOT_HOURS, addDays, countByHour, formatDate, hourInTZ, isValidDate, isValidSlot, slotLabel, todayInTZ } from "@/lib/slots";

const QUICK_DAYS = 7;

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string; slot?: string }> }) {
  const sp = await searchParams;
  const today = todayInTZ();
  const nowHour = hourInTZ();
  const date = sp.date && isValidDate(sp.date) && sp.date >= today ? sp.date : today;
  const selected = Number(sp.slot);

  // Only date + hour of approved bookings, plus a pending count per hour, leave the server; names/phones stay private.
  const db = createAdminClient();
  const [{ data, error }, { data: pendingRows }] = await Promise.all([
    db.from("bookings").select("start_hour").eq("date", date).eq("status", "approved"),
    db.from("bookings").select("start_hour").eq("date", date).eq("status", "pending"),
  ]);
  const booked = new Set(data?.map((r) => r.start_hour));
  // A failed pending query just means no counts; only the approved query drives the error banner.
  const pending = countByHour(pendingRows);
  const isPast = (hour: number) => date === today && hour <= nowHour;

  const longDate = formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const canSelect = isValidSlot(selected) && !booked.has(selected) && !isPast(selected);

  return (
    <main className="mx-auto w-full max-w-lg space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="title">Jadwal Lapangan</h1>
        <p className="muted">Pilih tanggal dan jam, lalu kirim permintaan. Tanpa akun.</p>
      </div>

      <div className="space-y-1">
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
          {Array.from({ length: QUICK_DAYS }, (_, i) => addDays(today, i)).map((d, i) => (
            <Link
              key={d}
              href={`/?date=${d}`}
              scroll={false}
              aria-current={d === date ? "date" : undefined}
              className={`min-w-14 ${d === date ? "tab-active" : "tab"}`}
            >
              <span className="text-xs">{i === 0 ? "Hari ini" : i === 1 ? "Besok" : formatDate(d, { weekday: "short" })}</span>
              <span className="time">{formatDate(d, { day: "numeric" })}</span>
              <span className="text-xs">{formatDate(d, { month: "short" })}</span>
            </Link>
          ))}
        </div>
        <details className="text-sm">
          <summary className="link inline-flex min-h-10 list-none items-center [&::-webkit-details-marker]:hidden">Tanggal lain</summary>
          <form className="flex items-center gap-2 pb-2">
            <label htmlFor="date" className="sr-only">Tanggal</label>
            <input id="date" type="date" name="date" defaultValue={date} min={today} required className="input min-w-0 flex-1" />
            <button className="btn-ghost">Lihat</button>
          </form>
        </details>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">{longDate}</h2>
        {error && <p role="alert" className="alert-error">Jadwal gagal dimuat. Muat ulang halaman.</p>}
        <ul className="border-t border-line">
          {SLOT_HOURS.map((hour) => {
            const taken = booked.has(hour);
            if (taken || isPast(hour)) {
              return (
                <li key={hour} className="row text-muted">
                  <span className="time line-through">{slotLabel(hour)}</span>
                  <span className="text-sm">{taken ? "Sudah dibooking" : "Sudah lewat"}</span>
                </li>
              );
            }
            const isSelected = hour === selected;
            const count = pending.get(hour);
            return (
              <li key={hour}>
                <Link
                  href={`/?date=${date}&slot=${hour}`}
                  aria-current={isSelected ? "true" : undefined}
                  className="row aria-[current=true]:bg-surface"
                >
                  <span className="time">{slotLabel(hour)}</span>
                  <span className="text-right text-sm">
                    <span className="block font-medium text-accent">{isSelected ? "Dipilih" : "Tersedia"}</span>
                    {count ? <span className="muted block">{count} peminta</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {canSelect && (
        <BookingDialog key={`${date}-${selected}`} closeHref={`/?date=${date}`}>
          <BookingForm date={date} hour={selected} summary={longDate} />
        </BookingDialog>
      )}
    </main>
  );
}
