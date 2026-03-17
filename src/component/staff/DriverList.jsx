import React, { useState, useEffect } from "react";
import { User, Phone, CreditCard, Clock, Search, Loader2, AlertCircle } from "lucide-react";
import { getAllDriversApi } from "../../api/driverApi";


const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAllDriversApi();

        // Tuỳ cấu trúc response: res.data, res.data.data, res.data.content...
        const driverList = res.data?.data ?? res.data?.content ?? res.data ?? [];
        setDrivers(driverList);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải danh sách tài xế");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Map field API → UI (điều chỉnh tên field theo response thật)
  const mapDriver = (d) => ({
    id: d.id,
    name: d.fullName ?? d.name ?? "—",
    driverCode: d.driverCode ?? d.code ?? "—",
    license: d.licenseNumber ?? d.license ?? "—",
    phone: d.phoneNumber ?? d.phone ?? "—",
    shift: d.currentShift ?? d.shift ?? "—",
    totalTrips: d.totalTrips ?? d.tripCount ?? 0,
    status: d.status ?? "—",
  });

  const filteredDrivers = drivers
    .map(mapDriver)
    .filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.shift.toLowerCase().includes(search.toLowerCase())
    );

  // ---- UI States ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải danh sách tài xế...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Danh sách tài xế</h1>

      {/* SEARCH BAR */}
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc ca làm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* LIST */}
      {filteredDrivers.map((driver) => (
        <div key={driver.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{driver.name}</h2>
              <p className="text-gray-500">{driver.driverCode}</p>
            </div>
            <span
              className={`px-4 py-1 text-sm rounded-full font-medium ${
                driver.status === "ACTIVE"
                  ? "bg-blue-100 text-blue-600"
                  : driver.status === "INACTIVE"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {driver.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Tài xế</p>
              <p className="font-medium flex items-center gap-2">
                <User size={16} /> {driver.name}
              </p>
              <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                <Phone size={16} /> {driver.phone}
              </p>
              <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                <CreditCard size={16} /> {driver.license}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Thời gian làm việc</p>
              <p className="font-medium flex items-center gap-2">
                <Clock size={16} /> {driver.shift}
              </p>
            </div>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Tổng chuyến đã chạy</p>
              <p className="text-green-600 font-semibold text-lg">
                {driver.totalTrips} chuyến
              </p>
            </div>
            {driver.status === "ACTIVE" && (
              <button className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition">
                Phân công xe
              </button>
            )}
          </div>
        </div>
      ))}

      {filteredDrivers.length === 0 && (
        <p className="text-gray-500 text-center">Không tìm thấy tài xế phù hợp</p>
      )}
    </div>
  );
};

export default DriverList;