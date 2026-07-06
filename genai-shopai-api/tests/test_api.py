"""
Bộ test API chạy trên dữ liệu mock (xem conftest.py) — hóa lại các kịch bản
smoke-test thủ công: health, tra cứu sản phẩm/đơn hàng, tạo đơn + trừ tồn kho,
và chatbot fallback (rule-based, không gọi OpenAI) gồm cả demo nhớ ngữ cảnh.
Lưu ý: mock data sống trong RAM của process pytest, nên các test tạo đơn tính
kỳ vọng tương đối theo trạng thái hiện tại thay vì hardcode số tuyệt đối.
"""

from app.services import mock_data


# ---------- Route tiện ích ----------

def test_health_bao_mock_mode(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "data_source": "mock"}


def test_root_redirect_ve_docs(client):
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/docs"


def test_favicon_tra_204(client):
    response = client.get("/favicon.ico")
    assert response.status_code == 204


# ---------- Products ----------

def test_list_products_va_categories(client):
    data = client.get("/api/products").json()
    assert len(data["products"]) == len(mock_data.PRODUCTS)
    # Router tự chèn "Tất cả" làm lựa chọn đầu tiên.
    assert data["categories"][0] == "Tất cả"


def test_search_loc_theo_keyword(client):
    data = client.get("/api/products", params={"search": "tai nghe"}).json()
    assert data["products"], "phải tìm thấy ít nhất 1 sản phẩm tai nghe"
    assert all("tai nghe" in (p["name"] + p["description"] + " ".join(p["tags"])).lower() for p in data["products"])


def test_get_product_theo_slug_va_id(client):
    by_slug = client.get("/api/products/tai-nghe-bluetooth-airbeat-s3").json()
    by_id = client.get("/api/products/p001").json()
    assert by_slug["id"] == by_id["id"] == "p001"


def test_get_product_khong_ton_tai_404(client):
    assert client.get("/api/products/khong-ton-tai").status_code == 404


# ---------- Orders ----------

def test_get_order_khong_phan_biet_hoa_thuong(client):
    response = client.get("/api/orders/od1001")
    assert response.status_code == 200
    assert response.json()["id"] == "OD1001"


def test_get_order_khong_ton_tai_404(client):
    assert client.get("/api/orders/OD9999").status_code == 404


def test_tao_don_tru_ton_kho(client):
    stock_truoc = mock_data.get_product("p003")["stock"]
    response = client.post(
        "/api/orders",
        json={
            "customer_name": "Pytest User",
            "phone": "0900000000",
            "address": "123 Duong Test, TP.HCM",
            "items": [{"product_id": "p003", "quantity": 2}],
        },
    )
    assert response.status_code == 200
    order = response.json()
    assert order["status"] == "Chờ xác nhận"
    assert order["total_amount"] == mock_data.get_product("p003")["price"] * 2
    assert mock_data.get_product("p003")["stock"] == stock_truoc - 2


def test_tao_don_het_hang_400(client):
    response = client.post(
        "/api/orders",
        json={
            "customer_name": "Pytest User",
            "phone": "0900000000",
            "address": "123 Duong Test, TP.HCM",
            "items": [{"product_id": "p003", "quantity": 999999}],
        },
    )
    assert response.status_code == 400
    assert "out of stock" in response.json()["detail"]


def test_tao_don_san_pham_khong_ton_tai_404(client):
    response = client.post(
        "/api/orders",
        json={
            "customer_name": "Pytest User",
            "phone": "0900000000",
            "address": "123 Duong Test, TP.HCM",
            "items": [{"product_id": "p999", "quantity": 1}],
        },
    )
    assert response.status_code == 404


def test_tao_don_body_thieu_422(client):
    response = client.post(
        "/api/orders",
        json={"customer_name": "A", "phone": "090", "address": "x", "items": []},
    )
    assert response.status_code == 422


# ---------- Chat (fallback rule-based — không có OPENAI_API_KEY trong test) ----------

def test_chat_tra_cuu_don_hang(client):
    response = client.post("/api/chat", json={"message": "Kiểm tra đơn OD1001", "mode": "with_context"})
    assert response.status_code == 200
    data = response.json()
    assert "OD1001" in data["reply"]
    assert data["used_context"] is True


def test_chat_faq_giao_hang(client):
    response = client.post("/api/chat", json={"message": "ship bao lâu vậy?", "mode": "with_context"})
    assert "giao" in response.json()["reply"].lower()


def test_chat_nho_ngu_canh_cai_do(client):
    # Lượt 1: hỏi về một sản phẩm cụ thể để bot ghi vào lịch sử hội thoại.
    first = client.post("/api/chat", json={"message": "tai nghe AirBeat", "mode": "with_context"}).json()
    # Lượt 2: hỏi nối "cái đó" trong cùng conversation — bot phải hiểu là AirBeat S3.
    second = client.post(
        "/api/chat",
        json={
            "message": "cái đó còn hàng không?",
            "mode": "with_context",
            "conversation_id": first["conversation_id"],
        },
    ).json()
    assert "AirBeat" in second["reply"]


def test_chat_khong_nho_ngu_canh_hoi_lai(client):
    response = client.post("/api/chat", json={"message": "cái đó còn hàng không?", "mode": "without_context"}).json()
    # Không có lịch sử → bot phải hỏi lại thay vì đoán sản phẩm.
    assert "sản phẩm nào" in response["reply"]
    assert response["used_context"] is False
