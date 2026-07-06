# ShopAI Assistant Frontend

Next.js 15 (App Router) + React 19 + TypeScript, giao diện demo ecommerce ShopAI.

## Kiến trúc

Toàn bộ state (sản phẩm, giỏ hàng, modal chi tiết, đơn hàng vừa tạo...) nằm ở
`app/page.tsx` và truyền xuống qua props — không dùng state library ngoài.

- `lib/api.ts` — wrapper fetch gọi backend FastAPI, một hàm cho mỗi endpoint.
- `lib/types.ts` — type mirror cho response schema bên backend.
- `components/chat-widget.tsx` — widget chat, tự quản lý state riêng (mode,
  conversationId, lịch sử tin nhắn); đổi mode with/without-context sẽ reset hội thoại.
- `components/cart-drawer.tsx` — form checkout tự giữ state riêng và gọi thẳng
  `createOrder()`, không qua callback của `page.tsx`.
- `app/layout.tsx` — font Noto Sans qua `next/font` (subset `latin`/`latin-ext`/`vietnamese`,
  expose biến CSS `--font-ui` cho `globals.css`) — không thêm `<link>` font ngoài.
- `next.config.mjs` — ảnh sản phẩm render qua `next/image`; `images.remotePatterns` chỉ
  whitelist `images.unsplash.com`, thêm ảnh từ host khác phải bổ sung pattern ở đây.

## Chạy

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint        # next lint (flat config eslint.config.mjs)
npm test            # vitest run — unit test cho lib/ (format, api)
npm run test:watch  # vitest ở chế độ watch
```

Yêu cầu Node.js ≥18.18 (xem `engines` trong `package.json`).
`package.json` có khối `overrides` ghim `postcss ^8.5.10` — giữ nguyên pin này khi cập nhật dependency.

Test viết bằng Vitest (`vitest.config.ts`, environment `node`), đặt cạnh code trong `lib/*.test.ts` —
hiện chỉ unit test logic thuần (chưa render React component nên chưa cần jsdom/@testing-library).

## Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Để trống hoặc không có `.env` vẫn chạy được — `lib/api.ts` tự fallback về `http://localhost:8000`.
Backend FastAPI phải chạy sẵn ở cổng đó (xem `genai-shopai-api/README.md`).

Không commit `.env`.
