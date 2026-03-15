import { useState, useEffect, useCallback } from "react";
import {
  User, Phone, CreditCard, Star, Search, Loader2,
  AlertTriangle, RefreshCw, ShieldCheck, ShieldOff, Shield, Edit
} from "lucide-react";
import { getAllDriversApi, updateDriverStatusApi, createDriverProfileApi, updateDriverProfileApi } from "../../api/bookingApi";

// Mapping trạng thái
const STATUS_CONFIG = {
  ACTIVE: { label: "Đang hoạt động", color: "bg-green-100 text-green-700 border-green-200", icon: ShieldCheck },
  INACTIVE: { label: "Tạm nghỉ", color: "bg-gray-100  text-gray-600  border-gray-200", icon: ShieldOff },
  BLOCKED: { label: "Bị khoá", color: "bg-red-100   text-red-700   border-red-200", icon: Shield },
};

// Hiển thị sao đánh giá
function StarRating({ value }) {
  if (value == null) return <span className="text-gray-400 text-xs">Chưa có</span>;
  const avg = Number(value).toFixed(1);
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
      <Star size={14} fill="currentColor" />
      {avg} / 5
    </span>
  );
}

// Driver Card
function DriverCard({ driver, onRefresh, onEdit }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusCfg = STATUS_CONFIG[driver.status] || STATUS_CONFIG.INACTIVE;
  const StatusIcon = statusCfg.icon;

  const handleToggleStatus = async () => {
    const next = driver.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUpdatingStatus(true);
    try {
      await updateDriverStatusApi(driver.id, next);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow">
            {(driver.fullName || "?")[0]}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">{driver.fullName || `Driver #${driver.id || driver.userId.substring(0, 4)}`}</h2>
            <p className="text-xs text-gray-400">{driver.email || "—"}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${statusCfg.color}`}>
          <StatusIcon size={13} />
          {statusCfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone size={15} className="text-gray-400" />
            <span>{driver.phone || "Chưa cập nhật"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CreditCard size={15} className="text-gray-400" />
            <span>GPLX: <span className="font-medium">{driver.licenseNumber || "Chưa đăng ký"}</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User size={15} className="text-gray-400" />
            <span className="font-mono text-xs text-gray-500 truncate max-w-[200px]" title={driver.userId}>
              ID: {driver.userId}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Vị trí hiện tại</p>
            <p className="text-sm text-gray-700">{driver.currentLocation || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Đánh giá trung bình</p>
            <StarRating value={driver.averageRating} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button
          onClick={() => onEdit(driver)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Edit size={14} /> {driver.id ? "Sửa hồ sơ" : "Tạo hồ sơ"}
        </button>

        {driver.id && (
          <button
            onClick={handleToggleStatus}
            disabled={updatingStatus || driver.status === "BLOCKED"}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 ${driver.status === "ACTIVE"
              ? "border border-orange-200 text-orange-600 hover:bg-orange-50"
              : "border border-green-200 text-green-600 hover:bg-green-50"
              }`}
          >
            {updatingStatus && <Loader2 size={13} className="animate-spin" />}
            {driver.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Modal Cập Nhật / Tạo Mới ──────────────────────────────────────────────
function EditDriverModal({ driver, onClose, onRefresh }) {
  const [licenseNumber, setLicenseNumber] = useState(driver.licenseNumber || "");
  const [currentLocation, setCurrentLocation] = useState(driver.currentLocation || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licenseNumber.trim()) {
      setError("Vui lòng nhập số bằng lái");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (driver.id) {
        // Có id => gọi Update Profile (PUT)
        await updateDriverProfileApi(driver.id, licenseNumber, currentLocation);
      } else {
        // Chưa có id => chưa có profile => gọi Create (POST)
        await createDriverProfileApi(driver.userId, licenseNumber, currentLocation);
      }
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi cập nhật hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scale-up">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">
            {driver.id ? "Cập nhật hồ sơ tài xế" : "Đăng ký hồ sơ tài xế mới"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Tài xế:</p>
            <p className="font-semibold text-gray-800">{driver.fullName || driver.userId}</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số GPLX (Bắt buộc)</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={e => setLicenseNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="VD: B2-123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực hoạt động</label>
            <input
              type="text"
              value={currentLocation}
              onChange={e => setCurrentLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="VD: Quận 1, TP.HCM"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
              disabled={submitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {driver.id ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "ACTIVE", label: "Hoạt động" },
  { key: "INACTIVE", label: "Tạm nghỉ" },
  { key: "BLOCKED", label: "Bị khoá" },
];

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllDriversApi();
      const data = res.data?.data || [];
      setDrivers(data);
    } catch (e) {
      setError("Không thể tải danh sách tài xế. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const filtered = drivers.filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.fullName?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.phone?.includes(q) ||
      d.licenseNumber?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách tài xế</h1>
          <p className="text-gray-500 mt-1">
            Quản lý hồ sơ và trạng thái của tất cả tài xế trong hệ thống.
          </p>
        </div>
        <button
          onClick={fetchDrivers}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT, GPLX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${statusFilter === f.key
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      {!loading && !error && (
        <p className="text-sm text-gray-500">
          Hiển thị <span className="font-medium text-gray-800">{filtered.length}</span> / {drivers.length} tài xế
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-blue-500" size={36} />
          <p className="text-gray-500 text-sm">Đang tải danh sách tài xế...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle size={40} className="text-red-400" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchDrivers}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-gray-200 rounded-2xl">
          <User size={48} className="text-gray-300" />
          <p className="text-gray-500 font-medium">Không tìm thấy tài xế nào khớp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((d) => (
            <DriverCard key={d.userId} driver={d} onRefresh={fetchDrivers} onEdit={setSelectedDriver} />
          ))}
        </div>
      )}

      {selectedDriver && (
        <EditDriverModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onRefresh={fetchDrivers}
        />
      )}
    </div>
  );
}
