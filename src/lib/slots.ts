export const TZ = "Asia/Jakarta";
// 1-hour slots, 16:00-22:00. Edit here to change opening hours.
export const SLOT_HOURS = [16, 17, 18, 19, 20, 21];

/** Today as YYYY-MM-DD in the field's timezone. */
export const todayInTZ = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

export const isValidDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s);

export const isValidSlot = (hour: number) => SLOT_HOURS.includes(hour);

const pad = (n: number) => String(n).padStart(2, "0");
export const slotLabel = (hour: number) => `${pad(hour)}:00–${pad(hour + 1)}:00`;
