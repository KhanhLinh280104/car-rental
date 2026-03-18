import React, { useState, useEffect } from "react";
import { Car, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllVehiclesApi } from "../../api/vehicleApi";

const STATUS_STYLE = {
  AVAILABLE:   "bg-blue-100 text-blue-600",
  IN_USE:      "bg-green-100 text-green-600",
  MAINTENANCE: "bg-red-100 text-red-500",
  CHARGING:    "bg-yellow-100 text-yellow-600",
};

const STATUS_LABEL = {
  AVAILABLE:   "Sẵn sàng",
  IN_USE:      "Đang sử dụng",
  MAINTENANCE: "Bảo trì",
  CHARGING:    "Đang sạc",
};

const VehicleList = () => {
  const [vehicles, setVehicles]   = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  
  const fetchVehicles = async (currentPage = 0) => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllVehiclesApi({ page: currentPage, size: 10 });
      console.log("VEHICLE RESPONSE:", res.data);
     const data = res.data.data;

const list  = data?.content ?? [];
const total = data?.totalPages ?? 1;

setVehicles(list);
setTotalPages(total);
console.log("DATA:", data);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(page);
  }, [page]);

  // Map field API → UI
  const mapVehicle = (v) => ({
    id:           v.id,
    plateNumber:  v.plateNumber ?? "—",
    vin:          v.vin ?? "—",
    color:        v.color ?? "—",
    year:         v.manufactureYear ?? "—",
    status:       v.status ?? "—",
    odometerKm:   v.odometerKm ?? 0,
    isVirtual:    v.isVirtual ?? false,
    modelId:      v.modelId ?? "—",
    fleetHubId:   v.fleetHubId ?? "—",
  });

  const filteredVehicles = vehicles
    .map(mapVehicle)
    .filter((v) =>
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vin.toLowerCase().includes(search.toLowerCase()) ||
      v.color.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải danh sách xe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button
          onClick={() => fetchVehicles(page)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Danh sách xe</h1>

      {/* SEARCH BAR */}
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm theo biển số, VIN, màu xe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* LIST */}
      {filteredVehicles.map((vehicle) => (
        <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{vehicle.plateNumber}</h2>
              <p className="text-gray-500 text-sm">VIN: {vehicle.vin}</p>
            </div>
            <span className={`px-4 py-1 text-sm rounded-full font-medium ${STATUS_STYLE[vehicle.status] ?? "bg-gray-100 text-gray-500"}`}>
              {STATUS_LABEL[vehicle.status] ?? vehicle.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-xs">Màu xe</p>
              <p className="font-medium">{vehicle.color}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Năm SX</p>
              <p className="font-medium">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Số km</p>
              <p className="font-medium flex items-center gap-1">
                <Car size={14} /> {vehicle.odometerKm.toLocaleString()} km
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Hub ID</p>
              <p className="font-medium">{vehicle.fleetHubId}</p>
            </div>
          </div>

          {vehicle.isVirtual && (
            <span className="mt-3 inline-block px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
              Xe ảo
            </span>
          )}
        </div>
      ))}

      {filteredVehicles.length === 0 && (
        <p className="text-gray-500 text-center">Không tìm thấy xe phù hợp</p>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleList;