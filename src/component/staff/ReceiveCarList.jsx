import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Car, User, Calendar, ArrowRight, Clock, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { getAllBookingsApi } from "../../api/bookingApi";

const fmtDate = (s) =>
  s ? new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";
const fmtMoney = (n) =>
  n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—";

export default function ReceiveCarList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy booking trạng thái IN_PROGRESS — xe đang dùng, cần nhận lại
      const res = await getAllBookingsApi("IN_PROGRESS", 0, 50);
      const data = res.data?.data;
      setBookings(data?.content || []);
    } catch (e) {
      setError("Không thể tải danh sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    const units = b.rentalUnits || [];
    const unitText = units.map((u) => `xe ${u.vehicleId}`).join(" ");
    const text = `${b.id} ${b.bookingCode || ""} ${b.userId || ""} ${unitText}`.toLowerCase();
    const matchSearch = !search.trim() || text.includes(search.toLowerCase());
    const matchType =
      typeFilter === "all" ||
      (typeFilter === "self" && units.some((u) => !u.isWithDriver)) ||
      (typeFilter === "driver" && units.some((u) => u.isWithDriver));
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhận và kiểm tra xe</h1>
          <p className="text-gray-500 mt-1">Danh sách xe đang được sử dụng, chờ khách trả và kiểm tra.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          placeholder="Tìm theo mã booking, ID..."
          className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "Tất cả" },
          { key: "self", label: "Tự lái" },
          { key: "driver", label: "Có tài xế" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition ${typeFilter === t.key
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-purple-500" size={32} />
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertTriangle size={36} className="text-red-400" />
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchBookings} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">Thử lại</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Car size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg">Không có xe nào cần nhận lại</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const units = b.rentalUnits || [];
            const hasDriver = units.some((u) => u.isWithDriver);
            return (
              <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-800">
                        #{b.id}
                        {b.bookingCode && (
                          <span className="ml-2 text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {b.bookingCode}
                          </span>
                        )}
                      </h3>
                      {hasDriver ? (
                        <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-medium border border-purple-100">Có tài xế</span>
                      ) : (
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium border border-orange-100">Tự lái</span>
                      )}
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200 flex items-center gap-1">
                        <Clock size={11} /> Đang diễn ra
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        <span className="truncate">{b.userId || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{fmtDate(b.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-green-600 font-semibold">{fmtMoney(b.totalAmount)}</span>
                      </div>
                      <div>
                        {b.deliveryMode === "DELIVERY"
                          ? <span className="text-blue-600">🚚 {b.deliveryAddress || "Giao tận nơi"}</span>
                          : <span className="text-gray-500">🏢 Tại bãi</span>
                        }
                      </div>
                    </div>

                    {/* Rental Units */}
                    {units.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {units.map((u) => (
                          <span key={u.id} className="flex items-center gap-1 text-xs bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700">
                            <Car size={12} /> Xe #{u.vehicleId}
                            <span className="text-gray-400 ml-1">{fmtDate(u.startTime)} → {fmtDate(u.endTime)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/staff/receive-car/${b.id}`)}
                    className="ml-4 flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition font-medium shadow-sm whitespace-nowrap"
                  >
                    Nhận xe <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
