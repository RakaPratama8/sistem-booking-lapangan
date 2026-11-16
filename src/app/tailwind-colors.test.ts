import { readFileSync, readdirSync } from "node:fs";
import { expect, test } from "vitest";

// Components use `accent`/`brand-*`; only globals.css may map brand-* onto the teal palette.
test("no green-* or teal-* Tailwind colors outside globals.css", () => {
  const bad = readdirSync("src", { recursive: true, encoding: "utf8" })
    .filter((f) => /\.(tsx?|css)$/.test(f) && !f.endsWith("globals.css") && !f.endsWith("tailwind-colors.test.ts"))
    .flatMap((f) =>
      readFileSync(`src/${f}`, "utf8").split("\n").flatMap((l, i) => (/\b(green|teal)-\d{2,3}\b/.test(l) ? [`src/${f}:${i + 1}: ${l.trim()}`] : [])),
    );
  expect(bad).toEqual([]);
});
