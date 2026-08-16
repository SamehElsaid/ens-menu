import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  decryptDataApi: vi.fn(),
  encryptDataApi: vi.fn(),
  performAuthLogout: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    request: mocks.request,
    get: mocks.get,
    post: mocks.post,
    isAxiosError: (error: unknown) =>
      Boolean(error && typeof error === "object" && "response" in error),
  },
}));

vi.mock("./encryption", () => ({
  DecryptError: class DecryptError extends Error {
    constructor(message = "Decrypt failed") {
      super(message);
      this.name = "DecryptError";
    }
  },
  decryptDataApi: mocks.decryptDataApi,
  encryptDataApi: mocks.encryptDataApi,
}));

vi.mock("./authLogout", () => ({
  performAuthLogout: mocks.performAuthLogout,
}));

import {
  asAxiosError,
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosPut,
} from "./axiosCall";
import { CSRF_SESSION_STORAGE_KEY } from "./csrfToken";

function axiosError(status: number, data?: unknown) {
  return { response: { status, data } };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_BASE_URL = "https://api.example.test";
  process.env.NEXT_PUBLIC_SECRET_KEY = "secret";
  mocks.decryptDataApi.mockReturnValue(1234.5);
  mocks.encryptDataApi.mockReturnValue("signed-api-key");
  mocks.performAuthLogout.mockResolvedValue(undefined);
  vi.stubGlobal(
    "sessionStorage",
    (() => {
      const values = new Map<string, string>([
        [CSRF_SESSION_STORAGE_KEY, "stored-csrf"],
      ]);
      return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      };
    })(),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ fx_dyn: "encrypted-time" }),
    }),
  );
});

describe("shared request executor", () => {
  const cases = [
    {
      name: "GET",
      invoke: () => axiosGet("/resource", "en"),
      method: "get",
      hasBody: false,
    },
    {
      name: "POST",
      invoke: () => axiosPost("/resource", "en", { value: 1 }),
      method: "post",
      hasBody: true,
    },
    {
      name: "PUT",
      invoke: () => axiosPut("/resource", "en", { value: 1 }),
      method: "put",
      hasBody: true,
    },
    {
      name: "PATCH",
      invoke: () => axiosPatch("/resource", "en", { value: 1 }),
      method: "patch",
      hasBody: true,
    },
    {
      name: "DELETE",
      invoke: () => axiosDelete("/resource", "en"),
      method: "delete",
      hasBody: false,
    },
  ] as const;

  for (const testCase of cases) {
    it(`uses cookie credentials and shared headers for ${testCase.name}`, async () => {
      mocks.request.mockResolvedValueOnce({ data: { ok: true } });

      await expect(testCase.invoke()).resolves.toEqual({
        data: { ok: true },
        status: true,
      });

      expect(mocks.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: testCase.method,
          url: "https://api.example.test/resource",
          withCredentials: true,
          timeout: 15_000,
          headers: expect.objectContaining({
            "Accept-Language": "en",
            "X-API-KEY": "signed-api-key",
            ...(testCase.hasBody || testCase.method === "delete"
              ? { "X-CSRF-Token": "stored-csrf" }
              : {}),
          }),
        }),
      );
      expect(mocks.request.mock.calls[0]?.[0]?.headers).not.toHaveProperty(
        "Authorization",
      );
    });
  }

  it("preserves multipart and custom POST headers", async () => {
    mocks.request.mockResolvedValueOnce({ data: { ok: true } });
    await axiosPost(
      "/upload",
      "ar",
      { file: "value" },
      true,
      false,
      { headers: { "Idempotency-Key": "attempt-key" } },
    );

    expect(mocks.request.mock.calls[0]?.[0]?.headers).toMatchObject({
      "Content-Type": "multipart/form-data",
      "Idempotency-Key": "attempt-key",
      "X-CSRF-Token": "stored-csrf",
    });
  });

  it("lazily obtains and stores CSRF for authenticated mutations", async () => {
    sessionStorage.removeItem(CSRF_SESSION_STORAGE_KEY);
    mocks.get.mockResolvedValueOnce({ data: { csrfToken: "fresh-csrf" } });
    mocks.request.mockResolvedValueOnce({ data: { ok: true } });

    await axiosDelete("/resource", "en");

    expect(mocks.get).toHaveBeenCalledWith(
      "https://api.example.test/auth/csrf",
      expect.objectContaining({ withCredentials: true }),
    );
    expect(mocks.request.mock.calls[0]?.[0]?.headers).toMatchObject({
      "X-CSRF-Token": "fresh-csrf",
    });
    expect(sessionStorage.getItem(CSRF_SESSION_STORAGE_KEY)).toBe("fresh-csrf");
  });

  it("does not request CSRF for explicitly public mutations", async () => {
    sessionStorage.removeItem(CSRF_SESSION_STORAGE_KEY);
    mocks.request.mockResolvedValueOnce({ data: { ok: true } });

    await axiosPost("/auth/login", "en", { email: "a@b.test" }, false, true);

    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.request.mock.calls[0]?.[0]?.headers).not.toHaveProperty(
      "X-CSRF-Token",
    );
  });
});

