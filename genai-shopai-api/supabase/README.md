# PostgreSQL / Supabase Setup

Chạy 2 file này trong Supabase SQL Editor, hoặc bất kỳ client PostgreSQL nào kết nối
tới database của bạn, theo đúng thứ tự:

1. `schema.sql` — tạo 6 bảng: `products`, `faqs`, `orders`, `order_items`,
   `conversations`, `messages`. Idempotent (`create table/index if not exists`),
   chạy lại nhiều lần vẫn an toàn.
2. `seed.sql` — dữ liệu demo (16 sản phẩm, 6 FAQ, 3 đơn hàng mẫu). Idempotent
   (`on conflict ... do update`), chạy lại nhiều lần vẫn an toàn.

Lưu ý:
- `orders.status` bị ràng buộc CHECK cố định 5 giá trị tiếng Việt: `Chờ xác nhận`,
  `Đang xử lý`, `Đang giao`, `Đã giao`, `Đã hủy`. Thêm trạng thái mới phải sửa
  constraint này trong `schema.sql` trước.
- `conversations`/`messages` đã được tạo sẵn (khớp `ChatMode`/vai trò message) nhưng
  **chưa được backend sử dụng** — lịch sử chat hiện chỉ nằm trong RAM
  (`conversation_store` ở `app/services/chat_service.py`), mất khi restart.

Sau khi có database, điền thông tin kết nối vào `genai-shopai-api/.env`:

```bash
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=postgres
DB_SSLMODE=require
```

Lấy các giá trị này ở Supabase: `Project Settings` > `Database` > `Connection string`/`Connection parameters`.

Backend tự chuyển sang dùng Postgres ngay khi đủ 5 biến `DB_*` này (xem
`postgres_enabled()` trong `app/services/data_service.py`); nếu thiếu, backend
tiếp tục chạy với dữ liệu mock.
