import { expect, test } from "vitest";
import { countByHour } from "./slots";

test("countByHour counts rows per start_hour", () =>
  expect(countByHour([{ start_hour: 17 }, { start_hour: 17 }, { start_hour: 18 }])).toEqual(
    new Map([
      [17, 2],
      [18, 1],
    ]),
  ));
test("countByHour of null or undefined is empty (failed query)", () => {
  expect(countByHour(null)).toEqual(new Map());
  expect(countByHour(undefined)).toEqual(new Map());
});
