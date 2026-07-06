// Unit test cho formatVnd — định dạng tiền VNĐ chuẩn vi-VN.
// Không so sánh chuỗi tuyệt đối vì khoảng trắng trước "₫" là non-breaking space
// và có thể khác nhau giữa các phiên bản ICU; chỉ kiểm tra phần số và ký hiệu.
import { describe, expect, it } from "vitest";
import { formatVnd } from "@/lib/format";

describe("formatVnd", () => {
  it("nhóm hàng nghìn bằng dấu chấm theo vi-VN", () => {
    const result = formatVnd(459000);
    expect(result).toContain("459.000");
    expect(result).toContain("₫");
  });

  it("không có phần thập phân dù giá lẻ", () => {
    expect(formatVnd(1290000)).not.toMatch(/[,.]\d{1,2}\s*₫/);
    expect(formatVnd(1290000)).toContain("1.290.000");
  });

  it("xử lý 0 đồng", () => {
    expect(formatVnd(0)).toContain("0");
    expect(formatVnd(0)).toContain("₫");
  });
});
