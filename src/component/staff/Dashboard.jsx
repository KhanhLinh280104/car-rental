import React, { useState, useEffect } from "react";
import { ClipboardList, DollarSign, Users, Car, Loader2, AlertCircle } from "lucide-react";
import { getAllBookingsApi } from "../../api/bookingApi";
import { getAllDriversApi } from "../../api/driverApi";
import { getAllVehiclesApi } from "../../api/vehicleApi";

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
    <div className={`${bg} p-4 rounded-xl`}>
      <Icon size={24} className={color} />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [bookingRes, driverRes, vehicleRes] = await Promise.all([
          getAllBookingsApi({ page: 0, size: 1000 }),
          getAllDriversApi(),
          getAllVehiclesApi({ page: 0, size: 1000 }),
        ]);

        // Bookings
        const bookingData     = bookingRes.data?.data ?? bookingRes.data;
        const bookingList     = bookingData?.content ?? (Array.isArray(bookingData) ? bookingData : []);
        const totalBookings   = bookingData?.totalElements ?? bookingList.length;
        const totalRevenue    = bookingList
          .filter((b) => b.status === "COMPLETED")
          .reduce((sum, b) => sum + (b.totalPrice ?? b.totalAmount ?? 0), 0);
        const pendingBookings = bookingList.filter((b) => b.status === "PENDING").length;

        // Drivers
        const driverData  = driverRes.data?.data ?? driverRes.data;
        const driverList  = Array.isArray(driverData) ? driverData : driverData?.content ?? [];
        const totalDrivers = driverList.length;

        // Vehicles
        const vehicleData     = vehicleRes.data?.data ?? vehicleRes.data;
        const vehicleList     = vehicleData?.content ?? (Array.isArray(vehicleData) ? vehicleData : []);
        const availableVehicles = vehicleList.filter((v) => v.status === "AVAILABLE").length;

        setStats({
          totalBookings,
          pendingBookings,
          totalRevenue,
          totalDrivers,
          availableVehicles,
          totalVehicles: vehicleData?.totalElements ?? vehicleList.length,
        });
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardList}
          label="Tổng đơn đặt"
          value={stats.totalBookings}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={DollarSign}
          label="Doanh thu (đơn hoàn thành)"
          value={`${stats.totalRevenue.toLocaleString("vi-VN")}đ`}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={Users}
          label="Tổng tài xế"
          value={stats.totalDrivers}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          icon={Car}
          label="Xe sẵn sàng"
          value={`${stats.availableVehicles} / ${stats.totalVehicles}`}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
      </div>

      {/* PENDING BOOKINGS ALERT */}
      {stats.pendingBookings > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <ClipboardList size={20} className="text-yellow-600" />
          <p className="text-yellow-700 font-medium">
            Có <span className="font-bold">{stats.pendingBookings}</span> đơn đang chờ xác nhận
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;