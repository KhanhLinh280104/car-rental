import { useState, useEffect, useCallback } from "react";
import { Star, TrendingUp, Wallet, Clock, MapPin, Users, Award, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { getDriverByUserIdApi, getDriverBookingsApi } from "../../api/bookingApi";

export default function DriverDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  const userId = localStorage.getItem("userId");

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError("Không tìm thấy thông tin xác thực (userId). Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Lấy thông tin tài xế
      const profileRes = await getDriverByUserIdApi(userId);
      const driverProfile = profileRes.data?.data;
      if (!driverProfile || !driverProfile.id) {
        throw new Error("Chưa có hồ sơ tài xế.");
      }
      const profileId = driverProfile.id;

      // 2. Lấy tất cả booking được phân công cho tài xế này qua API chuyên biệt
      const bookingsRes = await getDriverBookingsApi(profileId, null, 0, 200);
      const mine = bookingsRes.data?.data?.content || [];

      // 4. Tính toán thống kê
      let totalTrips = mine.length;
      let completedTrips = 0;
      let ongoingTrips = 0;
      let cancelledTrips = 0;
      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      const currentMonth = new Date().getMonth() + 1;

      const formattedRecentTrips = [];

      mine.forEach(booking => {
        if (booking.status === "COMPLETED") completedTrips++;
        else if (booking.status === "IN_PROGRESS") ongoingTrips++;
        else if (booking.status === "CANCELLED") cancelledTrips++;

        // Gia su tien = tong tien booking (thực tế có thể phải chia ra)
        if (booking.status === "COMPLETED") {
          totalEarnings += booking.totalAmount || 0;
          const bookingDate = new Date(booking.createdAt);
          if (bookingDate.getMonth() + 1 === currentMonth) {
            thisMonthEarnings += booking.totalAmount || 0;
          }

          formattedRecentTrips.push({
            id: booking.id,
            bookingCode: booking.bookingCode,
            date: bookingDate.toLocaleDateString("vi-VN"),
            from: "CRS Hub",
            to: booking.deliveryAddress || "Trả tại bãi",
            earnings: booking.totalAmount || 0,
            rating: 5, // Tạm thời hardcode 5 vì chưa có model review trong booking
            passenger: booking.userId,
            time: bookingDate.getTime() // Để sort
          });
        }
      });

      // Sort recent trips by newest first
      formattedRecentTrips.sort((a, b) => b.time - a.time);

      setDashboardData({
        driverName: driverProfile.fullName || driverProfile.userId || "Tài xế",
        rating: driverProfile.averageRating || 5.0,
        totalRating: driverProfile.totalFeedback || 0,
        totalTrips,
        totalEarnings,
        thisMonthEarnings,
        totalExpenses: totalEarnings * 0.2, // Giả sử chi phí xăng xe = 20% doanh thu
        thisMonthExpenses: thisMonthEarnings * 0.2,
        ongoingTrips,
        completedTrips,
        cancelledTrips,
        averageRating: driverProfile.averageRating || 5.0,
        acceptanceRate: totalTrips > 0 ? Math.round(((totalTrips - cancelledTrips) / totalTrips) * 100) : 100,
        cancellationRate: totalTrips > 0 ? Math.round((cancelledTrips / totalTrips) * 100) : 0,
      });

      setRecentTrips(formattedRecentTrips.slice(0, 5));

    } catch (e) {
      console.error(e);
      setError(e.message === "Chưa có hồ sơ tài xế." ?
        "Tài khoản của bạn chưa được cấp hồ sơ lái xe. Vui lòng liên hệ Admin/Staff."
        : "Không thể tải dữ liệu Dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4 text-red-700">
          <AlertTriangle size={24} />
          <div>
            <h2 className="font-bold text-lg">Lỗi tải dữ liệu</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* === HEADER === */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Xin chào, {dashboardData.driverName}! 👋
        </h1>
        <p className="text-gray-600">Đây là dashboard cá nhân của bạn</p>
      </div>

      {/* === RATING & STATS CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Rating Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Đánh giá của bạn</h3>
            <Star className="text-yellow-500" size={24} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-800">{Number(dashboardData.rating).toFixed(1)}</span>
            <span className="text-gray-600">/5.0</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Từ {dashboardData.totalRating} chuyến
          </p>
        </div>

        {/* Total Trips */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Tổng chuyến đi</h3>
            <MapPin className="text-blue-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {dashboardData.totalTrips}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {dashboardData.completedTrips} hoàn thành
          </p>
        </div>

        {/* Monthly Earnings */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Thu tháng này</h3>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {(dashboardData.thisMonthEarnings / 1000000).toFixed(1)}M
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Tổng: {(dashboardData.totalEarnings / 1000000).toFixed(1)}M
          </p>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Tỉ lệ hoàn thành</h3>
            <Award className="text-purple-500" size={24} />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {dashboardData.acceptanceRate}%
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Hủy: {dashboardData.cancellationRate}%
          </p>
        </div>
      </div>

      {/* === FINANCIAL OVERVIEW === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Income Overview */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Wallet className="text-green-500" size={24} />
            <span>Tổng quan doanh thu hệ thống</span>
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div>
                <p className="text-sm text-gray-600">Doanh thu chuyến đã chạy</p>
                <p className="text-2xl font-bold text-green-600">
                  {(dashboardData.totalEarnings / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <p className="text-sm text-gray-600">Tháng hiện tại</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(dashboardData.thisMonthEarnings / 1000000).toFixed(1)}M
                </p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Trung bình mỗi chuyến hoàn thành</p>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData.completedTrips > 0
                  ? (dashboardData.totalEarnings / dashboardData.completedTrips / 1000).toFixed(0)
                  : 0}K
              </p>
            </div>
          </div>
        </div>

        {/* Expenses Overview (Giả lập) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Wallet className="text-red-500" size={24} />
            <span>Ước lượng vận hành (Tạm tính)</span>
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="text-sm text-gray-600">Tổng chi phí dự tính</p>
                <p className="text-2xl font-bold text-red-600">
                  {(dashboardData.totalExpenses / 1000000).toFixed(1)}M
                </p>
              </div>
              <Wallet className="text-red-500" size={32} />
            </div>

            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div>
                <p className="text-sm text-gray-600">Chi tháng này</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(dashboardData.thisMonthExpenses / 1000000).toFixed(2)}M
                </p>
              </div>
              <Calendar className="text-orange-500" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* === PERFORMANCE METRICS === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Star className="text-yellow-500" /> Hiệu suất của tôi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Item 1 */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-medium">Đánh giá trung bình</p>
              <Star className="text-yellow-500" size={20} />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-gray-800">
                {Number(dashboardData.averageRating).toFixed(1)}
              </span>
              <span className="text-gray-600">/5</span>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.round(dashboardData.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
          </div>

          {/* Performance Item 2 */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-medium">Tỉ lệ hoàn thành</p>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {dashboardData.acceptanceRate}%
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${dashboardData.acceptanceRate}%` }}
              ></div>
            </div>
          </div>

          {/* Performance Item 3 */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-medium">Chuyến đang chạy</p>
              <Clock className="text-purple-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {dashboardData.ongoingTrips}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Booking trạng thái IN_PROGRESS
            </p>
          </div>
        </div>
      </div>

      {/* === RECENT TRIPS === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-blue-500" /> Chuyến đã hoàn thành gần đây
          </h2>
          <a href="/driver/history" className="text-blue-500 hover:text-blue-700 font-medium transition text-sm">
            Xem tất cả lịch sử →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã Booking</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Điểm đến</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tiền cước</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">Chưa có chuyến xe nào hoàn thành.</td>
                </tr>
              )}
              {recentTrips.map((trip) => (
                <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-4 px-4 font-medium text-blue-600">#{trip.id} {trip.bookingCode && <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-1">{trip.bookingCode}</span>}</td>
                  <td className="py-4 px-4 text-gray-700">{trip.date}</td>
                  <td className="py-4 px-4 text-gray-700">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      {trip.to}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-green-600">
                    +{(trip.earnings / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/driver"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow p-5 text-center font-semibold transition flex items-center justify-center gap-2"
        >
          📍 Điểm danh & Nhận chuyến
        </a>
        <a
          href="/driver/history"
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow p-5 text-center font-semibold transition flex items-center justify-center gap-2"
        >
          📋 Lịch sử công việc
        </a>
        <a
          href="/driver/profile"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow p-5 text-center font-semibold transition flex items-center justify-center gap-2"
        >
          👤 Cập nhật hồ sơ
        </a>
      </div>
    </div>
  );
}
