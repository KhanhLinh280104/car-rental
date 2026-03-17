import { Car, Users, ClipboardList, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStaffDashboardStatsApi } from "../api/staffApi";

export default function Staff() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getStaffDashboardStatsApi();
        console.log("STAFF DASHBOARD:", res.data);

        const data = res.data?.data ?? res.data;
        setStats(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Tổng số xe",
      value: stats?.totalVehicles ?? "—",
      icon: <Car size={28} />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Tổng tài xế",
      value: stats?.totalDrivers ?? "—",
      icon: <Users size={28} />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Tổng đơn đặt",
      value: stats?.totalBookings ?? "—",
      icon: <ClipboardList size={28} />,
      color: "bg-green-100 text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={32} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Trang nhân viên</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}