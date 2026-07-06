import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

// Cấu hình Vitest cho frontend — chạy bằng `npm test` (vitest run).
// Test hiện tại chỉ là unit test thuần logic trong lib/ (không render React component)
// nên dùng environment "node", chưa cần jsdom/@testing-library.
export default defineConfig({
  resolve: {
    alias: {
      // Khớp alias "@/*" trong tsconfig.json để test import giống hệt code app.
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"]
  }
});
