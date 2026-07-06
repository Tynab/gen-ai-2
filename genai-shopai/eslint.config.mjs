// Cấu hình ESLint dạng flat config (ESLint 9) — file config duy nhất của frontend, chạy qua `npm run lint`.
// Dùng FlatCompat để "dịch" hai preset kiểu eslintrc cũ của Next (next/core-web-vitals, next/typescript)
// sang flat config vì Next 15 chưa export sẵn bản flat.
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// File .mjs không có sẵn __dirname — tự dựng lại từ import.meta.url để FlatCompat biết thư mục gốc project.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default eslintConfig;
