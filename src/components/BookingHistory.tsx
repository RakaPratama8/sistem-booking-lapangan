import Link from "next/link";
import { STATUSES, STATUS_LABEL, formatRequested, type Status } from "@/lib/history";
import { formatDate, slotLabel } from "@/lib/slots";

export type HistoryRow = {
  id: string;
  date: string;
  start_hour: number;
  name: string;
  phone: string;
  status: Status;
  created_at: string;
};

const BADGE: Record<Status, string> = {
  pending: "badge-warn",
  approved: "badge-ok",
  rejected: "badge-bad",
  cancelled: "badge-off",
};

const href = (status: Status | null, page = 1) => {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/admin/history?${s}` : "/admin/history";
};

/** Read-only log of every booking. Approve/reject/cancel/contact stay on the dashboard. */
export default function BookingHistory({
  rows,
  status,
  page,
  lastPage,
}: {
  rows: HistoryRow[];
  status: Status | null;
  page: number;
  lastPage: number;
}) {
  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {[null, ...STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={href(s)}
            aria-current={s === status ? "true" : undefined}
            className={s === status ? "chip-active" : "chip"}
          >
            {s ? STATUS_LABEL[s] : "Semua"}
          </Link>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="card muted text-center">
          {status ? "Tidak ada booking dengan status ini." : "Belum ada booking."}
        </p>
      )}
      {rows.map((b) => (
        <div key={b.id} className="card space-y-1">
          <p className="font-semibold">
            {formatDate(b.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} ·{" "}
            <span className="whitespace-nowrap">{slotLabel(b.start_hour)}</span>
            <span className={BADGE[b.status]}>{STATUS_LABEL[b.status]}</span>
          </p>
          <p className="muted break-words text-sm">{b.name} · {b.phone}</p>
          <p className="muted text-xs">Diminta {formatRequested(b.created_at)}</p>
        </div>
      ))}

      {lastPage > 1 && (
        <nav className="flex items-center justify-between gap-2 text-sm" aria-label="Halaman">
          {page > 1 ? <Link href={href(status, page - 1)} className="btn-ghost">Sebelumnya</Link> : <span />}
          <span className="muted">Halaman {page} dari {lastPage}</span>
          {page < lastPage ? <Link href={href(status, page + 1)} className="btn-ghost">Berikutnya</Link> : <span />}
        </nav>
      )}
    </>
  );
}
