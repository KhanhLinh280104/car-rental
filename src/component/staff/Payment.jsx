import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Landmark,
  Receipt,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Search,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { getBookingById, mockBookings, formatMoneyVND } from "./mockBookings";

function calcDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.max(0, e.getTime() - s.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  return days;
}

export default function Payment() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { notifyConfirm, notifySuccess, notifyError } = useNotification();

  const booking = useMemo(() => (bookingId ? getBookingById(bookingId) : null), [bookingId]);

  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card"); // card | cash | transfer
  const [discount, setDiscount] = useState(0);
  const [extraFee, setExtraFee] = useState(booking?.id === "2" ? 1700000 : 0);
  const [note, setNote] = useState("");
  const [paid, setPaid] = useState(false);

  const days = booking ? calcDays(booking.start, booking.end) : 0;
  const deposit = booking?.deposit || 0;
  const baseTotal = booking?.total || 0;

  const grandTotal = Math.max(0, baseTotal + Number(extraFee || 0) - Number(discount || 0));
  const remaining = Math.max(0, grandTotal - deposit);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockBookings;
    return mockBookings.filter((b) => {
      const text = `${b.id} ${b.vehicle.name} ${b.vehicle.plate} ${b.customer.name}`.toLowerCase();
      return text.includes(q);
    });
  }, [search]);

  const onConfirmPay = () => {
    if (!booking) {
      notifyError("Vui lòng chọn đơn để thanh toán.");
      return;
    }
    if (paid) {
      notifyError("Đơn này đã được ghi nhận là đã thanh toán.");
      return;
    }
    notifyConfirm(
      "Xác nhận thanh toán?",
      `Tổng cần thu: ${formatMoneyVND(remaining)} (đã cọc: ${formatMoneyVND(deposit)}).`,
      () => {
        notifySuccess("Thanh toán thành công!", () => {
          setPaid(true);
          navigate("/staff/booking");
        });
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/staff/booking")}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Thanh toán</h2>
            <p className="text-sm text-gray-500 mt-0.5">Chốt hoá đơn, thu tiền, xuất biên nhận.</p>
          </div>
        </div>

        {paid ? (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <CheckCircle size={16} /> Đã thanh toán
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <AlertTriangle size={16} /> Chưa thanh toán
          </span>
        )}
      </div>

      {!booking ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Search size={18} className="text-gray-600" /> Chọn đơn để thanh toán
            </h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn, tên xe, biển số, khách..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="mt-4 space-y-2 max-h-[420px] overflow-auto pr-1">
              {filteredBookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/staff/payment/${b.id}`)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">Đơn #{b.id}</span>
                    <span className="text-sm text-gray-500">{formatMoneyVND(b.total)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{b.vehicle.name} • {b.vehicle.plate}</p>
                  <p className="text-xs text-gray-400 mt-1">{b.customer.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Receipt size={44} className="mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-gray-600">Chưa chọn đơn</p>
              <p className="text-sm mt-1">Chọn 1 đơn ở bên trái để xem hoá đơn và thanh toán.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Receipt size={18} className="text-gray-700" /> Hoá đơn đơn #{booking.id}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500">Khách hàng</p>
                  <p className="font-semibold text-gray-800 mt-1">{booking.customer.name}</p>
                  <p className="text-gray-500 mt-1">SĐT: {booking.customer.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500">Xe</p>
                  <p className="font-semibold text-gray-800 mt-1">{booking.vehicle.name}</p>
                  <p className="text-gray-500 mt-1">Biển số: {booking.vehicle.plate}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500">Thời gian thuê</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {booking.start} → {booking.end}
                  </p>
                  <p className="text-gray-500 mt-1">Số ngày: {days}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500">Trạng thái</p>
                  <p className="font-semibold text-gray-800 mt-1">{paid ? "Đã thanh toán" : "Chưa thanh toán"}</p>
                  <p className="text-gray-500 mt-1">Hình thức: {paymentMethod === "card" ? "Thẻ" : paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiền thuê xe</span>
                  <span className="font-semibold text-gray-800">{formatMoneyVND(baseTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phụ thu (hư hại/vi phạm)</span>
                  <span className="font-semibold text-gray-800">{formatMoneyVND(extraFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-semibold text-gray-800">- {formatMoneyVND(discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đã đặt cọc</span>
                  <span className="font-semibold text-gray-800">- {formatMoneyVND(deposit)}</span>
                </div>

                <div className="mt-2 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Cần thu</p>
                    <p className="text-2xl font-extrabold text-gray-900">{formatMoneyVND(remaining)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ShieldCheck size={18} className="text-green-600" />
                    Đối soát cọc tự động
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Điều chỉnh hoá đơn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phụ thu (₫)</label>
                  <input
                    type="number"
                    value={extraFee}
                    onChange={(e) => setExtraFee(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Giảm giá (₫)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Miễn phí rửa xe / Giảm giá khách thân thiết..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Phương thức thanh toán</h3>
              <div className="space-y-2">
                {[
                  { id: "card", label: "Quẹt thẻ / POS", icon: <CreditCard size={18} /> },
                  { id: "cash", label: "Tiền mặt", icon: <Wallet size={18} /> },
                  { id: "transfer", label: "Chuyển khoản", icon: <Landmark size={18} /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                      paymentMethod === m.id
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      {m.icon} {m.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${paymentMethod === m.id ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {paymentMethod === m.id ? "Đang chọn" : "Chọn"}
                    </span>
                  </button>
                ))}
              </div>

              {paymentMethod === "transfer" && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                  <p className="font-bold">Thông tin chuyển khoản</p>
                  <p className="mt-2">Ngân hàng: Vietcombank</p>
                  <p>STK: 0123 456 789</p>
                  <p>ND: CAR-{booking.id}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Xác nhận</h3>
              <button
                onClick={onConfirmPay}
                disabled={paid}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition shadow-lg ${
                  paid ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
                }`}
              >
                Xác nhận đã thanh toán
              </button>
              <button
                onClick={() => navigate(`/staff/return-ai/${booking.id}`)}
                className="w-full mt-3 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition text-gray-700"
              >
                Quay lại Trả xe
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Bằng việc xác nhận, hệ thống sẽ lưu biên nhận và đóng đơn.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

