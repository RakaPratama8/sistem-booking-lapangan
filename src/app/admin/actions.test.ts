import { expect, test, vi } from "vitest";

vi.mock("@/lib/admin", () => ({
  requireAdmin: () => Promise.reject(new Error("denied")),
}));
// Reaching the DB without passing requireAdmin() is the bug this test catches.
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => { throw new Error("unguarded"); },
  createAuthClient: () => { throw new Error("unguarded"); },
}));

import * as actions from "./actions";

// Not admin-only by nature: login runs before there is an admin session; logout only ends one.
const PUBLIC = ["login", "logout"];

test("every other exported admin action calls requireAdmin() first", async () => {
  const guarded = Object.entries(actions).filter(([name]) => !PUBLIC.includes(name));
  expect(guarded.length).toBeGreaterThan(0);
  for (const [name, action] of guarded) {
    await expect(action(new FormData()), name).rejects.toThrow("denied");
  }
});
