import React, { useState } from "react";
import { User, Phone, CreditCard, Clock, Search } from "lucide-react";

const drivers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    driverCode: "DRV-123",
    license: "B2 - 0123456789",
    phone: "0912345678",
    shift: "Ca sáng",
    totalTrips: 25,
    status: "Sẵn sàng",
  },
  {
    id: 2,
    name: "Nguyễn Văn B",
    driverCode: "DRV-456",
    license: "C - 9876543210",
    phone: "0987654321",
    shift: "Ca tối",
    totalTrips: 18,
    status: "Đang chạy",
  },
];

const DriverList = () => {
  const [search, setSearch] = useState("");

  // FILTER LOGIC
  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(search.toLowerCase()) ||
    driver.shift.toLowerCase().includes(search.toLowerCase())
  );

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
                driver.status === "Sẵn sàng"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600"
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

            {driver.status === "Sẵn sàng" && (
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
