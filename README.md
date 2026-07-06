# gen-ai-2 — ShopAI

CyberSoft Gen AI 01 — demo ecommerce "ShopAI" với chatbot chăm sóc khách hàng AI.

Monorepo gồm 2 app độc lập, không có tooling/workspace chung:

- [`genai-shopai-api/`](genai-shopai-api/README.md) — backend FastAPI (Python).
- [`genai-shopai/`](genai-shopai/README.md) — frontend Next.js (TypeScript).

Chạy demo đầy đủ cần cả 2 app cùng lúc: backend ở cổng 8000, frontend ở cổng 3000 —
CORS đã được cấu hình sẵn cho cặp cổng mặc định này. Xem README của từng app để biết cách chạy.

Xem `CLAUDE.md` để biết kiến trúc chi tiết, quy ước code, và những gì không nên
tự ý thay đổi.
