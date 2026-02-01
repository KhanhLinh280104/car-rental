// SỬA 1: Thêm dấu cách giữa } và from
import React, { useState } from 'react';
import { Shield, Ban, CheckCircle } from 'lucide-react';

// --- MOCK DATA: USERS ---
const MOCK_USERS = [
  { id: 1, name: "Admin User", email: "admin@carrental.com", role: "Admin", status: "Active", joinDate: "01/01/2025" },
  { id: 2, name: "Staff Member", email: "staff@carrental.com", role: "Staff", status: "Active", joinDate: "10/01/2025" },
  { id: 3, name: "Nguyễn Văn A", email: "user.a@gmail.com", role: "Customer", status: "Active", joinDate: "20/01/2025" },
  { id: 4, name: "Spam User", email: "spam@fake.com", role: "Customer", status: "Locked", joinDate: "25/01/2025" },
];

const AdminUsers = () => {
  // SỬA 2: Dùng MOCK_USERS làm giá trị khởi tạo
  const [users, setUsers] = useState(MOCK_USERS);

  // Xử lý Khóa/Mở khóa User
  const toggleStatus = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        const newStatus = user.status === 'Active' ? 'Locked' : 'Active';
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">Họ tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò (Role)</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày tham gia</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* SỬA 3: Map qua state 'users' thay vì MOCK_USERS */}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-gray-500">{user.email}</td>
                <td className="p-4">
                    <span className={`flex items-center gap-1 text-sm font-medium
                        ${user.role === 'Admin' ? 'text-purple-600' : user.role === 'Staff' ? 'text-blue-600' : 'text-gray-600'}
                    `}>
                        {user.role === 'Admin' && <Shield size={14}/>} {user.role}
                    </span>
                </td>
                <td className="p-4">
                   {user.status === 'Active' 
                     ? <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle size={14}/> Hoạt động</span>
                     : <span className="text-red-600 text-sm flex items-center gap-1"><Ban size={14}/> Đã khóa</span>
                   }
                </td>
                <td className="p-4 text-sm text-gray-500">{user.joinDate}</td>
                <td className="p-4 text-right">
                   {/* SỬA 4: Thêm onClick vào các nút bấm */}
                   {user.status === 'Active' 
                     ? (
                       <button 
                         onClick={() => toggleStatus(user.id)}
                         className="text-red-500 hover:text-red-700 text-sm font-medium"
                       >
                         Khóa
                       </button>
                     )
                     : (
                       <button 
                         onClick={() => toggleStatus(user.id)}
                         className="text-green-500 hover:text-green-700 text-sm font-medium"
                       >
                         Mở khóa
                       </button>
                     )
                   }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;