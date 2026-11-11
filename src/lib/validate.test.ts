import { expect, test } from "vitest";
import { validateBooking } from "./validate";
import { slotLabel } from "./slots";

const ok = { date: "2030-01-10", hour: 17, name: "Budi", phone: "08123456789" };
const today = "2030-01-01";

test("accepts a valid booking", () => expect(validateBooking(ok, today)).toBeNull());
test("accepts +62 phone", () => expect(validateBooking({ ...ok, phone: "+628123456789" }, today)).toBeNull());
test("accepts today", () => expect(validateBooking({ ...ok, date: today }, today)).toBeNull());
test("rejects past date", () => expect(validateBooking({ ...ok, date: "2029-12-31" }, today)).not.toBeNull());
test("rejects impossible date", () => expect(validateBooking({ ...ok, date: "2030-02-31" }, today)).not.toBeNull());
test("rejects hour outside opening hours", () => expect(validateBooking({ ...ok, hour: 9 }, today)).not.toBeNull());
test("rejects bad phone", () => expect(validateBooking({ ...ok, phone: "12345" }, today)).not.toBeNull());
test("rejects short name", () => expect(validateBooking({ ...ok, name: "B" }, today)).not.toBeNull());
test("slot label", () => expect(slotLabel(16)).toBe("16:00–17:00"));
