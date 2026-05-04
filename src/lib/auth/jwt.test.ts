import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./jwt";

describe("jwt session", () => {
  it("verifies a signed session token", () => {
    const token = createSessionToken({
      sub: "demo-admin",
      email: "asha.admin@example.com",
      name: "Asha Admin",
      provider: "demo",
    });

    expect(verifySessionToken(token)?.sub).toBe("demo-admin");
  });

  it("rejects a tampered session token", () => {
    const token = createSessionToken({
      sub: "demo-admin",
      email: "asha.admin@example.com",
      name: "Asha Admin",
      provider: "demo",
    });

    expect(verifySessionToken(`${token.slice(0, -1)}x`)).toBeNull();
  });
});
