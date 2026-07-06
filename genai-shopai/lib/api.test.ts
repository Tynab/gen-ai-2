// Unit test cho lib/api.ts — stub global fetch để kiểm tra cách dựng URL/body,
// không gọi mạng thật. Trọng tâm: logic query param của getProducts (bỏ search
// rỗng, bỏ category "Tất cả") và xử lý lỗi non-OK của request<T>.
import { afterEach, describe, expect, it, vi } from "vitest";
import { getProducts, sendChatMessage } from "@/lib/api";

function stubFetch(response: { ok: boolean; status?: number; body?: unknown; text?: string }) {
  const mock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: () => Promise.resolve(response.body ?? {}),
    text: () => Promise.resolve(response.text ?? "")
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getProducts", () => {
  it("không gửi query param khi search rỗng và category là 'Tất cả'", async () => {
    const mock = stubFetch({ ok: true, body: { products: [], categories: [] } });
    await getProducts("   ", "Tất cả");
    const url = mock.mock.calls[0][0] as string;
    expect(url.endsWith("/api/products")).toBe(true);
    expect(url).not.toContain("?");
  });

  it("encode search + category vào query string", async () => {
    const mock = stubFetch({ ok: true, body: { products: [], categories: [] } });
    await getProducts("tai nghe", "Điện tử");
    // Parse URL rồi so giá trị đã decode — tránh phụ thuộc cách encode cụ thể
    // (URLSearchParams dùng "+" cho space, khác encodeURIComponent dùng "%20").
    const url = new URL(mock.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/api/products");
    expect(url.searchParams.get("search")).toBe("tai nghe");
    expect(url.searchParams.get("category")).toBe("Điện tử");
  });

  it("ném Error kèm detail khi backend trả non-OK", async () => {
    stubFetch({ ok: false, status: 500, text: "Loi server" });
    await expect(getProducts("", "")).rejects.toThrow("Loi server");
  });
});

describe("sendChatMessage", () => {
  it("POST đúng endpoint /api/chat với body JSON", async () => {
    const mock = stubFetch({ ok: true, body: { reply: "ok" } });
    await sendChatMessage({ message: "xin chào", mode: "with_context" });
    const [url, options] = mock.mock.calls[0] as [string, RequestInit];
    expect(url.endsWith("/api/chat")).toBe(true);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ message: "xin chào", mode: "with_context" });
  });
});
