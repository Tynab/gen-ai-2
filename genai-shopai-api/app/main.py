import os
from dotenv import load_dotenv
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.routers import chat, orders, products
from app.services.data_service import postgres_enabled

"""
Điểm khởi động FastAPI: đọc FRONTEND_ORIGIN cho CORS, đăng ký 3 router
(products/orders/chat), và expose GET /api/health để biết backend đang chạy
với Postgres hay dữ liệu mock.
"""

load_dotenv()

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
frontend_origin_port = frontend_origin.rsplit(":", 1)[-1] if ":" in frontend_origin else "3000"

app = FastAPI(
    title="ShopAI Assistant API",
    description="FastAPI backend for a Shopee-like ecommerce demo with an AI customer support bot.",
    version="0.1.0",
)

# Cho phép frontend (mặc định :3000) gọi API; đổi FRONTEND_ORIGIN trong .env nếu frontend chạy ở origin khác.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://127.0.0.1:3000"],
    # Ngoài origin cấu hình, chấp nhận mọi IP nội bộ trên cùng port frontend (localhost/0.0.0.0,
    # LAN 10.x / 192.168.x / 172.16-31.x, CGNAT/Tailscale 100.64-127.x) — để mở app từ thiết bị
    # khác trong mạng khi dev, ví dụ URL "Network:" mà next dev in ra.
    allow_origin_regex=(
        rf"^http://(localhost|127\.0\.0\.1|0\.0\.0\.0|"
        rf"10\.\d{{1,3}}\.\d{{1,3}}\.\d{{1,3}}|"
        rf"192\.168\.\d{{1,3}}\.\d{{1,3}}|"
        rf"172\.(1[6-9]|2\d|3[0-1])\.\d{{1,3}}\.\d{{1,3}}|"
        rf"100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{{1,3}}\.\d{{1,3}}|"
        # 169.254.x.x (link-local/APIPA) — chính là dải "Network:" mà next dev in ra khi máy không có DHCP.
        rf"169\.254\.\d{{1,3}}\.\d{{1,3}}"
        rf"):{frontend_origin_port}$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(orders.router)
app.include_router(chat.router)


# Mở base URL (http://127.0.0.1:8000) trên trình duyệt sẽ về thẳng Swagger UI thay vì 404.
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


# Trình duyệt luôn tự request favicon.ico; trả 204 (không có nội dung) để log uvicorn hết noise 404.
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "data_source": "postgres" if postgres_enabled() else "mock",
    }
