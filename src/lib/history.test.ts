import { expect, test } from "vitest";
import { STATUSES, formatRequested, lastPage, parsePage, parseStatus } from "./history";

test("parseStatus accepts each status", () => {
  for (const s of STATUSES) expect(parseStatus(s)).toBe(s);
});
test("parseStatus falls back to null (Semua)", () => {
  for (const v of [undefined, "", "all", "hack"]) expect(parseStatus(v)).toBeNull();
});
test("parsePage accepts a positive integer", () => expect(parsePage("3")).toBe(3));
test("parsePage falls back to 1 on junk", () => {
  for (const v of [undefined, "abc", "0", "-1", "2.5"]) expect(parsePage(v)).toBe(1);
});
test("lastPage is at least 1 and rounds up", () => {
  expect([0, 30, 31, 90].map(lastPage)).toEqual([1, 1, 2, 3]);
});
test("formatRequested uses Jakarta time (next day, 00 not 24)", () =>
  expect(formatRequested("2030-01-10T17:05:00Z")).toMatch(/^11 Jan.*00\.05$/));
