export const mockUserBookings = [
  {
    id: "U1001",
    vehicle: { name: "Toyota Camry", plate: "ABC-123" },
    customer: { name: "Bạn" },
    driver: null, // Tự lái
    pickup: { location: "CN Quận 1", time: "2026-03-08 09:00" },
    dropoff: { location: "CN Quận 1", time: "2026-03-10 18:00" },
    total: 3500000,
    deposit: 1000000,
    status: "confirmed", // confirmed -> checked_in -> returned -> paid
  },
  {
    id: "U1002",
    vehicle: { name: "Honda Civic", plate: "XYZ-789" },
    customer: { name: "Bạn" },
    driver: { name: "Tài xế Minh", phone: "0909 999 999", rating: 4.8 },
    pickup: { location: "Sân bay Tân Sơn Nhất", time: "2026-03-07 14:30" },
    dropoff: { location: "CN Quận 3", time: "2026-03-07 20:30" },
    total: 1200000,
    deposit: 200000,
    status: "checked_in",
  },
  {
    id: "U1003",
    vehicle: { name: "Kia K5", plate: "K5-567" },
    customer: { name: "Bạn" },
    driver: null,
    pickup: { location: "CN Thủ Đức", time: "2026-03-01 08:00" },
    dropoff: { location: "CN Thủ Đức", time: "2026-03-03 08:00" },
    total: 2400000,
    deposit: 500000,
    status: "returned",
  },
];

export function getUserBookingById(id) {
  return mockUserBookings.find((b) => b.id === String(id)) || null;
}

export function formatMoneyVND(amount) {
  const n = Number(amount || 0);
  return `${n.toLocaleString("vi-VN")} ₫`;
}

