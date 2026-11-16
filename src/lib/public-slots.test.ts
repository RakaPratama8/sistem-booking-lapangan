import { expect, test, vi } from "vitest";

const rows = [
  { date: "2026-11-20", start_hour: 9, name: "Budi", phone: "0812", status: "approved" },
  { date: "2026-11-20", start_hour: 10, name: "Sari", phone: "0813", status: "pending" },
  { date: "2026-11-20", start_hour: 10, name: "Dewi", phone: "0814", status: "pending" },
  { date: "2026-11-20", start_hour: 11, name: "Andi", phone: "0815", status: "rejected" },
  { date: "2026-11-21", start_hour: 12, name: "Tono", phone: "0816", status: "approved" },
];
const selects: string[] = [];

// Fake query builder that, like Postgres, returns only the selected columns.
vi.mock("./supabase/server", () => ({
  createAdminClient: () => ({
    from: () => {
      let cols: string[] = [];
      const where: Record<string, unknown> = {};
      const q = {
        select: (c: string) => (selects.push(c), (cols = c.split(",")), q),
        eq: (k: string, v: unknown) => ((where[k] = v), q),
        then: (resolve: (r: unknown) => void) =>
          resolve({
            data: rows
              .filter((r) => Object.entries(where).every(([k, v]) => r[k as keyof typeof r] === v))
              .map((r) => Object.fromEntries(cols.map((c) => [c, r[c as keyof typeof r]]))),
            error: null,
          }),
      };
      return q;
    },
  }),
}));

import { getPublicSlots } from "./public-slots";

test("public data is only booked hours and pending counts, never names or phones", async () => {
  const res = await getPublicSlots("2026-11-20");
  expect([...res.booked]).toEqual([9]);
  expect(Object.fromEntries(res.pending)).toEqual({ 10: 2 });
  expect(selects.every((c) => c === "start_hour")).toBe(true);
  expect(JSON.stringify([...res.booked, ...res.pending])).not.toMatch(/Budi|Sari|Dewi|08\d\d/);
});
