// Type mirror cho các RESPONSE schema (Pydantic) bên backend: app/schemas/product.py,
// order.py, chat.py. Sửa schema bên backend thì phải sửa type tương ứng ở đây.
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number | null;
  category: string;
  rating: number;
  sold_count: number;
  stock: number;
  image_url: string;
  variants: string[];
  tags: string[];
};

export type ProductListResponse = {
  products: Product[];
  categories: string[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
};

export type ChatMode = "with_context" | "without_context";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponse = {
  conversation_id: string;
  mode: ChatMode;
  reply: string;
  used_context: boolean;
  messages: ChatMessage[];
};

