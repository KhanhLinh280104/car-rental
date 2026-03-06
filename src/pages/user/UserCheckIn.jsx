import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  UserRound,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { getUserBookingById } from "./mockUserBookings";

export default function UserCheckIn() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { notifyConfirm, notifySuccess, notifyError } = useNotification();

  const booking = useMemo(() => getUserBookingById(bookingId), [bookingId]);
  const isDriver = Boolean(booking?.driver);

  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [notes, setNotes] = useState("");

  const onConfirm = (e) => {
    e.preventDefault();
    if (!booking) {
      notifyError("Không tìm thấy đơn.");
      return;
    }
    if (isDriver && otp.trim().length < 4) {
      notifyError("Vui lòng nhập OTP (tối thiểu 4 ký tự).");
      return;
    }
    notifyConfirm(
      "Xác nhận check-in?",
      isDriver
        ? "Bạn xác nhận đã lên xe/đã gặp tài xế và bắt đầu chuyến?"
        : "Bạn xác nhận đã nhận xe, kiểm tra tình trạng và sẵn sàng bắt đầu?",
      () => {
        notifySuccess("Check-in thành công!", () => navigate("/user/bookings"));
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/user/bookings")}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Check-in (Nhận xe)</h2>
          {booking && (
            <p className="text-sm text-gray-500 mt-0.5">
              Đơn #{booking.id} • {booking.vehicle.name} • {booking.vehicle.plate}
            </p>
          )}
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Car size={18} className="text-blue-600" /> Thông tin chuyến
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin size={16} /> <strong>Nhận:</strong> {booking.pickup.location}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={16} /> <strong>Giờ:</strong> {booking.pickup.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} /> <strong>Trả:</strong> {booking.dropoff.location}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={16} /> <strong>Giờ:</strong> {booking.dropoff.time}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-600" /> Loại dịch vụ
              </h3>
              {isDriver ? (
                <div className="text-sm text-gray-700">
                  <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    <UserRound size={16} /> Có tài xế
                  </p>
                  <p className="mt-3 text-gray-600">
                    Tài xế: <span className="font-semibold text-gray-800">{booking.driver.name}</span>
                  </p>
                  <p className="mt-1 text-gray-600 flex items-center gap-2">
                    <Phone size={16} /> {booking.driver.phone}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-700">
                  <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                    <KeyRound size={16} /> Tự lái
                  </p>
                  <p className="mt-3 text-gray-600">
                    Vui lòng chuẩn bị CCCD/BLX để đối chiếu khi nhận xe.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={onConfirm} className="space-y-5">
                {isDriver ? (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <h4 className="font-bold text-purple-800 flex items-center gap-2">
                      <UserRound size={18} /> Xác thực lên xe
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Nhập OTP do tài xế cung cấp để bắt đầu chuyến.
                    </p>
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">OTP *</label>
                      <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="VD: 1234"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2">
                      <AlertTriangle size={18} /> Checklist nhận xe
                    </h4>
                    <ul className="text-sm text-blue-900/80 mt-2 space-y-1 list-disc pl-5">
                      <li>Kiểm tra ngoại thất (xước, móp), nội thất, lốp.</li>
                      <li>Chụp ảnh 4 góc xe để đối chiếu khi trả.</li>
                      <li>Kiểm tra nhiên liệu/pin và giấy tờ xe.</li>
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="VD: nhận xe tại cổng A / yêu cầu ghế trẻ em..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    required
                  />
                  <label htmlFor="agree" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
                    Tôi xác nhận thông tin là đúng và đồng ý bắt đầu chuyến.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agree}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2 ${
                    agree ? "bg-gray-900 hover:bg-black" : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle size={20} /> Xác nhận Check-in
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

