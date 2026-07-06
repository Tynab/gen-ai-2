import type { Config } from "tailwindcss";

// Bảng màu brand dùng xuyên suốt UI (bg-brand-orange, text-brand-teal...) — tái
// dùng các token này thay vì thêm màu/shadow mới khi cần style.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#ee4d2d",
          teal: "#0f766e",
          ink: "#182230",
          soft: "#f6f7fb"
        }
      },
      boxShadow: {
        panel: "0 18px 50px rgba(15, 23, 42, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;

