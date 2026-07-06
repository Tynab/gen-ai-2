create extension if not exists pgcrypto;

-- Danh mục sản phẩm hiển thị ở trang chủ và dùng trong system prompt của chatbot.
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  price integer not null check (price >= 0),
  original_price integer check (original_price is null or original_price >= price),
  category text not null,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  sold_count integer not null default 0 check (sold_count >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text not null,
  variants text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Câu hỏi thường gặp, chatbot dùng để trả lời khi không cần OpenAI (fallback_reply).
create table if not exists public.faqs (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

-- status giới hạn đúng 5 giá trị tiếng Việt dùng trong toàn bộ app — đổi ở đây trước khi đổi logic ứng dụng.
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  status text not null check (status in ('Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy')),
  total_amount integer not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now()
);

-- Từng dòng sản phẩm trong một đơn hàng; unique(order_id, product_id) là khóa cho "on conflict" trong seed.sql.
create table if not exists public.order_items (
  id bigserial primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price integer not null check (price >= 0),
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

-- Đã tạo sẵn cho việc lưu lịch sử chat nhưng app hiện chưa dùng (xem conversation_store trong chat_service.py).
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  mode text not null check (mode in ('with_context', 'without_context')),
  created_at timestamptz not null default now()
);

-- Từng message trong một conversation ở trên; cascade xóa theo conversations.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Index hỗ trợ filter theo category/tag và join order_items/messages theo khóa ngoại.
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_tags on public.products using gin(tags);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);

