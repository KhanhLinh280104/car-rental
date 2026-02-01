import { Car, Users, ClipboardList } from "lucide-react";

export default function Staff() {
  // Mock data (sau này thay bằng API)
  const stats = {
    totalVehicles: 24,
    totalDrivers: 12,
    totalBookings: 58,
  };

  const cards = [
    {
      title: "Tổng số xe",
      value: stats.totalVehicles,
      icon: <Car size={28} />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Tổng tài xế",
      value: stats.totalDrivers,
      icon: <Users size={28} />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Tổng đơn đặt",
      value: stats.totalBookings,
      icon: <ClipboardList size={28} />,
      color: "bg-green-100 text-green-600",
    },
  ];

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
