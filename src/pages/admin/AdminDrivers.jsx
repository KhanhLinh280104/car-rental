import React, { useState } from 'react';
import { User, Phone, Star, MapPin, MoreHorizontal, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

// --- MOCK DATA ---
const MOCK_DRIVERS = [
  { id: "DR001", name: "Nguyễn Văn Tài", phone: "0909.111.222", status: "Available", rating: 4.8, trips: 156, location: "Bãi xe Q1" },
  { id: "DR002", name: "Trần Hữu Dũng", phone: "0912.333.444", status: "On Trip", rating: 4.9, trips: 89, location: "Đang đi Q7" },
  { id: "DR003", name: "Lê Minh Tuấn", phone: "0988.555.666", status: "Off Duty", rating: 4.5, trips: 210, location: "Nhà riêng" },
  { id: "DR004", name: "Phạm Văn E", phone: "0977.888.999", status: "Available", rating: 4.7, trips: 45, location: "Bãi xe Q3" },
];

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);

  // Xem chi tiết tài xế
  const handleViewDetails = (driver) => {
    Swal.fire({
      title: driver.name,
      html: `
        <div class="text-left">
          <p><strong>SĐT:</strong> ${driver.phone}</p>
          <p><strong>Trạng thái:</strong> ${driver.status}</p>
          <p><strong>Đánh giá:</strong> ${driver.rating} ⭐</p>
          <p><strong>Tổng chuyến:</strong> ${driver.trips}</p>
          <p><strong>Vị trí hiện tại:</strong> ${driver.location}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Phân công việc',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#10B981'
    }).then((result) => {
      if (result.isConfirmed) {
         if (driver.status !== 'Available') {
            Swal.fire('Không thể phân công', 'Tài xế này đang bận hoặc đã nghỉ!', 'error');
         } else {
            Swal.fire('Đã gửi yêu cầu', `Đã gửi lệnh điều phối tới tài xế ${driver.name}`, 'success');
         }
      }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-700'; // Rảnh
      case 'On Trip': return 'bg-blue-100 text-blue-700';     // Đang chạy
      case 'Off Duty': return 'bg-gray-100 text-gray-500';    // Nghỉ làm
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý Tài xế</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">Tài xế</th>
              <th className="p-4">Liên hệ</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Đánh giá</th>
              <th className="p-4">Vị trí</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {drivers.map((drv) => (
              <tr key={drv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(drv)}>
                <td className="p-4 font-medium flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {drv.name.charAt(drv.name.lastIndexOf(' ') + 1)}
                  </div>
                  <div>
                    <p className="text-gray-900">{drv.name}</p>
                    <p className="text-xs text-gray-400">ID: {drv.id}</p>
                  </div>
                </td>
                <td className="p-4 text-gray-600"><div className="flex items-center gap-1"><Phone size={14}/> {drv.phone}</div></td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(drv.status)}`}>
                    {drv.status}
                  </span>
                </td>
                <td className="p-4 text-yellow-500 font-medium flex items-center gap-1">
                   {drv.rating} <Star size={14} fill="currentColor"/>
                </td>
                <td className="p-4 text-gray-500 text-sm"><div className="flex items-center gap-1"><MapPin size={14}/> {drv.location}</div></td>
                <td className="p-4 text-right text-gray-400">
                   <MoreHorizontal size={20} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDrivers;