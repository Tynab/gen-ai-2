# ShopAI Assistant Backend

FastAPI backend cho ShopAI — sản phẩm, đơn hàng, và chatbot chăm sóc khách hàng.

## Kiến trúc

`app/routers/` (HTTP, mỏng) → `app/services/` (logic + truy cập dữ liệu) → `app/schemas/` (Pydantic models).

- `services/data_service.py`: mọi hàm rẽ nhánh Postgres/mock qua `postgres_enabled()`
  (đủ biến `DB_*` thì dùng Postgres, ngược lại dùng `services/mock_data.py`).
- `services/chat_service.py`: dùng OpenAI khi có `OPENAI_API_KEY` và API còn gọi được,
  ngược lại rơi về `fallback_reply()` (rule-based, tiếng Việt).

## Chạy

```bash
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Nếu PowerShell báo `Python was not found` (dính App Execution Alias của Microsoft Store), chạy trực tiếp bằng Python trong venv:

```bash
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Tạo `.env` từ `.env.example` nếu cần cấu hình — file mẫu để trống mọi giá trị; các giá trị
trong mục Environment bên dưới là mặc định trong code khi bỏ trống. Không có `.env` backend
vẫn chạy được: dữ liệu mock + chatbot rule-based.

Xem docs tại `http://127.0.0.1:8000/docs`. Kiểm tra nhanh nguồn dữ liệu đang dùng: `GET /api/health`.

## Test

```bash
.\.venv\Scripts\python.exe -m pytest        # hoặc `python -m pytest` khi đã activate venv
```

17 test trong `tests/test_api.py` (health, products, orders + trừ tồn kho, chatbot fallback
kể cả demo nhớ ngữ cảnh). `tests/conftest.py` **ép toàn bộ test chạy ở chế độ mock** — đặt rỗng
`DB_*`/`OPENAI_API_KEY` trước khi import app và dừng ngay nếu `postgres_enabled()` vẫn True,
nên test không bao giờ chạm Postgres thật hay gọi OpenAI (kể cả khi `.env` có credentials thật).

## Environment

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
FRONTEND_ORIGIN=http://localhost:3000

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_SSLMODE=require
```

Để trống bất kỳ biến nào trong 5 biến `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_DATABASE`
(mặc định để trống) → backend tự động dùng dữ liệu mock trong `app/services/mock_data.py`,
không cần Postgres để chạy demo. `DB_SSLMODE` không tham gia điều kiện này (mặc định `require`).

CORS: backend cho phép `FRONTEND_ORIGIN` cùng các origin localhost/127.0.0.1/0.0.0.0 và IP LAN
nội bộ (10.x, 192.168.x, 172.16–31.x, 100.64–127.x, 169.254.x) trên đúng cổng frontend — truy cập
frontend qua địa chỉ `Network:` mà `next dev` in ra vẫn gọi được API, không cần đổi cấu hình
(xem `allow_origin_regex` trong `app/main.py`).

Không commit `.env`.

## Database

Xem `supabase/README.md` để khởi tạo schema/seed nếu muốn chạy với Postgres thật.
