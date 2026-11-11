import { isValidDate, isValidSlot } from "./slots";

const PHONE = /^(\+62|0)\d{8,13}$/;

/** wa.me link for a stored phone (08… or +62…), with a prefilled message. */
export function waLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

/** Returns an error message (Indonesian, shown to the resident) or null if OK. */
export function validateBooking(
  b: { date: string; hour: number; name: string; phone: string },
  today: string,
  nowHour: number,
): string | null {
  if (!isValidDate(b.date) || b.date < today) return "Tanggal tidak valid.";
  if (!isValidSlot(b.hour)) return "Jam tidak valid.";
  if (b.date === today && b.hour <= nowHour) return "Jam ini sudah lewat. Pilih jam lain.";
  if (b.name.length < 2 || b.name.length > 60) return "Nama harus 2–60 karakter.";
  if (!PHONE.test(b.phone)) return "Nomor HP tidak valid (contoh: 08123456789).";
  return null;
}
