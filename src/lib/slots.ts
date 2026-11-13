export const TZ = "Asia/Jakarta";
// 1-hour slots, 16:00-22:00. Edit here to change opening hours.
export const SLOT_HOURS = [16, 17, 18, 19, 20, 21];

/** Today as YYYY-MM-DD in the field's timezone. */
export const todayInTZ = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

/** Current hour (0-23) in the field's timezone. */
export const hourInTZ = () =>
  Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(new Date()));

export const isValidDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s);

/** How many rows fall on each start hour. A failed query (null/undefined) counts as none. */
export const countByHour = (rows: { start_hour: number }[] | null | undefined) => {
  const counts = new Map<number, number>();
  for (const r of rows ?? []) counts.set(r.start_hour, (counts.get(r.start_hour) ?? 0) + 1);
  return counts;
};

export const isValidSlot =(hour: number) => SLOT_HOURS.includes(hour);

export const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Indonesian date text, e.g. { weekday: "long", day: "numeric", month: "long" } -> "Rabu, 12 November". */
export const formatDate = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", ...opts }).format(new Date(`${date}T00:00:00Z`));

const pad = (n: number) => String(n).padStart(2, "0");
export const slotLabel = (hour: number) => `${pad(hour)}:00–${pad(hour + 1)}:00`;
