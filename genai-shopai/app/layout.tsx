import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

// Root layout của Next.js App Router — set "vi" cho <html> vì toàn bộ UI/nội dung chatbot đều bằng tiếng Việt.

export const metadata: Metadata = {
  title: "ShopAI Assistant",
  description: "Shopee-like ecommerce demo with an AI customer support assistant"
};

const notoSans = Noto_Sans({
  // "vietnamese" để preload luôn file font chứa U+1EA0-1EF9 (ể, ớ, ữ, ả...) —
  // thiếu subset này font vẫn được serve nhưng tải trễ, gây chớp font ở ký tự có dấu.
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  variable: "--font-ui"
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: một số extension trình duyệt (vd Grammarly, trình
    // detect JS kiểu Modernizr) tự chèn class như "mdl-js" vào <html> trước khi React
    // hydrate, gây cảnh báo mismatch không liên quan gì tới code của app.
    <html lang="vi" className={notoSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

