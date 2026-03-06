import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  Car,
  MapPin,
  Calendar,
  CreditCard,
  Wallet,
  Landmark,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { formatMoneyVND, getUserBookingById } from "./mockUserBookings";

export default function UserPayment() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { notifyConfirm, notifySuccess, notifyError } = useNotification();

  const booking = useMemo(() => getUserBookingById(bookingId), [bookingId]);
  const isDriver = Boolean(booking?.driver);

  const [method, setMethod] = useState("card"); // card | cash | transfer
  const [discount, setDiscount] = useState(0);
  const [extraFee, setExtraFee] = useState(booking?.status === "returned" ? 0 : 0);
  const [paid, setPaid] = useState(false);

  const baseTotal = booking?.total || 0;
  const deposit = booking?.deposit || 0;
  const grandTotal = Math.max(0, baseTotal + Number(extraFee || 0) - Number(discount || 0));
  const remaining = Math.max(0, grandTotal - deposit);

  const onPay = () => {
    if (!booking) {
      notifyError("Không tìm thấy đơn.");
      return;
    }
    if (paid) {
      notifyError("Đơn này đã được ghi nhận là đã thanh toán.");
      return;
    }
    notifyConfirm(
      "Xác nhận thanh toán?",
      `Số tiền cần thanh toán: ${formatMoneyVND(remaining)} (đã cọc: ${formatMoneyVND(deposit)}).`,
      () => {
        notifySuccess("Thanh toán thành công!", () => {
          setPaid(true);
          navigate("/user/bookings");
        });
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/user/bookings")}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Thanh toán</h2>
            {booking && (
              <p className="text-sm text-gray-500 mt-0.5">
                Đơn #{booking.id} • {booking.vehicle.name} • {booking.vehicle.plate}
              </p>
            )}
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 font-semibold">Không tìm thấy đơn.</p>
          <div className="mt-4">
            <button
              onClick={() => navigate("/user/bookings")}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
            >
              Về danh sách đơn
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Receipt size={18} className="text-gray-700" /> Hoá đơn
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 flex items-center gap-2">
                    <Car size={16} /> Xe
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">{booking.vehicle.name}</p>
                  <p className="text-gray-500 mt-1">Biển số: {booking.vehicle.plate}</p>
                  <p className="text-gray-500 mt-1">
                    Dịch vụ:{" "}
                    <span className="font-semibold text-gray-800">
                      {isDriver ? "Có tài xế" : "Tự lái"}
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 flex items-center gap-2">
                    <MapPin size={16} /> Nhận / Trả
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">{booking.pickup.location}</p>
                  <p className="text-gray-600 mt-1">→ {booking.dropoff.location}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 flex items-center gap-2">
                    <Calendar size={16} /> Thời gian
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">{booking.pickup.time}</p>
                  <p className="text-gray-600 mt-1">→ {booking.dropoff.time}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 flex items-center gap-2">
                    <ShieldCheck size={16} /> Đối soát
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">Cọc: {formatMoneyVND(deposit)}</p>
                  <p className="text-gray-600 mt-1">Cần thanh toán: {formatMoneyVND(remaining)}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiền thuê</span>
                  <span className="font-semibold text-gray-800">{formatMoneyVND(baseTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phụ thu</span>
                  <span className="font-semibold text-gray-800">{formatMoneyVND(extraFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-semibold text-gray-800">- {formatMoneyVND(discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đã cọc</span>
                  <span className="font-semibold text-gray-800">- {formatMoneyVND(deposit)}</span>
                </div>

                <div className="mt-2 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Cần thanh toán</p>
                    <p className="text-2xl font-extrabold text-gray-900">{formatMoneyVND(remaining)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Điều chỉnh</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phụ thu (₫)</label>
                  <input
                    type="number"
                    value={extraFee}
                    onChange={(e) => setExtraFee(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
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
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Phương thức</h3>
              <div className="space-y-2">
                {[
                  { id: "card", label: "Thẻ", icon: <CreditCard size={18} /> },
                  { id: "cash", label: "Tiền mặt", icon: <Wallet size={18} /> },
                  { id: "transfer", label: "Chuyển khoản", icon: <Landmark size={18} /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                      method === m.id
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      {m.icon} {m.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        method === m.id ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {method === m.id ? "Đang chọn" : "Chọn"}
                    </span>
                  </button>
                ))}
              </div>

              {method === "transfer" && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                  <p className="font-bold">Chuyển khoản</p>
                  <p className="mt-2">Ngân hàng: Vietcombank</p>
                  <p>STK: 0123 456 789</p>
                  <p>ND: RENT-{booking.id}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Xác nhận</h3>
              <button
                onClick={onPay}
                disabled={paid}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition shadow-lg ${
                  paid ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
                }`}
              >
                Xác nhận thanh toán
              </button>
              <button
                onClick={() => navigate(`/user/checkout/${booking.id}`)}
                className="w-full mt-3 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition text-gray-700"
              >
                Quay lại Check-out
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Bạn có thể thanh toán cho cả đơn tự lái hoặc có tài xế.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

