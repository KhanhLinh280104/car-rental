import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Car, User as UserIcon, Calendar, Clock,
  CheckCircle, XCircle, UserCheck, ChevronLeft, ChevronRight,
  Loader2, AlertTriangle, RefreshCw,
} from "lucide-react";
import {
  getAllBookingsApi,
  confirmBookingApi,
  cancelBookingApi,
  assignDriverApi,
  getAvailableDriversApi,
} from "../../api/bookingApi";

// ─── Mapping trạng thái backend → nhãn + màu ──────────────────────────────
const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100   text-blue-700   border-blue-200" },
  IN_PROGRESS: { label: "Đang diễn ra", color: "bg-green-100  text-green-700  border-green-200" },
  COMPLETED: { label: "Hoàn tất", color: "bg-gray-100   text-gray-700   border-gray-200" },
  CANCELLED: { label: "Đã huỷ", color: "bg-red-100    text-red-700    border-red-200" },
};

// Helper format tiền
const fmtMoney = (n) =>
  n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—";

// Helper format ngày giờ
const fmtDate = (s) =>
  s ? new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

// ─── Modal Gán Tài Xế ─────────────────────────────────────────────────────
function AssignDriverModal({ bookingId, units, onClose, onSuccess }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selections, setSelections] = useState({}); // { rentalUnitId: driverId }

  // Lấy các rental unit cần tài xế
  const unitsNeedDriver = units.filter((u) => u.isWithDriver && !u.driverId);

  useEffect(() => {
    getAvailableDriversApi()
      .then((res) => setDrivers(res.data?.data || []))
      .catch(() => setError("Không thể tải danh sách tài xế"))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async () => {
    const entries = Object.entries(selections);
    if (entries.length === 0) {
      setError("Vui lòng chọn tài xế cho ít nhất 1 xe.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      for (const [rentalUnitId, driverId] of entries) {
        if (!driverId) continue;
        await assignDriverApi(bookingId, Number(rentalUnitId), Number(driverId));
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Gán tài xế thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Gán tài xế cho Booking #{bookingId}</h2>
          <p className="text-sm text-gray-500 mt-1">Chọn tài xế cho từng xe yêu cầu tài xế</p>
        </div>

        <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : unitsNeedDriver.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Không có xe nào cần gán tài xế.</p>
          ) : (
            unitsNeedDriver.map((unit) => (
              <div key={unit.id} className="border border-gray-200 rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-3">
                  🚗 Xe #{unit.vehicleId}
                  <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Cần tài xế
                  </span>
                </p>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={selections[unit.id] || ""}
                  onChange={(e) =>
                    setSelections((prev) => ({ ...prev, [unit.id]: e.target.value }))
                  }
                >
                  <option value="">-- Chọn tài xế --</option>
                  {drivers.map((d) => (
                    <option key={d.id ?? d.userId} value={d.id}>
                      {d.fullName || `Driver #${d.id}`}
                      {d.averageRating ? ` ⭐ ${Number(d.averageRating).toFixed(1)}` : ""}
                      {" — "}{d.licenseNumber || "?"}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium">
            Huỷ
          </button>
          <button
            onClick={handleAssign}
            disabled={saving || loading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Xác nhận gán
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Xác Nhận Huỷ ───────────────────────────────────────────────────
function CancelModal({ bookingId, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    setSaving(true);
    setError(null);
    try {
      await cancelBookingApi(bookingId, reason);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Huỷ booking thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Huỷ Booking #{bookingId}</h2>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do huỷ (tuỳ chọn)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Nhập lý do huỷ..."
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium">
            Đóng
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Xác nhận huỷ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Card ──────────────────────────────────────────────────────────
function BookingCard({ booking, onRefresh, navigate }) {
  const [confirming, setConfirming] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const units = booking.rentalUnits || [];
  const hasUnassigned = units.some((u) => u.isWithDriver && !u.driverId);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmBookingApi(booking.id);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Xác nhận thất bại.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Booking</span>
            <h3 className="text-lg font-bold text-gray-800">
              #{booking.id}
              {booking.bookingCode && (
                <span className="ml-2 text-sm font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {booking.bookingCode}
                </span>
              )}
            </h3>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-0.5 flex items-center gap-1"><UserIcon size={13} /> Khách hàng</p>
              <p className="font-medium text-gray-800">{booking.customerName || booking.userId || "—"}</p>
              {booking.customerName && booking.customerEmail && (
                <p className="text-xs text-gray-400 truncate">{booking.customerEmail}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Giao nhận</p>
              <p className="font-medium text-gray-800">{booking.deliveryMode === "DELIVERY" ? "🚚 Giao tận nơi" : "🏢 Khách tự đến bãi"}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5 flex items-center gap-1"><Calendar size={13} /> Tạo lúc</p>
              <p className="font-medium text-gray-800">{fmtDate(booking.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Tổng tiền</p>
              <p className="font-semibold text-green-600">{fmtMoney(booking.totalAmount)}</p>
            </div>
          </div>

          {/* Rental Units */}
          {units.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Xe trong booking</p>
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-3 text-sm">
                    <Car size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-700">Xe #{unit.vehicleId}</span>
                    {unit.isWithDriver ? (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
                        Có tài xế{unit.driverId ? ` #${unit.driverId}` : " — Chưa gán"}
                      </span>
                    ) : (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">Tự lái</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fmtDate(unit.startTime)} → {fmtDate(unit.endTime)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delivery address */}
          {booking.deliveryMode === "DELIVERY" && booking.deliveryAddress && (
            <p className="text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
              📍 {booking.deliveryAddress}
            </p>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
          {/* Huỷ */}
          {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
            <button
              onClick={() => setCancelModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition font-medium"
            >
              <XCircle size={15} /> Huỷ
            </button>
          )}

          {/* Gán tài xế */}
          {booking.status === "PENDING" && hasUnassigned && (
            <button
              onClick={() => setAssignModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition font-medium"
            >
              <UserCheck size={15} /> Gán tài xế
            </button>
          )}

          {/* Xác nhận */}
          {booking.status === "PENDING" && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium disabled:opacity-60"
            >
              {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={15} />}
              Xác nhận
            </button>
          )}

          {/* Check-in (bàn giao xe) — CHỈ hiện khi có xe tự lái */}
          {booking.status === "CONFIRMED" && units.some((u) => !u.isWithDriver) && (
            <button
              onClick={() => navigate(`/staff/handover/${booking.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
            >
              <Clock size={15} /> Bàn giao xe
            </button>
          )}

          {/* Khi booking toàn tài xế — staff không cần bàn giao */}
          {booking.status === "CONFIRMED" && units.length > 0 && units.every((u) => u.isWithDriver) && (
            <span className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-50 text-blue-600 border border-blue-200 font-medium">
              🚗 Tài xế sẽ đón khách
            </span>
          )}

          {/* Check-out (nhận xe lại) — CHỈ hiện khi có xe tự lái */}
          {booking.status === "IN_PROGRESS" && units.some((u) => !u.isWithDriver) && (
            <button
              onClick={() => navigate(`/staff/receive-car/${booking.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition font-medium"
            >
              <Car size={15} /> Nhận xe lại
            </button>
          )}

          {/* Khi booking toàn tài xế đang IN_PROGRESS */}
          {booking.status === "IN_PROGRESS" && units.length > 0 && units.every((u) => u.isWithDriver) && (
            <span className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-green-50 text-green-600 border border-green-200 font-medium">
              🟢 Tài xế đang thực hiện chuyến
            </span>
          )}
        </div>
      </div>

      {assignModal && (
        <AssignDriverModal
          bookingId={booking.id}
          units={units}
          onClose={() => setAssignModal(false)}
          onSuccess={onRefresh}
        />
      )}
      {cancelModal && (
        <CancelModal
          bookingId={booking.id}
          onClose={() => setCancelModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "IN_PROGRESS", label: "Đang diễn ra" },
  { key: "COMPLETED", label: "Hoàn tất" },
  { key: "CANCELLED", label: "Đã huỷ" },
];

export default function Booking() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = statusTab === "all" ? null : statusTab;
      const res = await getAllBookingsApi(status, page, PAGE_SIZE);
      const data = res.data?.data;
      setBookings(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch (e) {
      setError("Không thể tải danh sách booking. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [statusTab, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset về trang 0 khi đổi tab
  const handleTabChange = (key) => {
    setStatusTab(key);
    setPage(0);
  };

  // Tìm kiếm client-side trên kết quả hiện tại
  const filtered = bookings.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(b.id).includes(q) ||
      (b.bookingCode?.toLowerCase().includes(q)) ||
      (b.userId?.toLowerCase().includes(q)) ||
      (b.customerName?.toLowerCase().includes(q)) ||
      (b.customerEmail?.toLowerCase().includes(q)) ||
      (b.deliveryAddress?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đơn đặt xe</h1>
          <p className="text-gray-500 mt-1">Quản lý và xử lý các đơn thuê xe của khách hàng.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${statusTab === t.key
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
        <input
          placeholder="Tìm theo ID, mã booking, tên khách hàng..."
          className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-blue-500" size={36} />
          <p className="text-gray-500 text-sm">Đang tải danh sách booking...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle size={40} className="text-red-400" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Car size={48} className="text-gray-300" />
          <p className="text-gray-500">Không có đơn nào phù hợp.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onRefresh={fetchBookings}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
