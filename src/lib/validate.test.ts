import { expect, test } from "vitest";
import { validateBooking } from "./validate";
import { addDays, slotLabel } from "./slots";

const ok = { date: "2030-01-10", hour: 17, name: "Budi", phone: "08123456789" };
const today = "2030-01-01";
const v = (b = ok, nowHour = 10) => validateBooking(b, today, nowHour);

test("accepts a valid booking", () => expect(v()).toBeNull());
test("accepts +62 phone", () => expect(v({ ...ok, phone: "+628123456789" })).toBeNull());
test("accepts a later hour today", () => expect(v({ ...ok, date: today }, 16)).toBeNull());
test("rejects an hour already started today", () => expect(v({ ...ok, date: today }, 17)).not.toBeNull());
test("rejects past date", () => expect(v({ ...ok, date: "2029-12-31" })).not.toBeNull());
test("rejects impossible date", () => expect(v({ ...ok, date: "2030-02-31" })).not.toBeNull());
test("rejects hour outside opening hours", () => expect(v({ ...ok, hour: 9 })).not.toBeNull());
test("rejects bad phone", () => expect(v({ ...ok, phone: "12345" })).not.toBeNull());
test("rejects short name", () => expect(v({ ...ok, name: "B" })).not.toBeNull());
test("slot label", () => expect(slotLabel(16)).toBe("16:00–17:00"));
test("addDays crosses month end", () => expect(addDays("2030-01-31", 1)).toBe("2030-02-01"));
