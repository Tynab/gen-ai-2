"""
Router chat. Không tự xử lý lỗi ở đây — handle_chat()/call_openai() đã tự rơi
về fallback_reply() khi thiếu API key hoặc OpenAI lỗi (xem services/chat_service.py).
"""

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import handle_chat

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest):
    return handle_chat(payload)

