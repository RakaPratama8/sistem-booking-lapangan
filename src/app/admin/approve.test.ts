import { beforeEach, expect, test, vi } from "vitest";

type Call = { patch: unknown; where: Record<string, unknown> };
const calls: Call[] = [];
let results: { data: unknown; error: { code: string } | null }[] = [];

vi.mock("@/lib/admin", () => ({ requireAdmin: async () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
// Fake query builder: records each update and its filters, answers from the `results` queue.
vi.mock("@/lib/supabase/server", () => ({
  createAuthClient: () => {},
  createAdminClient: () => ({
    from: () => ({
      update: (patch: unknown) => {
        const call: Call = { patch, where: {} };
        calls.push(call);
        const q = {
          eq: (k: string, v: unknown) => ((call.where[k] = v), q),
          select: () => q,
          then: (resolve: (r: unknown) => void) => resolve(results.shift()),
        };
        return q;
      },
    }),
  }),
}));

import { approveBooking, rejectBooking } from "./actions";

const form = () => {
  const f = new FormData();
  f.set("id", "b1");
  return f;
};
const slot = { date: "2026-11-20", start_hour: 9 };

beforeEach(() => {
  calls.length = 0;
});

test("approving rejects the other pending requests for the same slot", async () => {
  results = [{ data: [slot], error: null }, { data: null, error: null }];
  await expect(approveBooking(form())).rejects.toThrow("redirect:/admin");
  expect(calls).toEqual([
    { patch: { status: "approved" }, where: { id: "b1" } },
    { patch: { status: "rejected" }, where: { ...slot, status: "pending" } },
  ]);
});

test("a slot already approved for someone else rejects nothing", async () => {
  results = [{ data: null, error: { code: "23505" } }];
  await expect(approveBooking(form())).rejects.toThrow("redirect:/admin?error=taken");
  expect(calls).toHaveLength(1);
});

test("rejecting one request leaves the others alone", async () => {
  results = [{ data: [slot], error: null }];
  await expect(rejectBooking(form())).rejects.toThrow("redirect:/admin");
  expect(calls).toHaveLength(1);
});
