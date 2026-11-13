import { TZ } from "./slots";

export const PAGE_SIZE = 30;
export const STATUSES = ["pending", "approved", "rejected", "cancelled"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
};

/** `?status=` value → a status, or null for "Semua" (missing or unknown). */
export const parseStatus = (v: string | undefined): Status | null => STATUSES.find((s) => s === v) ?? null;

/** `?page=` value → integer ≥ 1; anything else is page 1. */
export const parsePage = (v: string | undefined): number => (v && /^[1-9]\d*$/.test(v) ? Number(v) : 1);

export const lastPage = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));

const requestedFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** When a request was made, in the field's timezone, e.g. "11 Jan 00.05". */
export const formatRequested = (iso: string) => requestedFmt.format(new Date(iso));
