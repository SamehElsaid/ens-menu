import { describe, expect, it, vi } from "vitest";
import { getSharedRequest } from "./sharedRequest";

describe("shared in-flight requests", () => {
  it("deduplicates concurrent Strict Mode-style requests", async () => {
    let resolve!: (value: string) => void;
    const pending = new Promise<string>((done) => {
      resolve = done;
    });
    const load = vi.fn(() => pending);

    const first = getSharedRequest("auth:key", load);
    const second = getSharedRequest("auth:key", load);
    resolve("user");

    await expect(Promise.all([first, second])).resolves.toEqual([
      "user",
      "user",
    ]);
    expect(load).toHaveBeenCalledOnce();
  });

  it("allows a fresh request after the prior request settles", async () => {
    const load = vi.fn(async () => "user");
    await getSharedRequest("auth:fresh", load);
    await Promise.resolve();
    await getSharedRequest("auth:fresh", load);
    expect(load).toHaveBeenCalledTimes(2);
  });
});
