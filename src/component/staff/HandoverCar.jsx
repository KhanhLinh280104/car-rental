import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Battery, MapPin, Gauge, CheckCircle2 } from "lucide-react";
import { getVehicleStateApi } from "../../api/vehicleApi";
import { staffHandoverReturnApi } from "../../api/bookingApi";

const ReceiveCar = ({ bookingId, vehicleId, onSuccess }) => {
  const [state, setState]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes]     = useState("");

  useEffect(() => {
    const fetchState = async () => {
      try {
        setLoading(true);
        const res = await getVehicleStateApi(vehicleId);
        console.log("VEHICLE STATE:", res.data);
        const data = res.data?.data ?? res.data;
        setState(data);
      } catch (err) {
        setError("Không thể tải trạng thái xe");
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, [vehicleId]);

  const handleReceive = async () => {
    try {
      setSubmitting(true);
      await staffHandoverReturnApi(bookingId);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Nhận xe thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={28} />
        <p>Đang tải trạng thái xe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-red-500">
        <AlertCircle size={28} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Kiểm tra & Nhận xe</h2>

      {/* VEHICLE STATE CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Trạng thái hiện tại của xe</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Battery */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-2">
            <Battery size={24} className={
              state?.batteryLevel >= 50 ? "text-green-500"
              : state?.batteryLevel >= 20 ? "text-yellow-500"
              : "text-red-500"
            } />
            <p className="text-xs text-gray-400">Pin</p>
            <p className="font-semibold text-lg">{state?.batteryLevel ?? "—"}%</p>
            {state?.isCharging && (
              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Đang sạc</span>
            )}
          </div>

          {/* Odometer */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-2">
            <Gauge size={24} className="text-blue-500" />
            <p className="text-xs text-gray-400">Số km</p>
            <p className="font-semibold text-lg">
              {state?.odometerKm?.toLocaleString() ?? "—"} km
            </p>
          </div>

          {/* Speed */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-2">
            <Gauge size={24} className="text-purple-500" />
            <p className="text-xs text-gray-400">Tốc độ</p>
            <p className="font-semibold text-lg">{state?.speedKmh ?? 0} km/h</p>
          </div>

          {/* GPS */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-2">
            <MapPin size={24} className="text-red-500" />
            <p className="text-xs text-gray-400">Vị trí</p>
            <p className="font-medium text-sm text-center">
              {state?.latitude && state?.longitude
                ? `${state.latitude.toFixed(4)}, ${state.longitude.toFixed(4)}`
                : "Không có"}
            </p>
          </div>
        </div>
      </div>

      {/* CHECKLIST */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Danh sách kiểm tra</h3>
        <div className="space-y-3">
          {[
            "Ngoại thất xe không trầy xước",
            "Nội thất sạch sẽ, không hư hỏng",
            "Lốp xe đầy đủ áp suất",
            "Đèn xe hoạt động bình thường",
            "Giấy tờ xe đầy đủ",
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 accent-green-600" />
              <span className="text-gray-700 group-hover:text-gray-900">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* GHI CHÚ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-3">Ghi chú</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nhập ghi chú nếu có vấn đề với xe..."
          rows={3}
          className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <button
          onClick={handleReceive}
          disabled={submitting}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
            : <><CheckCircle2 size={18} /> Xác nhận nhận xe</>
          }
        </button>
      </div>
    </div>
  );
};

export default ReceiveCar;