// Định dạng số tiền VNĐ theo chuẩn vi-VN, không có phần thập phân (giá luôn là số nguyên đồng).
export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value);
}

