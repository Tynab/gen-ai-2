// Wrapper fetch mỏng gọi backend FastAPI — một hàm cho mỗi endpoint. Đọc
// NEXT_PUBLIC_API_BASE_URL từ .env, có fallback cứng http://localhost:8000 nếu thiếu.
import type { ChatMode, ChatResponse, Order, ProductListResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getProducts(search: string, category: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (category && category !== "Tất cả") params.set("category", category);
  const query = params.toString();
  return request<ProductListResponse>(`/api/products${query ? `?${query}` : ""}`);
}

// Payload request không có type riêng ở lib/types.ts — Product/Order/ChatResponse ở
// đó chỉ mirror các response schema bên backend (app/schemas/), không mirror request.
export function createOrder(payload: {
  customer_name: string;
  phone: string;
  address: string;
  items: { product_id: string; quantity: number }[];
}) {
  return request<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function sendChatMessage(payload: {
  message: string;
  mode: ChatMode;
  conversation_id?: string;
}) {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

