import { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock, CheckCircle, X, AlertCircle, MapPin, User, Phone,
  Navigation, Play, StopCircle, LogIn, LogOut, Loader2,
  AlertTriangle, RefreshCw, Car,
} from "lucide-react";
import {
  getDriverByUserIdApi,
  getDriverBookingsApi,
  driverPickupConfirmedApi,
  driverCompleteTripApi,
} from "../../api/bookingApi";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (s) =>
  s ? new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

// ─── Modal nhập Odometer ───────────────────────────────────────────────────
function OdometerModal({ title, unit, onConfirm, onClose }) {
  const [odoMeter, setOdoMeter] = useState("");
  const [condition, setCondition] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!odoMeter || isNaN(Number(odoMeter)) || Number(odoMeter) < 0) {
      setError("Vui lòng nhập số km đồng hồ hợp lệ.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onConfirm({ odoMeter: Number(odoMeter), condition });
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">Xe #{unit.vehicleId}</p>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số km đồng hồ tại thời điểm hiện tại *
            </label>
            <input
              type="number"
              min={0}
              value={odoMeter}
              onChange={(e) => setOdoMeter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ví dụ: 52340"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tình trạng xe (tuỳ chọn)
            </label>
            <textarea
              rows={3}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Mô tả tình trạng xe: lốp, đèn, vết xước..."
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trip Card ─────────────────────────────────────────────────────────────
function TripCard({ booking, driverProfileId, onRefresh }) {
  const [modal, setModal] = useState(null); // "pickup" | "complete"
  const [activeUnit, setActiveUnit] = useState(null);

  // Lấy đơn vị xe đầu tiên (các booking có tài xế chỉ có 1 xe)
  const unit = booking.rentalUnits?.[0] || null;

  const handlePickup = async (formData) => {
    await driverPickupConfirmedApi(booking.id, {
      rentalUnitId: unit.id,
      type: "PICKUP",
      odoMeter: formData.odoMeter,
      condition: formData.condition,
    });
    onRefresh();
  };

  const handleComplete = async (formData) => {
    await driverCompleteTripApi(booking.id, {
      rentalUnitId: unit.id,
      type: "RETURN",
      odoMeter: formData.odoMeter,
      condition: formData.condition,
    });
    onRefresh();
  };

  const openPickup = () => { setActiveUnit(unit); setModal("pickup"); };
  const openComplete = () => { setActiveUnit(unit); setModal("complete"); };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trip info */}
          <div className="md:col-span-2 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  #{booking.id}
                  {booking.bookingCode && (
                    <span className="ml-2 text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {booking.bookingCode}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Tạo lúc: {fmtDate(booking.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${booking.status === "CONFIRMED"
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : booking.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-700 border-blue-200 animate-pulse"
                  : "bg-green-100 text-green-700 border-green-200"
                }`}>
                {booking.status === "CONFIRMED" ? "Chờ đón khách" :
                  booking.status === "IN_PROGRESS" ? "🟢 Đang thực hiện" : "✅ Hoàn thành"}
              </span>
            </div>

            {/* Customer info */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={15} className="text-gray-400" />
                <span className="font-medium">{booking.userId}</span>
              </div>
              {booking.deliveryMode === "DELIVERY" && booking.deliveryAddress && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={15} className="text-gray-400" />
                  <span>{booking.deliveryAddress}</span>
                </div>
              )}
            </div>

            {/* Rental units */}
            {unit && (
              <div className="text-sm space-y-1.5">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Chi tiết xe</p>
                <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <Car size={15} className="text-gray-400" /> Xe #{unit.vehicleId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {fmtDate(unit.startTime)} → {fmtDate(unit.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 justify-center">
            {booking.status === "CONFIRMED" && (
              <button
                onClick={openPickup}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-sm shadow-sm"
              >
                <CheckCircle size={18} />
                Xác nhận đón khách
              </button>
            )}
            {booking.status === "IN_PROGRESS" && (
              <button
                onClick={openComplete}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm shadow-sm"
              >
                <StopCircle size={18} />
                Hoàn thành chuyến
              </button>
            )}
            {booking.status === "COMPLETED" && (
              <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center text-sm font-semibold">
                ✅ Chuyến đã hoàn thành
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === "pickup" && activeUnit && (
        <OdometerModal
          title="Xác nhận đón khách"
          unit={activeUnit}
          onConfirm={handlePickup}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "complete" && activeUnit && (
        <OdometerModal
          title="Hoàn thành chuyến đi"
          unit={activeUnit}
          onConfirm={handleComplete}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: "CONFIRMED", label: "Chờ đón khách", icon: "📋" },
  { key: "IN_PROGRESS", label: "Đang thực hiện", icon: "🚗" },
  { key: "COMPLETED", label: "Đã hoàn thành", icon: "✅" },
];

export default function DriverTrip() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [activeTab, setActiveTab] = useState("CONFIRMED");
  const [bookings, setBookings] = useState([]);
  const [driverProfileId, setDriverProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashMsg, setFlashMsg] = useState("");

  // Dùng ref để cache profileId, tránh double-fetch do driverProfileId trong deps
  const profileIdRef = useRef(null);

  const userId = localStorage.getItem("userId");

  const flash = (msg) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 3000);
  };

  // Fetch bookings assigned to this driver
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Lấy profile tài xế — chỉ gọi IAM 1 lần, cache vào ref
      let profileId = profileIdRef.current;
      if (!profileId && userId) {
        try {
          const profileRes = await getDriverByUserIdApi(userId);
          profileId = profileRes.data?.data?.id;
          if (profileId) {
            profileIdRef.current = profileId;
            setDriverProfileId(profileId);
          }
        } catch (e) {
          console.warn("[DriverTrip] Không tìm thấy profile tài xế cho userId:", userId);
        }
      }

      if (!profileId) {
        setBookings([]);
        setError("Tài khoản chưa có hồ sơ tài xế. Vui lòng liên hệ quản trị viên.");
        return;
      }

      // 2. Lấy booking của tài xế theo tab đang chọn
      const res = await getDriverBookingsApi(profileId, activeTab, 0, 50);
      setBookings(res.data?.data?.content || []);
    } catch (e) {
      console.error("[DriverTrip] Lỗi fetch bookings:", e);
      setError("Không thể tải danh sách chuyến. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, userId]); // profileIdRef không cần trong deps vì là ref

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    setCheckedIn(true);
    flash("✅ Check-in thành công!");
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setCheckInTime(null);
    flash("✅ Check-out thành công!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Quản lý chuyến đi</h1>
          <p className="text-gray-500 mt-1">Theo dõi và xử lý các chuyến xe được phân công.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Flash message */}
      {flashMsg && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium text-sm">
          <CheckCircle size={18} /> {flashMsg}
        </div>
      )}

      {/* Check-in/Check-out */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Clock className="text-blue-500" size={24} />
          Check-in / Check-out hàng ngày
        </h2>
        {!checkedIn ? (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-5 border border-blue-200 gap-4">
            <div>
              <p className="font-medium text-gray-700">Bạn chưa check-in hôm nay</p>
              <p className="text-sm text-gray-500 mt-0.5">Nhấn để bắt đầu ca làm việc</p>
            </div>
            <button
              onClick={handleCheckIn}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold shadow-sm"
            >
              <LogIn size={18} /> Check-in ngay
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-5 border border-green-300 gap-4">
            <div>
              <p className="font-medium text-green-700">✅ Đã check-in lúc {checkInTime}</p>
              <p className="text-sm text-gray-500 mt-0.5">Ca làm việc đang diễn ra</p>
            </div>
            <button
              onClick={handleCheckOut}
              className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold shadow-sm"
            >
              <LogOut size={18} /> Check-out
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-sm font-semibold transition whitespace-nowrap ${activeTab === t.key
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {t.icon} {t.label}
            {!loading && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}>
                {bookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-blue-500" size={36} />
          <p className="text-gray-500 text-sm">Đang tải danh sách chuyến...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <AlertTriangle size={40} className="text-red-400" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Thử lại
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-gray-50 rounded-2xl">
          <AlertCircle size={40} className="text-gray-300" />
          <p className="text-gray-500 font-medium">Không có chuyến đi nào trong mục này.</p>
          {activeTab !== "COMPLETED" && (
            <p className="text-sm text-gray-400">
              Chuyến đã hoàn thành? Chọn tab{" "}
              <button
                onClick={() => setActiveTab("COMPLETED")}
                className="text-blue-500 underline hover:text-blue-700 font-medium"
              >
                ✅ Đã hoàn thành
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <TripCard
              key={b.id}
              booking={b}
              driverProfileId={driverProfileId}
              onRefresh={fetchBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
