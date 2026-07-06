/** @type {import('next').NextConfig} */
// Không có rewrites/proxy tới backend — frontend gọi thẳng NEXT_PUBLIC_API_BASE_URL (xem lib/api.ts).
// images.remotePatterns cho phép next/image tối ưu ảnh sản phẩm demo từ Unsplash.
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
