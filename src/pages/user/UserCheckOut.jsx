import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Camera,
  Image as ImageIcon,
  UserRound,
  Star,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { getUserBookingById, formatMoneyVND } from "./mockUserBookings";

export default function UserCheckOut() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { notifyConfirm, notifySuccess, notifyError } = useNotification();

  const booking = useMemo(() => getUserBookingById(bookingId), [bookingId]);
  const isDriver = Boolean(booking?.driver);

  const [uploaded, setUploaded] = useState(false);
  const [notes, setNotes] = useState("");
  const [damageFee, setDamageFee] = useState(isDriver ? 0 : 0);
  const [rating, setRating] = useState(5);
  const [agree, setAgree] = useState(false);

  const onConfirm = (e) => {
    e.preventDefault();
    if (!booking) {
      notifyError("Không tìm thấy đơn.");
      return;
    }
    if (!uploaded && !isDriver) {
      notifyError("Vui lòng tải ảnh hiện trạng xe trước khi trả.");
      return;
    }
    notifyConfirm(
      "Xác nhận check-out?",
      "Bạn chắc chắn đã trả xe/hoàn tất chuyến và ghi nhận tình trạng đầy đủ?",
      () => {
        notifySuccess("Check-out thành công!", () => navigate(`/user/payment/${bookingId}`));
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
          <h2 className="text-2xl font-bold text-gray-800">Check-out (Trả xe)</h2>
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
                <Car size={18} className="text-gray-700" /> Thông tin trả xe
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin size={16} /> <strong>Địa điểm:</strong> {booking.dropoff.location}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={16} /> <strong>Giờ:</strong> {booking.dropoff.time}
                </p>
                <p className="text-gray-500">
                  Cọc: <span className="font-semibold text-gray-800">{formatMoneyVND(booking.deposit)}</span>
                </p>
              </div>
            </div>

            {isDriver && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <UserRound size={18} className="text-purple-600" /> Đánh giá tài xế
                </h3>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const v = idx + 1;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRating(v)}
                        className={`p-2 rounded-lg transition ${
                          rating >= v ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"
                        }`}
                        title={`${v} sao`}
                      >
                        <Star size={18} />
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">Tài xế: {booking.driver.name}</p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={onConfirm} className="space-y-5">
                {!isDriver ? (
                  <>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Camera size={18} className="text-gray-700" /> Ảnh hiện trạng lúc trả
                      </h4>
                      {!uploaded ? (
                        <div
                          onClick={() => setUploaded(true)}
                          className="min-h-[220px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition"
                        >
                          <ImageIcon size={40} className="mb-3 text-gray-400" />
                          <p className="font-medium text-gray-700">Bấm để tải ảnh lên</p>
                          <p className="text-sm mt-1">Khuyến nghị: chụp 4 góc + taplo</p>
                        </div>
                      ) : (
                        <div className="min-h-[220px] rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
                          <img
                            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80"
                            alt="Uploaded car"
                            className="w-full h-full object-cover opacity-90"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <h4 className="font-bold text-amber-800 flex items-center gap-2">
                        <AlertTriangle size={18} /> Phụ thu (nếu có)
                      </h4>
                      <p className="text-sm text-amber-800/80 mt-1">
                        Nếu phát sinh xước/móp/vi phạm, vui lòng nhập phụ thu dự kiến (sẽ đối soát khi thanh toán).
                      </p>
                      <div className="mt-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phụ thu (₫)</label>
                        <input
                          type="number"
                          value={damageFee}
                          onChange={(e) => setDamageFee(Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <h4 className="font-bold text-purple-800 flex items-center gap-2">
                      <UserRound size={18} /> Xác nhận kết thúc chuyến
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Với chuyến có tài xế, bạn chỉ cần xác nhận đã đến điểm trả và kết thúc chuyến.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="VD: trả xe đúng giờ / có phát sinh vệ sinh nội thất..."
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
                    Tôi xác nhận đã hoàn tất trả xe/kết thúc chuyến.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agree}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2 ${
                    agree ? "bg-gray-900 hover:bg-black" : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle size={20} /> Xác nhận Check-out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

