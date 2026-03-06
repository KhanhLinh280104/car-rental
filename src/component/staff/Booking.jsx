import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Car,
  User as UserIcon,
  Calendar,
  Clock,
} from "lucide-react";

export default function Booking() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Mock data — sau này thay bằng API
    setBookings([
      {
        id: "1",
        vehicle: { name: "Toyota Camry", plate: "ABC-123" },
        customer: { name: "Nguyễn Văn A", phone: "0912345678" },
        driver: null,
        start: "2024-02-01",
        end: "2024-02-05",
        total: 3500000,
        status: "not_used", // Chưa dùng
      },
      {
        id: "2",
        vehicle: { name: "Honda Civic", plate: "XYZ-789" },
        customer: { name: "Trần Thị B", phone: "0987654321" },
        driver: { name: "Tài xế Minh", phone: "0909999999" },
        start: "2024-01-28",
        end: "2024-02-02",
        total: 2800000,
        status: "in_use", // Đang dùng
      },
      {
        id: "3",
        vehicle: { name: "Kia Morning", plate: "KM-456" },
        customer: { name: "Lê Văn C", phone: "0933111222" },
        driver: null,
        start: "2024-02-03",
        end: "2024-02-06",
        total: 1800000,
        status: "not_used",
      },
      {
        id: "4",
        vehicle: { name: "VinFast VF8", plate: "VF-888" },
        customer: { name: "Phạm Thị D", phone: "0944222333" },
        driver: { name: "Tài xế Hùng", phone: "0911222333" },
        start: "2024-02-04",
        end: "2024-02-08",
        total: 4200000,
        status: "in_use",
      },
    ]);
  }, []);

  const filtered = bookings.filter((b) => {
    const text = `${b.vehicle.name} ${b.vehicle.plate} ${b.customer.name} ${b.driver?.name || ""}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchTab =
      tab === "all" ||
      (tab === "self" && !b.driver) ||
      (tab === "driver" && b.driver);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "not_used" && b.status === "not_used") ||
      (statusFilter === "in_use" && b.status === "in_use");
    return matchSearch && matchTab && matchStatus;
  });

  const statusBadge = {
    not_used: { label: "Chưa dùng", color: "bg-blue-100 text-blue-700" },
    in_use: { label: "Đang dùng", color: "bg-green-100 text-green-700" },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đơn đặt xe</h1>
        <p className="text-gray-500 mt-1">Quản lý các đơn yêu cầu thuê xe của khách hàng.</p>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          placeholder="Tìm xe, khách, tài xế, biển số..."
          className="pl-10 pr-4 py-2 border rounded-xl w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LOẠI XE TABS */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "Tất cả" },
          { key: "self", label: "Xe tự lái" },
          { key: "driver", label: "Xe có tài xế" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              tab === t.key ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TRẠNG THÁI FILTER */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Trạng thái:</span>
        {[
          { key: "all", label: "Tất cả" },
          { key: "not_used", label: "Chưa dùng" },
          { key: "in_use", label: "Đang dùng" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              statusFilter === f.key ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Car size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg">Không có đơn nào phù hợp</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const badge = statusBadge[b.status] || statusBadge.not_used;
            return (
              <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold text-gray-800">{b.vehicle.name}</h3>
                      <span className="text-sm text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {b.vehicle.plate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {b.driver ? (
                        <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-medium">
                          Có tài xế
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
                          Tự lái
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-500 flex items-center gap-1"><UserIcon size={14} /> Khách hàng</p>
                    <p className="font-medium">{b.customer.name}</p>
                    <p className="text-gray-400 text-xs">{b.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tài xế</p>
                    <p className="font-medium">{b.driver?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center gap-1"><Calendar size={14} /> Thời gian</p>
                    <p className="font-medium">{b.start} → {b.end}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tổng tiền</p>
                    <p className="text-green-600 font-semibold">{b.total.toLocaleString()} ₫</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
                  {/* Chưa dùng → Check-in → Giao xe */}
                  {b.status === "not_used" && (
                    <button
                      onClick={() => navigate(`/staff/handover/${b.id}`)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <Clock size={16} /> Check-In
                    </button>
                  )}

                  {/* Đang dùng → Check-out → Nhận xe */}
                  {b.status === "in_use" && (
                    <button
                      onClick={() => navigate(`/staff/receive-car/${b.id}`)}
                      className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
                    >
                      <Car size={16} /> Check-Out
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
