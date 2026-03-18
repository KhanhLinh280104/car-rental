import { useState, useEffect, useCallback } from "react";
import { Search, Download, MapPin, Star, X, Loader2, AlertTriangle } from "lucide-react";
import { getDriverByUserIdApi, getDriverBookingsApi } from "../../api/bookingApi";

export default function DriverHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(null);

  const userId = localStorage.getItem("userId");

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError("Không tìm thấy thông tin xác thực. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Lấy thông tin tài xế
      const profileRes = await getDriverByUserIdApi(userId);
      const profileId = profileRes.data?.data?.id;
      if (!profileId) throw new Error("Chưa có hồ sơ tài xế.");

      // 2. Lấy booking lịch sử (COMPLETED + CANCELLED) của tài xế qua API chuyên biệt
      // Gọi song song 2 trạng thái rồi gộp lại
      const [completedRes, cancelledRes] = await Promise.all([
        getDriverBookingsApi(profileId, "COMPLETED", 0, 200),
        getDriverBookingsApi(profileId, "CANCELLED", 0, 200),
      ]);
      const mine = [
        ...(completedRes.data?.data?.content || []),
        ...(cancelledRes.data?.data?.content || []),
      ];

      let completed = 0;
      let cancelled = 0;
      let earnings = 0;

      const formattedTrips = mine.map(booking => {
        const d = new Date(booking.createdAt);

        if (booking.status === "COMPLETED") {
          completed++;
          earnings += booking.totalAmount || 0;
        } else if (booking.status === "CANCELLED") {
          cancelled++;
        }

        return {
          id: booking.id,
          bookingCode: booking.bookingCode,
          date: d.toLocaleDateString("vi-VN"),
          time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          from: "CRS Hub",
          to: booking.deliveryAddress || "Trả tại bãi",
          distance: 0, // Cần update từ model detail nếu có
          duration: "-- phút",
          earnings: booking.status === "COMPLETED" ? (booking.totalAmount || 0) : 0,
          rating: booking.status === "COMPLETED" ? 5 : 0,
          passenger: booking.userId,
          status: booking.status === "COMPLETED" ? "Hoàn thành" : "Đã hủy",
          notes: booking.status === "CANCELLED" ? "Đã hủy từ hệ thống" : "Chuyến đi thành công",
          rawDate: d.getTime()
        };
      });

      // Sort Date Descending
      formattedTrips.sort((a, b) => b.rawDate - a.rawDate);

      setStats({
        totalTrips: mine.length,
        completedTrips: completed,
        cancelledTrips: cancelled,
        totalEarnings: earnings,
        averageRating: 5.0, // Hardcode tạm
      });

      setAllTrips(formattedTrips);
    } catch (e) {
      console.error(e);
      setError("Không thể tải lịch sử chuyến đi.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter logic
  const filteredTrips = allTrips.filter((trip) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      trip.id.toString().includes(term) ||
      (trip.bookingCode && trip.bookingCode.toLowerCase().includes(term)) ||
      trip.from.toLowerCase().includes(term) ||
      trip.to.toLowerCase().includes(term) ||
      trip.passenger.toLowerCase().includes(term);

    const matchStatus =
      filterStatus === "all" || trip.status === filterStatus;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const matchMonth =
      filterMonth === "all" ||
      (filterMonth === "this" && trip.month === currentMonth && trip.year === currentYear) ||
      (filterMonth === "last" && (trip.month === currentMonth - 1 || (currentMonth === 1 && trip.month === 12)));

    return matchSearch && matchStatus && matchMonth;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTrips = filteredTrips.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    if (status === "Hoàn thành") return "bg-green-100 text-green-700";
    if (status === "Đang thực hiện") return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Đang tải lịch sử chuyến đi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4 text-red-700">
          <AlertTriangle size={24} />
          <h2 className="font-bold">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* === HEADER === */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Lịch sử chuyến đi</h1>
        <p className="text-gray-600">Xem tất cả các chuyến đi của bạn</p>
      </div>

      {/* === STATISTICS === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Tổng chuyến đi</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalTrips}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.completedTrips} hoàn thành, {stats.cancelledTrips} hủy
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Tổng thu nhập</p>
          <p className="text-3xl font-bold text-green-600">
            {(stats.totalEarnings / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-600 mt-2">
            TB: {stats.completedTrips ? ((stats.totalEarnings / stats.completedTrips) / 1000).toFixed(0) : 0}K/chuyến
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Đánh giá trung bình</p>
          <p className="text-3xl font-bold text-yellow-600">{Number(stats.averageRating).toFixed(1)}/5</p>
          <div className="flex items-center space-x-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Tỉ lệ hoàn thành</p>
          <p className="text-3xl font-bold text-purple-600">
            {stats.totalTrips > 0 ? ((stats.completedTrips / stats.totalTrips) * 100).toFixed(0) : 100}%
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.completedTrips}/{stats.totalTrips} chuyến
          </p>
        </div>
      </div>

      {/* === FILTERS & SEARCH === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm theo mã, điểm đến, mã đơn..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="this">Tháng này</option>
              <option value="last">Tháng trước</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            <Download size={18} />
            <span className="font-semibold">Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* === TRIPS TABLE === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Mã</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Ngày giờ</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Hành trình</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Thu nhập</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {displayedTrips.length > 0 ? (
                displayedTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-6 font-semibold text-blue-600">
                      #{trip.id}
                      <div className="text-xs font-mono text-gray-400 mt-1">{trip.bookingCode}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      <div className="text-sm">
                        <p className="font-medium">{trip.date}</p>
                        <p className="text-gray-500">{trip.time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-gray-700 font-medium">{trip.from}</p>
                        <p className="text-gray-500">→ {trip.to}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-green-600">
                      {trip.earnings > 0 ? `+${(trip.earnings / 1000).toFixed(0)}K` : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setShowDetailModal(trip)}
                        className="text-blue-500 hover:text-blue-700 font-medium transition"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    Không tìm thấy chuyến đi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 py-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              ← Trước
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg font-medium transition ${currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* === DETAIL MODAL === */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết chuyến đi</h2>
              <button onClick={() => setShowDetailModal(null)} className="text-gray-500 hover:text-gray-700 transition">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Trip ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mã Booking</p>
                  <p className="text-2xl font-bold text-blue-600">#{showDetailModal.id}</p>
                  <p className="text-sm font-mono text-gray-500 mt-1 uppercase">{showDetailModal.bookingCode}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(showDetailModal.status)}`}>
                  {showDetailModal.status}
                </span>
              </div>

              {/* Route Info */}
              <div className="bg-gradient-to-r from-blue-50 flex to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Điểm bắt đầu</p>
                  <p className="font-semibold text-gray-800">{showDetailModal.from}</p>
                </div>
                <div className="px-4 flex items-center">
                  <MapPin className="text-blue-500" size={32} />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 mb-1">Điểm đến</p>
                  <p className="font-semibold text-gray-800">{showDetailModal.to}</p>
                </div>
              </div>

              {/* Trip Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Ngày giờ tạo</p>
                  <p className="text-lg font-semibold text-gray-800">{showDetailModal.date} {showDetailModal.time}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Khách hàng (User ID)</p>
                  <p className="text-lg font-semibold text-gray-800 truncate" title={showDetailModal.passenger}>
                    {showDetailModal.passenger}
                  </p>
                </div>
              </div>

              {/* Financial & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Giá cước (Tổng chuyến)</p>
                  <p className="text-3xl font-bold text-green-600">
                    {showDetailModal.earnings > 0 ? `${(showDetailModal.earnings / 1000).toFixed(0)}K` : "0"}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-2">Đánh giá tạm tính</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-yellow-600">
                      {showDetailModal.rating > 0 ? showDetailModal.rating : "-"}
                    </span>
                    {showDetailModal.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} className={i < showDetailModal.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-medium">Ghi chú chuyến đi</p>
                <p className="text-gray-800 bg-white p-3 rounded-lg border border-gray-100">{showDetailModal.notes}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(null)}
                className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition mt-2 shadow"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
