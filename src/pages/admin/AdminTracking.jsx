import React, { useState } from 'react';
import { MapPin, Navigation, Battery, Info } from 'lucide-react';
import Swal from 'sweetalert2';

// Dữ liệu xe với toạ độ giả (top, left tính theo %)
const MOCK_GPS_CARS = [
  { id: 1, name: "VinFast VF8", status: "Moving", top: 30, left: 20, speed: "45 km/h", battery: 82, address: "Đường Nguyễn Huệ, Q1" },
  { id: 2, name: "VF e34", status: "Stopped", top: 60, left: 55, speed: "0 km/h", battery: 45, address: "Bãi xe Landmark 81" },
  { id: 3, name: "Tesla Model 3", status: "Moving", top: 45, left: 80, speed: "60 km/h", battery: 15, address: "Cao tốc Long Thành" },
  { id: 4, name: "Kia Carnival", status: "Idle", top: 20, left: 60, speed: "0 km/h", battery: 98, address: "Sân bay Tân Sơn Nhất" },
];

const AdminTracking = () => {
  const [cars, setCars] = useState(MOCK_GPS_CARS);

  // Click vào xe trên bản đồ
  const handleCarClick = (car) => {
    Swal.fire({
      title: car.name,
      html: `
        <div class="grid grid-cols-2 gap-2 text-left text-sm mt-2">
           <div class="bg-gray-50 p-2 rounded border"><p class="text-gray-500">Tốc độ</p><p class="font-bold">${car.speed}</p></div>
           <div class="bg-gray-50 p-2 rounded border"><p class="text-gray-500">Pin</p><p class="font-bold ${car.battery < 20 ? 'text-red-500' : 'text-green-600'}">${car.battery}%</p></div>
           <div class="col-span-2 bg-gray-50 p-2 rounded border"><p class="text-gray-500">Vị trí hiện tại</p><p class="font-bold">${car.address}</p></div>
        </div>
      `,
      confirmButtonText: 'Xem Camera hành trình',
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="text-blue-600"/> Theo dõi hạm đội (GPS Realtime)
        </h2>
        <div className="flex gap-2 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span> Đang chạy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Dừng/Đỗ</span>
        </div>
      </div>

      {/* KHUNG BẢN ĐỒ GIẢ LẬP */}
      <div className="flex-1 bg-blue-50 rounded-2xl border-2 border-blue-100 relative overflow-hidden shadow-inner group">
        {/* Lưới bản đồ giả (Grid) */}
        <div className="absolute inset-0 opacity-10" 
             style={{backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
        </div>

        {/* Render các xe lên bản đồ */}
        {cars.map((car) => (
            <div 
                key={car.id}
                onClick={() => handleCarClick(car)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 hover:scale-110 z-10"
                style={{ top: `${car.top}%`, left: `${car.left}%` }}
            >
                {/* Bong bóng thông tin khi hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20">
                    {car.name} ({car.battery}%)
                </div>

                {/* Icon Xe (Pin) */}
                <div className={`relative p-2 rounded-full border-2 border-white shadow-lg 
                    ${car.status === 'Moving' ? 'bg-blue-500 animate-bounce-slow' : 'bg-red-500'}`}
                >
                    <Navigation size={20} className="text-white transform rotate-45" />
                    
                    {/* Hiệu ứng sóng radar cho xe đang chạy */}
                    {car.status === 'Moving' && (
                        <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                    )}
                </div>
            </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">* Đây là bản đồ mô phỏng hệ thống GPS Tracking thời gian thực.</p>
    </div>
  );
};

export default AdminTracking;