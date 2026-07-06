"use client";

// Widget chat nổi, tự quản lý state riêng (mode, conversationId, messages) — không
// nhận state này từ app/page.tsx. Đây là nửa UI của demo with/without-context: đổi
// mode sẽ reset conversationId và toàn bộ lịch sử hiển thị (xem switchMode).

import { Bot, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage, ChatMode } from "@/lib/types";

const starterPrompts = [
  "Tôi muốn mua tai nghe dưới 500k",
  "Cái màu đen còn hàng không?",
  "Kiểm tra đơn OD1001",
  "Chính sách đổi trả thế nào?"
];

export function ChatWidget() {
  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<ChatMode>("with_context");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Chào bạn, mình có thể tư vấn sản phẩm, tra đơn hàng và hỗ trợ chính sách của ShopAI."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submitMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: trimmed,
        mode,
        conversation_id: conversationId
      });
      setConversationId(response.conversation_id);
      setMessages((current) => [...current, { role: "assistant", content: response.reply }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error instanceof Error ? `Lỗi kết nối API: ${error.message}` : "Lỗi kết nối API"
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  function switchMode(nextMode: ChatMode) {
    // Đổi mode = bắt đầu hội thoại mới hoàn toàn: bỏ conversationId cũ để backend
    // (conversation_store) không còn liên kết lịch sử cũ với mode mới.
    setMode(nextMode);
    setConversationId(undefined);
    setMessages([
      {
        role: "assistant",
        content:
          nextMode === "with_context"
            ? "Mình đang ở chế độ nhớ ngữ cảnh. Bạn có thể hỏi nối tiếp bằng các cụm như 'cái đó' hoặc 'màu đen'."
            : "Mình đang ở chế độ không nhớ ngữ cảnh. Mỗi câu hỏi sẽ được xử lý độc lập."
      }
    ]);
  }

  if (!open) {
    return (
      <button
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-panel transition hover:bg-orange-600"
        onClick={() => setOpen(true)}
        aria-label="Mở chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <section className="fixed bottom-4 right-4 z-30 flex h-[min(620px,calc(100vh-32px))] w-[min(392px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-brand-ink px-4 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-white/10">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">ShopAI CSKH</h2>
            <p className="truncate text-xs text-slate-300">{mode === "with_context" ? "Nhớ ngữ cảnh" : "Không nhớ ngữ cảnh"}</p>
          </div>
        </div>
        <button className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label="Đóng chat">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-2 border-b border-slate-200 p-3">
        <button
          className={`h-9 rounded-md text-sm font-semibold ${mode === "with_context" ? "bg-brand-orange text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          onClick={() => switchMode("with_context")}
        >
          Nhớ ngữ cảnh
        </button>
        <button
          className={`h-9 rounded-md text-sm font-semibold ${mode === "without_context" ? "bg-brand-orange text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          onClick={() => switchMode("without_context")}
        >
          Không nhớ
        </button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-brand-orange text-white"
                  : "border border-slate-200 bg-white text-slate-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">Đang trả lời...</div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              className="h-8 shrink-0 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:border-brand-orange hover:text-brand-orange"
              onClick={() => submitMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="h-11 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-orange"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nhập câu hỏi..."
          />
          <button className="grid h-11 w-11 place-items-center rounded-md bg-brand-ink text-white hover:bg-slate-700 disabled:bg-slate-300" disabled={loading || !input.trim()} aria-label="Gửi">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

