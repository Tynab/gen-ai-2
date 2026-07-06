"""
Cấu hình chung cho pytest — QUAN TRỌNG: ép toàn bộ test chạy ở chế độ MOCK.

.env trên máy dev có thể chứa thông tin Supabase thật; nếu để postgres_enabled()
trả True thì test tạo đơn sẽ ghi dữ liệu và trừ tồn kho THẬT. Vì vậy:
1. Đặt rỗng các biến DB_*/OPENAI_API_KEY TRƯỚC khi import app — load_dotenv()
   (mặc định override=False) sẽ không ghi đè biến đã tồn tại trong môi trường,
   nên data_service/chat_service đọc được giá trị rỗng → mock mode, không OpenAI.
2. Fixture autouse chặn cứng: nếu vì lý do gì postgres_enabled() vẫn True thì
   dừng toàn bộ phiên test ngay lập tức.
"""

import os

# Bước 1 phải nằm TRƯỚC mọi import app.* (kể cả gián tiếp qua fixture/test module).
for _var in ("DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_DATABASE", "OPENAI_API_KEY"):
    os.environ[_var] = ""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import data_service


@pytest.fixture(autouse=True, scope="session")
def _bat_buoc_mock_mode():
    # Bước 2: lớp chặn cuối — tuyệt đối không cho test chạm Postgres thật.
    if data_service.postgres_enabled():
        pytest.exit(
            "NGUY HIỂM: postgres_enabled() đang True trong phiên test — "
            "test sẽ ghi vào database thật. Kiểm tra lại conftest.py/.env.",
            returncode=2,
        )
    yield


@pytest.fixture()
def client():
    return TestClient(app)
