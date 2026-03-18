import { useState, useEffect } from "react";
import {
  Car, Battery, MapPin, Calendar, Clock, User, ChevronRight,
  X, Loader2, CheckCircle, AlertTriangle, Zap,
  RefreshCw, Search,
} from "lucide-react";
import { getAllVehiclesApi } from "../api/vehicleApi";
import { createBookingApi } from "../api/bookingApi";
import { useNotification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  AVAILABLE:   "bg-green-100 text-green-700",
  IN_USE:      "bg-blue-100  text-blue-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
  CHARGING:    "bg-purple-100 text-purple-700",
};
const STATUS_LABEL = {
  AVAILABLE:   "Có sẵn",
  IN_USE:      "Đang cho thuê",
  MAINTENANCE: "Bảo trì",
  CHARGING:    "Đang sạc",
};

// Gradient color pairs for card backgrounds (cycling)
const CARD_GRADIENTS = [
  "from-green-50  to-emerald-100",
  "from-blue-50   to-sky-100",
  "from-purple-50 to-violet-100",
  "from-orange-50 to-amber-100",
  "from-pink-50   to-rose-100",
  "from-teal-50   to-cyan-100",
];

// ─── Vehicle Card ────────────────────────────────────────────────────────────
function VehicleCard({ vehicle, index, onBook }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const isAvailable = vehicle.status === "AVAILABLE";

  const modelName = vehicle.model?.name || `Xe #${vehicle.id}`;
  const brand = vehicle.model?.brand || "";
  const imageUrl = vehicle.model?.imageUrl;
  const batteryLevel = vehicle.currentState?.batteryLevel;
  const hubName = vehicle.fleetHubName;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 
        ${isAvailable ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : "opacity-70"} group`}
    >
      {/* Card header — real image or gradient placeholder */}
      <div className={`bg-gradient-to-br ${gradient} h-44 flex items-center justify-center relative overflow-hidden`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${brand} ${modelName}`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Car
            size={72}
            className={`transition-transform duration-300 ${isAvailable ? "text-gray-600 group-hover:scale-110" : "text-gray-400"}`}
          />
        )}
        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[vehicle.status] || "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABEL[vehicle.status] || vehicle.status}
        </span>
        {/* Color dot */}
        {vehicle.color && (
          <span
            title={vehicle.color}
            className="absolute bottom-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow"
            style={{ backgroundColor: vehicle.color.toLowerCase() }}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight">
          {brand ? `${brand} ` : ""}{modelName}
        </h3>
        <p className="text-gray-400 text-sm mt-0.5 font-mono">{vehicle.plateNumber || "—"}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 flex-wrap">
          {batteryLevel != null && (
            <div className="flex items-center gap-1">
              <Battery size={13} className={batteryLevel >= 50 ? "text-green-500" : "text-orange-400"} />
              <span>{batteryLevel}%</span>
            </div>
          )}
          {hubName && (
            <div className="flex items-center gap-1">
              <MapPin size={13} className="text-gray-400" />
              <span className="truncate max-w-[100px]">{hubName}</span>
            </div>
          )}
          {vehicle.odometerKm != null && (
            <div className="flex items-center gap-1">
              <Zap size={13} className="text-gray-400" />
              <span>{Math.round(vehicle.odometerKm).toLocaleString("vi-VN")} km</span>
            </div>
          )}
        </div>

        {/* Price hint */}
        <p className="text-xs text-gray-400 mt-3 italic">Giá thuê thỏa thuận</p>

        {/* CTA */}
        <button
          onClick={() => isAvailable && onBook(vehicle)}
          disabled={!isAvailable}
          className={`mt-4 w-full font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm
            ${isAvailable
              ? "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isAvailable ? (
            <>Đặt xe ngay <ChevronRight size={15} /></>
          ) : (
            "Không khả dụng"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ vehicle, onClose, onSuccess, openLogin }) {
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    isWithDriver: false,
    deliveryMode: "SELF_PICKUP",
    deliveryAddress: "",
    startTime: "",
    endTime: "",
    unitPrice: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime) {
      notifyError("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      notifyError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }
    if (!form.unitPrice || isNaN(Number(form.unitPrice)) || Number(form.unitPrice) <= 0) {
      notifyError("Vui lòng nhập giá thuê hợp lệ.");
      return;
    }
    if (form.isWithDriver && form.deliveryMode === "DELIVERY" && !form.deliveryAddress.trim()) {
      notifyError("Vui lòng nhập địa chỉ tài xế đến đón.");
      return;
    }

    setSubmitting(true);
    try {
      await createBookingApi({
        userId,
        deliveryMode: form.deliveryMode,
        deliveryAddress: (form.isWithDriver && form.deliveryMode === "DELIVERY") ? form.deliveryAddress.trim() : null,
        rentalUnits: [
          {
            vehicleId: vehicle.id,
            isWithDriver: form.isWithDriver,
            startTime: form.startTime,
            endTime: form.endTime,
            unitPrice: Number(form.unitPrice),
          },
        ],
      });
      notifySuccess("🎉 Đặt xe thành công! Đơn đang chờ Staff xác nhận.");
      onSuccess();
    } catch (err) {
      notifyError(err.response?.data?.message || "Đặt xe thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Đặt xe</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {vehicle.model?.brand ? `${vehicle.model.brand} ` : ""}{vehicle.model?.name || `Xe #${vehicle.id}`} — {vehicle.plateNumber}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Check login */}
        {!userId ? (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <AlertTriangle size={40} className="text-yellow-400" />
            <p className="text-gray-700 font-medium">Bạn cần đăng nhập để đặt xe</p>
            <button
              onClick={() => { onClose(); openLogin(); }}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Vehicle preview */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 flex items-center gap-4 border border-green-100">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                {vehicle.model?.imageUrl
                  ? <img src={vehicle.model.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <Car size={28} className="text-green-600" />
                }
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {vehicle.model?.brand ? `${vehicle.model.brand} ` : ""}{vehicle.model?.name || `Xe #${vehicle.id}`}
                </p>
                <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
                {vehicle.currentState?.batteryLevel != null && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                    <Battery size={11} /> Pin: {vehicle.currentState.batteryLevel}%
                  </p>
                )}
              </div>
              <span className="ml-auto px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Có sẵn
              </span>
            </div>

            {/* Service type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Loại dịch vụ *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isWithDriver: false, deliveryMode: "SELF_PICKUP", deliveryAddress: "" }))}
                  className={`p-4 rounded-xl border-2 text-center transition ${!form.isWithDriver
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <Car className="w-6 h-6 mx-auto mb-1.5 text-current" />
                  <p className={`font-semibold text-sm ${!form.isWithDriver ? "text-green-700" : "text-gray-600"}`}>Tự lái</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tự đến bãi nhận xe</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isWithDriver: true, deliveryMode: "SELF_PICKUP" }))}
                  className={`p-4 rounded-xl border-2 text-center transition ${form.isWithDriver
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <User className="w-6 h-6 mx-auto mb-1.5 text-current" />
                  <p className={`font-semibold text-sm ${form.isWithDriver ? "text-green-700" : "text-gray-600"}`}>Có tài xế</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tài xế đưa đón bạn</p>
                </button>
              </div>
              {form.isWithDriver && (
                <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <CheckCircle size={13} /> Staff sẽ phân công tài xế và xác nhận đơn của bạn.
                </p>
              )}
            </div>

            {/* Phương thức nhận xe — chỉ hiện khi có tài xế */}
            {form.isWithDriver ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phương thức nhận xe *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => set("deliveryMode", "SELF_PICKUP")}
                    className={`p-3.5 rounded-xl border-2 text-center transition ${form.deliveryMode === "SELF_PICKUP"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <p className="text-xl mb-1">🏢</p>
                    <p className={`font-medium text-sm ${form.deliveryMode === "SELF_PICKUP" ? "text-green-700" : "text-gray-600"}`}>Tại bãi</p>
                    <p className="text-xs text-gray-400">Tài xế đón tại bãi xe</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => set("deliveryMode", "DELIVERY")}
                    className={`p-3.5 rounded-xl border-2 text-center transition ${form.deliveryMode === "DELIVERY"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <p className="text-xl mb-1">🚚</p>
                    <p className={`font-medium text-sm ${form.deliveryMode === "DELIVERY" ? "text-green-700" : "text-gray-600"}`}>Giao tận nơi</p>
                    <p className="text-xs text-gray-400">Tài xế đến đón tại địa chỉ bạn</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="font-semibold text-orange-700 text-sm">Tự đến bãi nhận xe</p>
                  <p className="text-xs text-orange-500 mt-0.5">Xe tự lái: khách đến trực tiếp bãi xe để nhận xe</p>
                </div>
              </div>
            )}

            {/* Địa chỉ — chỉ khi có tài xế + chọn DELIVERY */}
            {form.isWithDriver && form.deliveryMode === "DELIVERY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={14} /> Địa chỉ tài xế đến đón *
                </label>
                <input
                  type="text"
                  value={form.deliveryAddress}
                  onChange={(e) => set("deliveryAddress", e.target.value)}
                  placeholder="VD: 123 Nguyễn Văn Linh, Quận 7, TP.HCM"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            )}

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} /> Bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} /> Kết thúc *
                </label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            {/* Unit price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Giá thuê (VNĐ) *
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={form.unitPrice}
                onChange={(e) => set("unitPrice", e.target.value)}
                placeholder="VD: 500000"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <p className="text-xs text-gray-400 mt-1">Giá thỏa thuận theo thời gian thuê</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                : <><Car size={18} /> Xác nhận đặt xe</>
              }
            </button>

            <p className="text-center text-xs text-gray-400">
              Đặt xe xong, bạn có thể xem trạng thái tại{" "}
              <button
                type="button"
                onClick={() => navigate("/user/booking")}
                className="text-green-600 underline"
              >
                Lịch sử đặt xe
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Success Banner ──────────────────────────────────────────────────────────
function SuccessBanner({ onViewHistory, onDismiss }) {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-green-200 p-5 flex items-start gap-4 max-w-sm animate-bounce-once">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
        <CheckCircle size={22} className="text-green-600" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800 text-sm">Đặt xe thành công! 🎉</p>
        <p className="text-xs text-gray-500 mt-0.5">Đơn đang chờ Staff xác nhận.</p>
        <button
          onClick={() => navigate("/user/booking")}
          className="mt-2 text-xs text-green-600 underline font-medium"
        >
          Xem lịch sử đặt xe →
        </button>
      </div>
      <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 transition">
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function VehicleSection({ openLogin }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchVehicles = () => {
    setLoading(true);
    setError(null);
    getAllVehiclesApi({ size: 50 })
      .then((r) => {
        const all = r.data?.data?.content || r.data?.data || [];
        setVehicles(all.filter((v) => v.status === "AVAILABLE"));
      })
      .catch(() => setError("Không thể tải danh sách xe. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleBook = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const filtered = vehicles.filter((v) => {
    const term = search.toLowerCase();
    return (
      !term ||
      (v.model?.name && v.model.name.toLowerCase().includes(term)) ||
      (v.model?.brand && v.model.brand.toLowerCase().includes(term)) ||
      (v.plateNumber && v.plateNumber.toLowerCase().includes(term)) ||
      (v.fleetHubName && v.fleetHubName.toLowerCase().includes(term))
    );
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">Đặt xe ngay</p>
            <h2 className="text-4xl font-bold text-gray-900">Xe có sẵn</h2>
            <p className="text-gray-500 mt-2 text-lg">
              {loading ? "Đang tải..." : `${vehicles.length} xe đang sẵn sàng để đặt`}
            </p>
          </div>

          {/* Search + refresh */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, biển số..."
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 w-56"
              />
            </div>
            <button
              onClick={fetchVehicles}
              className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition"
              title="Làm mới"
            >
              <RefreshCw size={16} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <Loader2 size={40} className="animate-spin text-green-500" />
            <p className="text-gray-500">Đang tải danh sách xe...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <AlertTriangle size={40} className="text-red-400" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchVehicles}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <Car size={56} className="text-gray-300" />
            <p className="text-gray-500 font-medium text-lg">
              {search ? `Không tìm thấy xe phù hợp với "${search}"` : "Hiện không có xe nào khả dụng"}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="text-green-600 underline text-sm">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} index={i} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {selectedVehicle && (
        <BookingModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onSuccess={() => {
            setSelectedVehicle(null);
            setBookingSuccess(true);
            setTimeout(() => setBookingSuccess(false), 8000);
          }}
          openLogin={openLogin}
        />
      )}

      {/* Success toast */}
      {bookingSuccess && (
        <SuccessBanner onDismiss={() => setBookingSuccess(false)} />
      )}
    </section>
  );
}
