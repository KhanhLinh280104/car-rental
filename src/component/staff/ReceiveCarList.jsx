import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Car, User, Calendar, ArrowRight, Clock } from "lucide-react";

// Mock data — sau này thay bằng API
const MOCK_IN_USE = [
  {
    id: "2",
    customer: { name: "Trần Thị B", phone: "0987654321" },
    vehicle: { name: "Honda Civic", plate: "XYZ-789" },
    driver: { name: "Tài xế Minh" },
    start: "2024-01-28",
    end: "2024-02-02",
    total: 2800000,
  },
  {
    id: "4",
    customer: { name: "Phạm Thị D", phone: "0944222333" },
    vehicle: { name: "VinFast VF8", plate: "VF-888" },
    driver: { name: "Tài xế Hùng" },
    start: "2024-02-04",
    end: "2024-02-08",
    total: 4200000,
  },
  {
    id: "5",
    customer: { name: "Hoàng Minh E", phone: "0955333444" },
    vehicle: { name: "Toyota Vios", plate: "TV-321" },
    driver: null,
    start: "2024-02-02",
    end: "2024-02-05",
    total: 2100000,
  },
];

export default function ReceiveCarList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    // Sau này gọi API lấy danh sách xe đang dùng, cần nhận lại
    setBookings(MOCK_IN_USE);
  }, []);

  const filtered = bookings.filter((b) => {
    const text = `${b.vehicle.name} ${b.vehicle.plate} ${b.customer.name} ${b.customer.phone}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchType =
      typeFilter === "all" ||
      (typeFilter === "self" && !b.driver) ||
      (typeFilter === "driver" && b.driver);
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nhận và kiểm tra xe</h1>
        <p className="text-gray-500 mt-1">Danh sách xe đang được sử dụng, chờ khách trả và kiểm tra tình trạng.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          placeholder="Tìm theo tên khách, biển số, xe..."
          className="pl-10 pr-4 py-2 border rounded-xl w-full"
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
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              typeFilter === t.key ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Car size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg">Không có xe nào cần nhận lại</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{b.vehicle.name}</h3>
                    <span className="text-sm text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                      {b.vehicle.plate}
                    </span>
                    {b.driver ? (
                      <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        Có tài xế: {b.driver.name}
                      </span>
                    ) : (
                      <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        Tự lái
                      </span>
                    )}
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                      <Clock size={12} /> Đang dùng
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span>{b.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{b.start} → {b.end}</span>
                    </div>
                    <div>
                      <span className="text-green-600 font-semibold">{b.total.toLocaleString()} ₫</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/staff/receive-car/${b.id}`)}
                  className="ml-4 flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition font-medium shadow-sm"
                >
                  Nhận xe <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
