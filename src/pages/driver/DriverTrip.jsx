import { useState } from "react";
import { Clock, CheckCircle, X, AlertCircle, MapPin, User, Phone, DollarSign, Navigation, Play, StopCircle, LogIn, LogOut } from "lucide-react";

export default function DriverTrip() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // pending, ongoing, completed
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [trips, setTrips] = useState([
    {
      id: "TRIP001",
      passenger: "Lê Thanh B",
      phone: "0912345678",
      from: "Tân Sơn Nhất",
      to: "Quận 1",
      distance: 12.5,
      estimatedFare: 450000,
      startTime: "14:30",
      bookingTime: "02/02/2026 14:00",
      status: "pending",
      notes: "Khách hành lý ít",
    },
    {
      id: "TRIP002",
      passenger: "Trần Minh C",
      phone: "0987654321",
      from: "Quận 3",
      to: "Bình Thạnh",
      distance: 8.2,
      estimatedFare: 320000,
      startTime: "15:45",
      bookingTime: "02/02/2026 15:15",
      status: "pending",
      notes: "Thanh toán bằng tiền mặt",
    },
    {
      id: "TRIP003",
      passenger: "Phạm Hùng D",
      phone: "0934567890",
      from: "Quận 5",
      to: "Quận 7",
      distance: 10.8,
      estimatedFare: 380000,
      startTime: "16:00",
      bookingTime: "02/02/2026 15:20",
      status: "pending",
      notes: "Khách đợi tại cổng chính",
    },
  ]);

  const [ongoingTrips, setOngoingTrips] = useState([
    {
      id: "TRIP004",
      passenger: "Võ Minh E",
      phone: "0945678901",
      from: "Sân bay Tân Sơn Nhất",
      to: "Quận 2",
      distance: 15.3,
      estimatedFare: 520000,
      startTime: "13:30",
      startedAt: "02/02/2026 13:32",
      status: "ongoing",
      notes: "Khách hành lý nhiều",
    },
  ]);

  const [completedTrips, setCompletedTrips] = useState([
    {
      id: "TRIP005",
      passenger: "Ngô Thị F",
      phone: "0956789012",
      from: "Trung tâm Hồ Chí Minh",
      to: "Thủ Đức",
      distance: 11.2,
      estimatedFare: 380000,
      actualFare: 380000,
      startTime: "10:00",
      endTime: "11:15",
      rating: 5,
      status: "completed",
      notes: "Hoàn thành",
    },
  ]);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    setCheckedIn(true);
    setSuccessMessage("✅ Check-in thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setCheckInTime(null);
    setSuccessMessage("✅ Check-out thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAcceptTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setTrips(trips.filter((t) => t.id !== tripId));
      setOngoingTrips([
        ...ongoingTrips,
        {
          ...trip,
          status: "ongoing",
          startedAt: new Date().toLocaleString("vi-VN"),
        },
      ]);
      setSuccessMessage("✅ Chấp nhận chuyến đi thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleRejectTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setTrips(trips.filter((t) => t.id !== tripId));
      setSuccessMessage("✅ Từ chối chuyến đi!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleStartTrip = (tripId) => {
    const trip = ongoingTrips.find((t) => t.id === tripId);
    if (trip) {
      setOngoingTrips(
        ongoingTrips.map((t) =>
          t.id === tripId ? { ...t, tripStarted: true, tripStartedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) } : t
        )
      );
      setSuccessMessage("🚗 Bắt đầu chuyến đi!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleCompleteTrip = (tripId) => {
    const trip = ongoingTrips.find((t) => t.id === tripId);
    if (trip) {
      setOngoingTrips(ongoingTrips.filter((t) => t.id !== tripId));
      setCompletedTrips([
        ...completedTrips,
        {
          ...trip,
          status: "completed",
          endTime: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          actualFare: trip.estimatedFare,
          rating: 0,
        },
      ]);
      setSuccessMessage("✅ Kết thúc chuyến đi thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* === HEADER === */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản lý chuyến đi</h1>
        <p className="text-gray-600">Chấp nhận/từ chối chuyến, quản lý check-in/check-out</p>
      </div>

      {/* === SUCCESS MESSAGE === */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* === DAILY CHECK-IN/CHECK-OUT === */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md border border-blue-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
          <Clock className="text-blue-500" size={28} />
          <span>Checkin / Checkout hàng ngày</span>
        </h2>

        {!checkedIn ? (
          <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg p-6 border border-blue-300">
            <div>
              <p className="text-gray-700 font-medium mb-2">Bạn chưa check-in hôm nay</p>
              <p className="text-sm text-gray-600">Nhấn nút bên dưới để bắt đầu ca làm việc</p>
            </div>
            <button
              onClick={handleCheckIn}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold shadow-md"
            >
              <LogIn size={20} />
              <span>Check-in ngay</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg p-6 border border-green-300">
            <div>
              <p className="text-gray-700 font-medium mb-2">✅ Bạn đã check-in</p>
              <p className="text-sm text-gray-600">Thời gian check-in: {checkInTime}</p>
            </div>
            <button
              onClick={handleCheckOut}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-md"
            >
              <LogOut size={20} />
              <span>Check-out</span>
            </button>
          </div>
        )}
      </div>

      {/* === TABS === */}
      <div className="flex space-x-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "pending"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          📋 Chuyến chờ phân công ({trips.length})
        </button>
        <button
          onClick={() => setActiveTab("ongoing")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "ongoing"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🚗 Chuyến đang thực hiện ({ongoingTrips.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "completed"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          ✅ Chuyến đã hoàn thành ({completedTrips.length})
        </button>
      </div>

      {/* === PENDING TRIPS TAB === */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Trip Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {trip.id}
                        </h3>
                        <p className="text-sm text-gray-500">Phân công lúc: {trip.bookingTime}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        Chờ duyệt
                      </span>
                    </div>

                    {/* Passenger Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <User size={18} className="text-gray-600" />
                        <span className="font-semibold text-gray-800">{trip.passenger}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-600" />
                        <span className="text-gray-700">{trip.phone}</span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Điểm đi</p>
                        <p className="font-semibold text-gray-800">{trip.from}</p>
                      </div>
                      <Navigation className="text-blue-500" size={24} />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Điểm đến</p>
                        <p className="font-semibold text-gray-800">{trip.to}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Khoảng cách</p>
                        <p className="font-semibold text-gray-800">{trip.distance} km</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Giá dự kiến</p>
                        <p className="font-semibold text-gray-800">
                          {(trip.estimatedFare / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Thời gian</p>
                        <p className="font-semibold text-gray-800">{trip.startTime}</p>
                      </div>
                    </div>

                    {trip.notes && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm text-gray-700">📝 {trip.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3 justify-center">
                    <button
                      onClick={() => handleAcceptTrip(trip.id)}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                    >
                      <CheckCircle size={20} />
                      <span>Chấp nhận</span>
                    </button>
                    <button
                      onClick={() => handleRejectTrip(trip.id)}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                      <X size={20} />
                      <span>Từ chối</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 font-medium">Không có chuyến đi chờ phân công</p>
            </div>
          )}
        </div>
      )}

      {/* === ONGOING TRIPS TAB === */}
      {activeTab === "ongoing" && (
        <div className="space-y-4">
          {ongoingTrips.length > 0 ? (
            ongoingTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow-md border-2 border-blue-300 p-6 hover:shadow-lg transition bg-blue-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Trip Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {trip.id}
                        </h3>
                        <p className="text-sm text-gray-500">Nhận lúc: {trip.startedAt}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold animate-pulse">
                        🟢 Đang thực hiện
                      </span>
                    </div>

                    {/* Passenger Info */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <User size={18} className="text-gray-600" />
                        <span className="font-semibold text-gray-800">{trip.passenger}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-600" />
                        <span className="text-gray-700">{trip.phone}</span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Điểm đi</p>
                        <p className="font-semibold text-gray-800">{trip.from}</p>
                      </div>
                      <Navigation className="text-blue-500" size={24} />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Điểm đến</p>
                        <p className="font-semibold text-gray-800">{trip.to}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Khoảng cách</p>
                        <p className="font-semibold text-gray-800">{trip.distance} km</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Giá dự kiến</p>
                        <p className="font-semibold text-gray-800">
                          {(trip.estimatedFare / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Thời gian</p>
                        <p className="font-semibold text-gray-800">{trip.startTime}</p>
                      </div>
                    </div>

                    {trip.notes && (
                      <div className="bg-white border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm text-gray-700">📝 {trip.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3 justify-center">
                    {!trip.tripStarted ? (
                      <button
                        onClick={() => handleStartTrip(trip.id)}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                      >
                        <Play size={20} />
                        <span>Bắt đầu chuyến</span>
                      </button>
                    ) : (
                      <>
                        <div className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold text-center border border-green-300">
                          ✅ Đã bắt đầu
                        </div>
                        <button
                          onClick={() => handleCompleteTrip(trip.id)}
                          className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                        >
                          <StopCircle size={20} />
                          <span>Kết thúc chuyến</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 font-medium">Không có chuyến đi nào đang thực hiện</p>
            </div>
          )}
        </div>
      )}

      {/* === COMPLETED TRIPS TAB === */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {completedTrips.length > 0 ? (
            completedTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow-md border border-green-200 p-6 hover:shadow-lg transition bg-green-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Trip Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {trip.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {trip.startTime} → {trip.endTime}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✅ Hoàn thành
                      </span>
                    </div>

                    {/* Passenger Info */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <User size={18} className="text-gray-600" />
                        <span className="font-semibold text-gray-800">{trip.passenger}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-600" />
                        <span className="text-gray-700">{trip.phone}</span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Điểm đi</p>
                        <p className="font-semibold text-gray-800">{trip.from}</p>
                      </div>
                      <Navigation className="text-green-500" size={24} />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Điểm đến</p>
                        <p className="font-semibold text-gray-800">{trip.to}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Khoảng cách</p>
                        <p className="font-semibold text-gray-800">{trip.distance} km</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Giá</p>
                        <p className="font-semibold text-green-600">
                          +{(trip.actualFare / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Đánh giá</p>
                        <p className="font-semibold text-gray-800">
                          {trip.rating > 0 ? `⭐ ${trip.rating}/5` : "Chưa đánh giá"}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">Thời gian</p>
                        <p className="font-semibold text-gray-800">~45 phút</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3 justify-center">
                    <div className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold text-center border border-green-300">
                      ✅ Chuyến đã hoàn thành
                    </div>
                    <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 font-medium">Chưa có chuyến đi nào hoàn thành</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
