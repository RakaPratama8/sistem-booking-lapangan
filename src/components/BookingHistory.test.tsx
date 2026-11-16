import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import BookingHistory, { type HistoryRow } from "./BookingHistory";

const row = (status: HistoryRow["status"], phone: string): HistoryRow => ({
  id: phone,
  date: "2026-11-20",
  start_hour: 9,
  name: "Budi",
  phone,
  status,
  created_at: "2026-11-19T03:00:00Z",
});

test("only rejected rows get a WhatsApp link", () => {
  const html = renderToStaticMarkup(
    <BookingHistory
      rows={[row("rejected", "081111111111"), row("approved", "082222222222"), row("pending", "083333333333"), row("cancelled", "084444444444")]}
      status={null}
      page={1}
      lastPage={1}
    />,
  );
  expect(html.match(/wa\.me\/\d+/g)).toEqual(["wa.me/6281111111111"]);
});
