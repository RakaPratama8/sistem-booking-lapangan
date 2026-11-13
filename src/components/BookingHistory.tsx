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

// Status is a plain word; only an approved booking gets the accent, finished ones fade.
const STATUS_STYLE: Record<Status, string> = {
  pending: "font-medium",
  approved: "font-medium text-accent",
  rejected: "text-muted",
  cancelled: "text-muted",
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
      <div className="-mx-4 flex overflow-x-auto px-4 [scrollbar-width:none]">
        {[null, ...STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={href(s)}
            aria-current={s === status ? "true" : undefined}
            className={s === status ? "tab-active" : "tab"}
          >
            {s ? STATUS_LABEL[s] : "Semua"}
          </Link>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="muted border-t border-line py-4">
          {status ? "Tidak ada booking dengan status ini." : "Belum ada booking."}
        </p>
      )}
      <ul className="border-t border-line">
        {rows.map((b) => (
          <li key={b.id} className="space-y-2 border-b border-line py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="muted text-sm">
                  {formatDate(b.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="time whitespace-nowrap">{slotLabel(b.start_hour)}</p>
              </div>
              <span className={`text-sm ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
            </div>
            <div>
              <p className="break-words font-medium">{b.name}</p>
              <p className="muted break-words text-sm">{b.phone}</p>
            </div>
            <p className="muted text-xs">Diminta {formatRequested(b.created_at)}</p>
          </li>
        ))}
      </ul>

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
