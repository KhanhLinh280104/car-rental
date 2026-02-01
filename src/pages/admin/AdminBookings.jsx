import React, { useState } from 'react';
import { FileText, Check, X, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

// --- MOCK DATA: BOOKINGS ---
const MOCK_BOOKINGS = [
  { id: "BK001", customer: "Trần Văn C", car: "VinFast VF8", dates: "01/02 - 03/02", total: "2.400.000 đ", status: "Pending", payment: "Unpaid" },
  { id: "BK002", customer: "Lê Thị D", car: "Kia Carnival", dates: "05/02 - 05/02", total: "1.200.000 đ", status: "Approved", payment: "Paid" },
  { id: "BK003", customer: "Phạm E", car: "Tesla Model 3", dates: "10/02 - 12/02", total: "5.000.000 đ", status: "Completed", payment: "Paid" },
  { id: "BK004", customer: "Nguyễn F", car: "VinFast VF e34", dates: "02/02 - 04/02", total: "1.800.000 đ", status: "Cancelled", payment: "Refunded" },
];

const AdminBookings = () => {
  // SỬA 1: Dùng MOCK_BOOKINGS làm giá trị khởi tạo
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);

  // Xử lý Duyệt đơn
  const handleApprove = (id) => {
    Swal.fire({
      title: 'Duyệt đơn hàng?',
      text: `Bạn có chắc muốn duyệt đơn ${id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981', // Màu xanh lá
      confirmButtonText: 'Duyệt ngay',
      cancelButtonText: 'Suy nghĩ lại'
    }).then((result) => {
      if (result.isConfirmed) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Approved' } : b));
        Swal.fire('Đã duyệt!', 'Đơn hàng đã được chấp nhận.', 'success');
      }
    });
  };

  // Xử lý Từ chối đơn
  const handleReject = (id) => {
    Swal.fire({
      title: 'Từ chối đơn hàng?',
      text: `Bạn có chắc muốn hủy đơn ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444', // Màu đỏ
      confirmButtonText: 'Từ chối đơn',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        Swal.fire('Đã hủy!', 'Đơn hàng đã bị từ chối.', 'error');
      }
    });
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý đặt xe</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Xe thuê</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* SỬA 2: Map qua state 'bookings' thay vì biến tĩnh MOCK_BOOKINGS */}
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-medium text-gray-600">#{booking.id}</td>
                <td className="p-4 font-medium">{booking.customer}</td>
                <td className="p-4 text-blue-600">{booking.car}</td>
                <td className="p-4 text-sm text-gray-500">{booking.dates}</td>
                <td className="p-4 font-bold text-gray-800">{booking.total}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {booking.status === 'Pending' && (
                        <>
                            {/* SỬA 3: Thêm onClick vào các nút bấm */}
                            <button 
                              onClick={() => handleApprove(booking.id)}
                              className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" 
                              title="Duyệt"
                            >
                              <Check size={16}/>
                            </button>
                            <button 
                              onClick={() => handleReject(booking.id)}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" 
                              title="Từ chối"
                            >
                              <X size={16}/>
                            </button>
                        </>
                    )}
                    <button className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Chi tiết">
                      <Eye size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;