describe("retry policy", () => {
  it.each([
    ["GET", () => axiosGet("/resource", "en")],
    ["POST", () => axiosPost("/resource", "en", { value: 1 })],
    ["PUT", () => axiosPut("/resource", "en", { value: 1 })],
    ["PATCH", () => axiosPatch("/resource", "en", { value: 1 })],
    ["DELETE", () => axiosDelete("/resource", "en")],
  ] as const)("%s retries once after an expired access cookie", async (_name, invoke) => {
    mocks.request
      .mockRejectedValueOnce(
        axiosError(401, { code: "ACCESS_TOKEN_EXPIRED" }),
      )
      .mockResolvedValueOnce({ data: { ok: true } });
    mocks.post.mockResolvedValueOnce({ data: {} });

    await expect(invoke()).resolves.toMatchObject({ status: true });
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  it("single-flights concurrent refreshes and retries each request once", async () => {
    const attempts = new Map<string, number>();
    mocks.request.mockImplementation(
      async ({ url }: { url: string }): Promise<{ data: unknown }> => {
        const attempt = (attempts.get(url) ?? 0) + 1;
        attempts.set(url, attempt);
        if (attempt === 1) {
          throw axiosError(401, { code: "ACCESS_TOKEN_EXPIRED" });
        }
        return { data: { url } };
      },
    );
    mocks.post.mockResolvedValueOnce({
      data: { csrfToken: "rotated-csrf" },
    });

    const [first, second] = await Promise.all([
      axiosGet("/one", "en"),
      axiosGet("/two", "en"),
    ]);

    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.post).toHaveBeenCalledWith(
      "https://api.example.test/auth/refresh",
      {},
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({
          "X-CSRF-Token": "stored-csrf",
        }),
      }),
    );
    expect(first.status).toBe(true);
    expect(second.status).toBe(true);
    expect(mocks.request).toHaveBeenCalledTimes(4);
  });

  it("never retries refresh indefinitely", async () => {
    mocks.request.mockRejectedValue(
      axiosError(401, { code: "ACCESS_TOKEN_EXPIRED" }),
    );
    mocks.post.mockResolvedValueOnce({ data: {} });

    await expect(axiosGet("/resource", "en")).resolves.toMatchObject({
      status: false,
      statusCode: 401,
    });
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.request).toHaveBeenCalledTimes(2);
  });

  it("regenerates a stale API key on 405 without refreshing JWT", async () => {
    mocks.request
      .mockRejectedValueOnce(axiosError(405, { code: "STALE_API_KEY" }))
      .mockResolvedValueOnce({ data: { ok: true } });

    await expect(axiosPatch("/resource", "en", { value: 1 })).resolves.toEqual({
      data: { ok: true },
      status: true,
    });

    expect(mocks.request).toHaveBeenCalledTimes(2);
    expect(mocks.post).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not refresh ordinary 401 responses", async () => {
    mocks.request.mockRejectedValueOnce(
      axiosError(401, { code: "INVALID_CREDENTIALS" }),
    );

    await expect(axiosGet("/resource", "en")).resolves.toMatchObject({
      status: false,
      statusCode: 401,
    });
    expect(mocks.post).not.toHaveBeenCalled();
  });
});

describe("error results", () => {
  it("narrows only Axios-shaped failures", () => {
    expect(asAxiosError({ response: { status: 409 } })).toEqual({
      response: { status: 409 },
    });
    expect(asAxiosError(new Error("network"))).toBeNull();
  });

  it("fails closed when utc-time is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn(),
      }),
    );

    await expect(axiosGet("/resource", "en")).resolves.toEqual({
      status: false,
      statusCode: 503,
    });
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it("fails closed when the UTC timestamp cannot be decrypted", async () => {
    mocks.decryptDataApi.mockImplementation(() => {
      const error = new Error("Decrypt failed");
      error.name = "DecryptError";
      throw error;
    });

    await expect(axiosGet("/resource", "en")).resolves.toEqual({
      status: false,
      statusCode: 503,
    });
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it("preserves backend payloads and status codes", async () => {
    const payload = { error: "conflict" };
    mocks.request.mockRejectedValueOnce(axiosError(409, payload));

    await expect(axiosDelete("/resource", "en")).resolves.toEqual({
      data: payload,
      status: false,
      statusCode: 409,
    });
  });
});
