import React, { useState, useEffect } from "react";
import {
  Search, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Filter, UserCheck, Car
} from "lucide-react";
import {
  getAllBookingsApi,
  confirmBookingApi,
  cancelBookingApi,
  assignDriverApi,
  staffHandoverStartApi,
  staffHandoverReturnApi,
} from "../../api/bookingApi";


const STATUS_STYLE = {
  PENDING:     "bg-yellow-100 text-yellow-600",
  CONFIRMED:   "bg-blue-100 text-blue-600",
  IN_PROGRESS: "bg-purple-100 text-purple-600",
  COMPLETED:   "bg-green-100 text-green-600",
  CANCELLED:   "bg-red-100 text-red-500",
};

const STATUS_LABEL = {
  PENDING:     "Chờ xác nhận",
  CONFIRMED:   "Đã xác nhận",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED:   "Hoàn thành",
  CANCELLED:   "Đã huỷ",
};

// Modal gán tài xế
import { getAvailableDriversApi } from "../../api/bookingApi";
import { getAvailableVehiclesApi } from "../../api/vehicleApi";

const AssignDriverModal = ({ bookingId, onClose, onSuccess }) => {
  const [drivers, setDrivers]       = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const [driversRes, vehiclesRes] = await Promise.all([
          getAvailableDriversApi(),
          getAvailableVehiclesApi(),
        ]);

        console.log("DRIVERS:", driversRes.data);
        console.log("VEHICLES:", vehiclesRes.data);

        // Điều chỉnh theo response thật
        const driverList  = driversRes.data?.data  ?? driversRes.data?.content  ?? driversRes.data  ?? [];
        const vehicleList = vehiclesRes.data?.data  ?? vehiclesRes.data?.content ?? vehiclesRes.data ?? [];

        setDrivers(Array.isArray(driverList)  ? driverList  : []);
        setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
      } catch (err) {
        console.error("Lỗi fetch:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedDriver) return alert("Vui lòng chọn tài xế");
    try {
      setLoading(true);
      await assignDriverApi(bookingId, selectedDriver);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || "Gán tài xế thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Gán tài xế & xe</h3>

        {fetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : (
          <div className="space-y-4">

            {/* CHỌN TÀI XẾ */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Tài xế *</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn tài xế --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName ?? d.name ?? d.id} — {d.phoneNumber ?? d.phone ?? ""}
                  </option>
                ))}
              </select>
              {drivers.length === 0 && (
                <p className="text-xs text-red-400 mt-1">Không có tài xế trống lịch</p>
              )}
            </div>

            {/* CHỌN XE */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Xe (tuỳ chọn)</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn xe --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber ?? v.plate ?? v.id} — {v.color ?? ""} {v.manufactureYear ?? ""}
                  </option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <p className="text-xs text-red-400 mt-1">Không có xe khả dụng</p>
              )}
            </div>

          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl hover:bg-gray-50 transition text-sm"
          >
            Huỷ
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || fetching || !selectedDriver}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm disabled:opacity-50"
          >
            {loading ? "Đang gán..." : "Xác nhận gán"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Booking = () => {
  const [bookings, setBookings]         = useState([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [assignModal, setAssignModal]   = useState(null); // bookingId đang gán

  const fetchBookings = async (currentPage = 0, status = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllBookingsApi({
        page:   currentPage,
        size:   10,
        status: status || undefined,
      });

      console.log("BOOKING RESPONSE:", res.data);

      const data  = res.data?.data ?? res.data;
      const list  = data?.content ?? (Array.isArray(data) ? data : []);
      const total = data?.totalPages ?? 1;

      setBookings(list);
      setTotalPages(total);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải danh sách đơn đặt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page, statusFilter);
  }, [page, statusFilter]);

  const handleAction = async (apiFn, successMsg) => {
    try {
      await apiFn();
      fetchBookings(page, statusFilter);
    } catch (err) {
      alert(err?.response?.data?.message || successMsg);
    }
  };

  const mapBooking = (b) => ({
    id:           b.id,
    bookingCode:  b.bookingCode         ?? b.code                  ?? "—",
    customerName: b.customerName        ?? b.customer?.fullName     ?? "—",
    phone:        b.phone               ?? b.customer?.phone        ?? "—",
    vehiclePlate: b.vehiclePlate        ?? b.vehicle?.plateNumber   ?? "—",
    startDate:    b.startDate           ?? b.pickupTime             ?? "—",
    endDate:      b.endDate             ?? b.returnTime             ?? "—",
    totalPrice:   b.totalPrice          ?? b.totalAmount            ?? 0,
    status:       b.status              ?? "—",
    driverId:     b.driverId            ?? b.driver?.id             ?? null,
  });

  const filteredBookings = bookings
    .map(mapBooking)
    .filter((b) =>
      b.bookingCode.toLowerCase().includes(search.toLowerCase())   ||
      b.customerName.toLowerCase().includes(search.toLowerCase())  ||
      b.vehiclePlate.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải danh sách đơn đặt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button
          onClick={() => fetchBookings(page, statusFilter)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Đơn đặt xe</h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã, khách hàng, biển số..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã huỷ</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      {filteredBookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{booking.bookingCode}</h2>
              <p className="text-gray-500 text-sm">{booking.customerName} · {booking.phone}</p>
            </div>
            <span className={`px-4 py-1 text-sm rounded-full font-medium ${STATUS_STYLE[booking.status] ?? "bg-gray-100 text-gray-500"}`}>
              {STATUS_LABEL[booking.status] ?? booking.status}
            </span>
          </div>

          {/* INFO */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-xs">Biển số xe</p>
              <p className="font-medium">{booking.vehiclePlate}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Ngày nhận</p>
              <p className="font-medium">{booking.startDate}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Ngày trả</p>
              <p className="font-medium">{booking.endDate}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Tổng tiền</p>
              <p className="font-semibold text-green-600">
                {Number(booking.totalPrice).toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>

          {/* ACTIONS theo từng status */}
          <hr className="my-4" />
          <div className="flex gap-3 justify-end flex-wrap">

            {/* PENDING → Xác nhận + Huỷ */}
            {booking.status === "PENDING" && (<>
              <button
                onClick={() => handleAction(() => confirmBookingApi(booking.id), "Xác nhận thất bại")}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm"
              >
                ✓ Xác nhận đơn
              </button>
              <button
                onClick={() => handleAction(() => cancelBookingApi(booking.id), "Huỷ thất bại")}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition text-sm"
              >
                ✕ Huỷ đơn
              </button>
            </>)}

            {/* CONFIRMED → Gán tài xế + Bàn giao xe + Huỷ */}
            {booking.status === "CONFIRMED" && (<>
              <button
                onClick={() => setAssignModal(booking.id)}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition text-sm flex items-center gap-1"
              >
                <UserCheck size={15} /> Gán tài xế
              </button>
              {booking.driverId && (
                <button
                  onClick={() => handleAction(() => staffHandoverStartApi(booking.id), "Bàn giao thất bại")}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm flex items-center gap-1"
                >
                  <Car size={15} /> Bàn giao xe
                </button>
              )}
              <button
                onClick={() => handleAction(() => cancelBookingApi(booking.id), "Huỷ thất bại")}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition text-sm"
              >
                ✕ Huỷ đơn
              </button>
            </>)}

            {/* IN_PROGRESS → Nhận xe lại */}
            {booking.status === "IN_PROGRESS" && (
              <button
                onClick={() => handleAction(() => staffHandoverReturnApi(booking.id), "Nhận xe thất bại")}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm flex items-center gap-1"
              >
                <Car size={15} /> Nhận xe lại
              </button>
            )}

          </div>
        </div>
      ))}

      {filteredBookings.length === 0 && (
        <p className="text-gray-500 text-center">Không tìm thấy đơn đặt phù hợp</p>
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

      {/* MODAL GÁN TÀI XẾ */}
      {assignModal && (
        <AssignDriverModal
          bookingId={assignModal}
          onClose={() => setAssignModal(null)}
          onSuccess={() => fetchBookings(page, statusFilter)}
        />
      )}
    </div>
  );
};

export default Booking;