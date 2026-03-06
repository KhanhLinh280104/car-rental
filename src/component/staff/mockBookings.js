export const mockBookings = [
  {
    id: "1",
    vehicle: { name: "Toyota Camry", plate: "ABC-123" },
    customer: { name: "Nguyễn Văn A", phone: "0912345678" },
    driver: null,
    start: "2024-02-01",
    end: "2024-02-05",
    total: 3500000,
    status: "confirmed",
    deposit: 1000000,
  },
  {
    id: "2",
    vehicle: { name: "Honda Civic", plate: "XYZ-789" },
    customer: { name: "Trần Thị B", phone: "0987654321" },
    driver: { name: "Tài xế Minh", phone: "0909999999" },
    start: "2024-01-28",
    end: "2024-02-02",
    total: 2800000,
    status: "checked_in",
    deposit: 500000,
  },
];

export function getBookingById(bookingId) {
  return mockBookings.find((b) => b.id === String(bookingId)) || null;
}

export function formatMoneyVND(amount) {
  const n = Number(amount || 0);
  return `${n.toLocaleString("vi-VN")} ₫`;
}

