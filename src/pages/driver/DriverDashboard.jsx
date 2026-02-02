import { useState } from "react";
import { Star, TrendingUp, Wallet, Clock, MapPin, Users, Award, Calendar } from "lucide-react";

export default function DriverDashboard() {
  const [dashboardData] = useState({
    driverName: "Nguyễn Văn A",
    rating: 4.8,
    totalRating: 156,
    totalTrips: 324,
    totalEarnings: 45200000,
    thisMonthEarnings: 5800000,
    totalExpenses: 8500000,
    thisMonthExpenses: 950000,
    ongoingTrips: 2,
    completedTrips: 322,
    cancelledTrips: 0,
    averageRating: 4.8,
    acceptanceRate: 96,
    cancellationRate: 2,
  });

  const [recentTrips] = useState([
    {
      id: 1,
      date: "02/02/2026",
      from: "Tân Sơn Nhất",
      to: "Quận 1",
      earnings: 450000,
      rating: 5,
      passenger: "Lê Thanh B",
    },
    {
      id: 2,
      date: "01/02/2026",
      from: "Quận 3",
      to: "Bình Thạnh",
      earnings: 320000,
      rating: 4,
      passenger: "Trần Minh C",
    },
    {
      id: 3,
      date: "01/02/2026",
      from: "Quận 5",
      to: "Quận 7",
      earnings: 280000,
      rating: 5,
      passenger: "Phạm Hùng D",
    },
  ]);

  const [monthlyStats] = useState([
    { month: "T1", earnings: 4200000, trips: 85 },
    { month: "T2", earnings: 5800000, trips: 112 },
  ]);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "bg-green-100 text-green-700";
    if (rating >= 4) return "bg-blue-100 text-blue-700";
    if (rating >= 3) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getStatusColor = (status) => {
    if (status === "Hoàn thành") return "bg-green-100 text-green-700";
    if (status === "Đang thực hiện") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

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
            <span className="text-3xl font-bold text-gray-800">{dashboardData.rating}</span>
            <span className="text-gray-600">/5.0</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Từ {dashboardData.totalRating} đánh giá
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
            Tổng: {(dashboardData.totalEarnings / 1000000).toFixed(0)}M
          </p>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Tỉ lệ chấp nhận</h3>
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
            <span>Tổng quan thu nhập</span>
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tổng thu nhập</p>
                <p className="text-2xl font-bold text-green-600">
                  {(dashboardData.totalEarnings / 1000000).toFixed(0)}M
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Thu tháng này</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(dashboardData.thisMonthEarnings / 1000000).toFixed(1)}M
                </p>
              </div>
              <Calendar className="text-blue-500" size={32} />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Trung bình mỗi chuyến</p>
              <p className="text-2xl font-bold text-gray-800">
                {(dashboardData.totalEarnings / dashboardData.totalTrips / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>

        {/* Expenses Overview */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Wallet className="text-red-500" size={24} />
            <span>Chi phí</span>
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold text-red-600">
                  {(dashboardData.totalExpenses / 1000000).toFixed(1)}M
                </p>
              </div>
              <Wallet className="text-red-500" size={32} />
            </div>

            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Chi tháng này</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(dashboardData.thisMonthExpenses / 1000000).toFixed(2)}M
                </p>
              </div>
              <Calendar className="text-orange-500" size={32} />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Lợi nhuận ròng (tháng này)</p>
              <p className="text-2xl font-bold text-green-600">
                {((dashboardData.thisMonthEarnings - dashboardData.thisMonthExpenses) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === PERFORMANCE METRICS === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Hiệu suất của tôi</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Item 1 */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-medium">Đánh giá trung bình</p>
              <Star className="text-yellow-500" size={20} />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-gray-800">
                {dashboardData.averageRating}
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
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-medium">Tỉ lệ chấp nhận</p>
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
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 font-medium">Chuyến đi hôm nay</p>
              <Clock className="text-purple-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {dashboardData.ongoingTrips}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Đang thực hiện
            </p>
          </div>
        </div>
      </div>

      {/* === RECENT TRIPS === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Chuyến đi gần đây</h2>
          <a href="/driver/history" className="text-blue-500 hover:text-blue-700 font-medium">
            Xem tất cả →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Hành trình</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách hàng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Thu nhập</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip) => (
                <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-4 px-4 text-gray-700">{trip.date}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-700 font-medium">{trip.from}</p>
                      <p className="text-gray-500">→ {trip.to}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{trip.passenger}</td>
                  <td className="py-4 px-4 font-semibold text-green-600">
                    +{(trip.earnings / 1000).toFixed(0)}K
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-700 font-medium">{trip.rating}.0</span>
                    </div>
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
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md p-6 text-center font-semibold transition transform hover:scale-105"
        >
          📍 Xem chuyến đi
        </a>
        <a
          href="/driver/history"
          className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md p-6 text-center font-semibold transition transform hover:scale-105"
        >
          📋 Lịch sử chuyến
        </a>
        <a
          href="/driver/profile"
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-md p-6 text-center font-semibold transition transform hover:scale-105"
        >
          👤 Hồ sơ cá nhân
        </a>
      </div>
    </div>
  );
}
