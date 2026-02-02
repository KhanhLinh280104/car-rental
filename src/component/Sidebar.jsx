import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// 1. THÊM IdCard VÀO DÒNG IMPORT
import {
  User, Lock, Trash2, LogOut, Home, Users, FileText,
  BarChart3, Car, Settings, Map, AlertTriangle, IdCard
} from "lucide-react";
import LogoutModal from "./LogoutModal";
import { logoutApi } from "../api/authApi";

export default function Sidebar({ role = "user" }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.clear(); // Clear all tokens
      setShowLogoutModal(false);
      navigate("/");
      window.location.reload();
    }
  };

  const menus = {
    user: [
      { id: 'home', to: "/", label: "Trang chủ", icon: <Home size={18} /> },
      { id: 'profile', to: "/user", label: "Thông tin cá nhân", icon: <User size={18} /> },
      { id: 'password', to: "/user/change-password", label: "Đổi mật khẩu", icon: <Lock size={18} /> }, // Sửa icon thành Lock cho hợp
      { id: 'delete', to: "/user/delete-account", label: "Xóa tài khoản", icon: <Trash2 size={18} /> },
    ],
    staff: [
      { id: 'home', to: "/staff", label: "Trang chủ", icon: <Home size={18} /> },
      { id: 'bookings', to: "/staff/booking", label: "Đơn đặt", icon: <FileText size={18} /> },
      { id: 'drivers', to: "/staff/driver-list", label: "Danh sách tài xế", icon: <IdCard size={18} /> },
      { id: 'vehicles', to: "/staff/vehicle-list", label: "Danh sách xe", icon: <Car size={18} /> },
    ],
    admin: [
      { id: 'dashboard', to: "/admin", label: "Dashboard", icon: <BarChart3 size={18} /> },
      { id: 'fleet', to: "/admin/fleet", label: "Quản lý đội xe", icon: <Car size={18} /> },
      { id: 'users', to: "/admin/users", label: "Quản lý người dùng", icon: <Users size={18} /> },
      { id: 'drivers', to: "/admin/drivers", label: "Quản lý tài xế", icon: <User size={18} /> },
      { id: 'bookings', to: "/admin/bookings", label: "Quản lý đặt xe", icon: <FileText size={18} /> },
      { id: 'tracking', to: "/admin/tracking", label: "Bản đồ GPS", icon: <Map size={18} /> },
      { id: 'incidents', to: "/admin/incidents", label: "Sự cố & Hư hại", icon: <AlertTriangle size={18} /> },
      { id: 'settings', to: "/admin/settings", label: "Cấu hình hệ thống", icon: <Settings size={18} /> },
    ],
  };

  // Chọn menu dựa trên role, mặc định là user
  const items = menus[role] || menus.user;

  // 2. LOGIC TỰ ĐỘNG HIGHLIGHT (Thông minh hơn, không cần if/else dài dòng)
  const currentPath = location.pathname;
  // Tìm item nào có đường dẫn khớp với URL hiện tại
  const activeItem = items.find(item =>
    item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to)
  );
  // Lấy ID của item đó để tô màu
  const derivedActive = activeItem ? activeItem.id : '';

  return (
    <div className="w-full lg:w-1/4 mb-6 lg:mb-0">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {role === 'admin' ? 'Quản trị viên' : role === 'staff' ? 'Nhân viên' : 'Xin chào bạn!'}
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`flex items-center space-x-3 px-6 py-4 transition-colors w-full text-left
                ${derivedActive === item.id
                  ? 'border-l-4 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-3 px-6 py-4 text-red-500 hover:bg-red-50 mt-2 border-t border-gray-100 w-full text-left transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}