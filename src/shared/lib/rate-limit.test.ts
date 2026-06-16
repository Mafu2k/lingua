import { describe, expect, it } from "vitest";
import { clientKey, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit then blocks", () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, 2, 1000).ok).toBe(true);
    expect(rateLimit(key, 2, 1000).ok).toBe(true);

    const blocked = rateLimit(key, 2, 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", async () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, 1, 10).ok).toBe(true);
    expect(rateLimit(key, 1, 10).ok).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(rateLimit(key, 1, 10).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first x-forwarded-for entry", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" }
    });
    expect(clientKey(request)).toBe("203.0.113.5");
  });

  it("falls back to anonymous without forwarding headers", () => {
    expect(clientKey(new Request("http://localhost"))).toBe("anonymous");
  });
});
