import { useState } from "react";
import { Search, Filter, Download, MapPin, Clock, DollarSign, Star, ChevronDown, X } from "lucide-react";

export default function DriverHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(null);

  const allTrips = [
    {
      id: "TRIP001",
      date: "02/02/2026",
      time: "14:30",
      from: "Tân Sơn Nhất",
      to: "Quận 1",
      distance: 12.5,
      duration: "45 phút",
      earnings: 450000,
      rating: 5,
      passenger: "Lê Thanh B",
      status: "Hoàn thành",
      notes: "Khách hàng rất hài lòng",
    },
    {
      id: "TRIP002",
      date: "01/02/2026",
      time: "10:15",
      from: "Quận 3",
      to: "Bình Thạnh",
      distance: 8.2,
      duration: "35 phút",
      earnings: 320000,
      rating: 4,
      passenger: "Trần Minh C",
      status: "Hoàn thành",
      notes: "Khách hàng bình thường",
    },
    {
      id: "TRIP003",
      date: "01/02/2026",
      time: "16:45",
      from: "Quận 5",
      to: "Quận 7",
      distance: 10.8,
      duration: "40 phút",
      earnings: 280000,
      rating: 5,
      passenger: "Phạm Hùng D",
      status: "Hoàn thành",
      notes: "Giao dịch suôn sẻ",
    },
    {
      id: "TRIP004",
      date: "31/01/2026",
      time: "09:00",
      from: "Sân bay Tân Sơn Nhất",
      to: "Quận 2",
      distance: 15.3,
      duration: "55 phút",
      earnings: 520000,
      rating: 4,
      passenger: "Võ Minh E",
      status: "Hoàn thành",
      notes: "Khách hành lý nhiều",
    },
    {
      id: "TRIP005",
      date: "31/01/2026",
      time: "19:30",
      from: "Quận 10",
      to: "Quận 4",
      distance: 6.5,
      duration: "30 phút",
      earnings: 0,
      rating: 0,
      passenger: "Ngô Thị F",
      status: "Đã hủy",
      notes: "Khách hủy chuyến",
    },
    {
      id: "TRIP006",
      date: "30/01/2026",
      time: "13:20",
      from: "Trung tâm Hồ Chí Minh",
      to: "Thủ Đức",
      distance: 11.2,
      duration: "42 phút",
      earnings: 380000,
      rating: 5,
      passenger: "Dương Văn G",
      status: "Hoàn thành",
      notes: "Khách hàng thân thiện",
    },
    {
      id: "TRIP007",
      date: "30/01/2026",
      time: "15:00",
      from: "Biên Hòa",
      to: "Quận 1",
      distance: 32.1,
      duration: "1 giờ 15 phút",
      earnings: 890000,
      rating: 5,
      passenger: "Bùi Công H",
      status: "Hoàn thành",
      notes: "Chuyến dài, khách rất hài lòng",
    },
    {
      id: "TRIP008",
      date: "29/01/2026",
      time: "11:45",
      from: "Quận 6",
      to: "Quận 8",
      distance: 9.7,
      duration: "38 phút",
      earnings: 340000,
      rating: 3,
      passenger: "Trương Thanh I",
      status: "Hoàn thành",
      notes: "Khách hàng hơi vội vàng",
    },
  ];

  // Filter logic
  const filteredTrips = allTrips.filter((trip) => {
    const matchSearch =
      trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.passenger.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" || trip.status === filterStatus;

    const tripMonth = trip.date.split("/")[1];
    const tripYear = trip.date.split("/")[2];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const matchMonth =
      filterMonth === "all" ||
      (filterMonth === "this" &&
        tripMonth == currentMonth &&
        tripYear == currentYear) ||
      (filterMonth === "last" &&
        (tripMonth == currentMonth - 1 || (currentMonth === 1 && tripMonth === 12)));

    return matchSearch && matchStatus && matchMonth;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTrips = filteredTrips.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Statistics
  const stats = {
    totalTrips: allTrips.length,
    completedTrips: allTrips.filter((t) => t.status === "Hoàn thành").length,
    cancelledTrips: allTrips.filter((t) => t.status === "Đã hủy").length,
    totalEarnings: allTrips.reduce((sum, t) => sum + t.earnings, 0),
    averageRating:
      (
        allTrips.reduce((sum, t) => sum + t.rating, 0) /
        allTrips.filter((t) => t.rating > 0).length
      ).toFixed(1),
  };

  const getStatusColor = (status) => {
    if (status === "Hoàn thành") return "bg-green-100 text-green-700";
    if (status === "Đang thực hiện") return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-yellow-500";
    if (rating >= 3) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* === HEADER === */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Lịch sử chuyến đi</h1>
        <p className="text-gray-600">Xem tất cả các chuyến đi của bạn</p>
      </div>

      {/* === STATISTICS === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Tổng chuyến đi</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalTrips}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.completedTrips} hoàn thành, {stats.cancelledTrips} hủy
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Tổng thu nhập</p>
          <p className="text-3xl font-bold text-green-600">
            {(stats.totalEarnings / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-600 mt-2">
            TB: {(stats.totalEarnings / stats.completedTrips / 1000).toFixed(0)}K/chuyến
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Đánh giá trung bình</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.averageRating}/5</p>
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

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Tỉ lệ hoàn thành</p>
          <p className="text-3xl font-bold text-purple-600">
            {((stats.completedTrips / stats.totalTrips) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.completedTrips}/{stats.totalTrips} chuyến
          </p>
        </div>
      </div>

      {/* === FILTERS & SEARCH === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
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
                placeholder="Tìm theo mã, điểm đi, điểm đến..."
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
            <span>Xuất</span>
          </button>
        </div>
      </div>

      {/* === TRIPS TABLE === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Mã
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Ngày giờ
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Hành trình
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Khoảng cách
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Thu nhập
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Đánh giá
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">
                  Chi tiết
                </th>
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
                      {trip.id}
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
                    <td className="py-4 px-6 text-gray-700">
                      {trip.distance} km
                    </td>
                    <td className="py-4 px-6 font-semibold text-green-600">
                      {trip.earnings > 0
                        ? `+${(trip.earnings / 1000).toFixed(0)}K`
                        : "-"}
                    </td>
                    <td className="py-4 px-6">
                      {trip.rating > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Star
                            size={16}
                            className={`fill-yellow-400 text-yellow-400`}
                          />
                          <span className="text-gray-700 font-medium">
                            {trip.rating}.0
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          trip.status
                        )}`}
                      >
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
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    Không tìm thấy chuyến đi nào
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Trước
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg font-medium transition ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* === DETAIL MODAL === */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                Chi tiết chuyến đi
              </h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Trip ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mã chuyến đi</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {showDetailModal.id}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    showDetailModal.status
                  )}`}
                >
                  {showDetailModal.status}
                </span>
              </div>

              {/* Route Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Điểm đi</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {showDetailModal.from}
                    </p>
                  </div>
                  <MapPin className="text-blue-500" size={32} />
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Điểm đến</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {showDetailModal.to}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Ngày giờ</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {showDetailModal.date} {showDetailModal.time}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Thời gian chuyến</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {showDetailModal.duration}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Khoảng cách</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {showDetailModal.distance} km
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Khách hàng</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {showDetailModal.passenger}
                  </p>
                </div>
              </div>

              {/* Financial & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Thu nhập</p>
                  <p className="text-3xl font-bold text-green-600">
                    {showDetailModal.earnings > 0
                      ? `${(showDetailModal.earnings / 1000).toFixed(0)}K`
                      : "0"}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-2">Đánh giá</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-yellow-600">
                      {showDetailModal.rating > 0 ? showDetailModal.rating : "-"}
                    </span>
                    {showDetailModal.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={
                              i < showDetailModal.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Ghi chú</p>
                <p className="text-gray-800">{showDetailModal.notes}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(null)}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
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
