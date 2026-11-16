import { createAdminClient } from "./supabase/server";
import { countByHour } from "./slots";

/** Everything the public page may read: hours of approved bookings plus a pending count per hour. Never names or phones. */
export async function getPublicSlots(date: string) {
  const db = createAdminClient();
  const [{ data, error }, { data: pendingRows }] = await Promise.all([
    db.from("bookings").select("start_hour").eq("date", date).eq("status", "approved"),
    db.from("bookings").select("start_hour").eq("date", date).eq("status", "pending"),
  ]);
  // A failed pending query just means no counts; only the approved query drives the error banner.
  return { booked: new Set(data?.map((r) => r.start_hour)), pending: countByHour(pendingRows), error };
}
