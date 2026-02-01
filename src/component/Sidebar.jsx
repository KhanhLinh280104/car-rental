import { useState, cloneElement } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Lock, Trash2, LogOut, Home, Users, FileText, BarChart3, Car, Settings, Map, AlertTriangle } from "lucide-react";
import LogoutModal from "./LogoutModal";

export default function Sidebar({ role = "guest", active = "", sidebarType = "role" }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/");
  };

  const menus = {
    guest: [
      { to: "/", label: "Trang chủ", icon: <Home size={18} /> },
      { to: "/user", label: "Thông tin cá nhân", icon: <User size={18} /> },
      {to: "/user/change-password", label: "Đổi mật khẩu", icon: <User size={18} /> },
      {to: "/user/delete-account", label: "Xóa tài khoản", icon: <Trash2 size={18} /> },
    ],
    user: [
      { id: 'home', to: "/", label: "Trang chủ", icon: <Home size={18} /> },
      { id: 'bookings', to: "/bookings", label: "Đơn đặt", icon: <FileText size={18} /> },
      { id: 'account', to: "/user", label: "Tài khoản của tôi", icon: <User size={18} /> },
      { id: 'password', to: "/user/change-password", label: "Đổi mật khẩu", icon: <Lock size={18} /> },
      { id: 'delete', to: "/user/delete-account", label: "Yêu cầu xoá tài khoản", icon: <Trash2 size={18} /> },
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

  const items = menus[role] || menus.guest;

  // derive whether to use the user-style sidebar: explicit prop, role, or path
  const renderUserStyle = sidebarType === "user" || role === "user" || location.pathname.startsWith('/user');

  // derive active item from prop or from pathname for user pages
  let derivedActive = active;
  if (!derivedActive) {
    const p = location.pathname;
    if (p.startsWith('/user/change-password')) derivedActive = 'password';
    else if (p.startsWith('/user/delete-account')) derivedActive = 'delete';
    else if (p.startsWith('/user')) derivedActive = 'account';
    else if (p.startsWith('/bookings')) derivedActive = 'bookings';
    else if (p === '/' || p === '') derivedActive = 'home';
  }

  if (renderUserStyle) {
    return (
      <div className="w-full lg:w-1/4 mb-6 lg:mb-0">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Xin chào bạn!</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col">
            {items.map((item) => (
              <Link
                key={item.id || item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-6 py-4 transform transition-all duration-200 ease-in-out 
                  ${derivedActive === item.id
                    ? 'border-l-4 border-green-500 text-green-600 bg-green-50' 
                    : 'text-gray-600 border-l-4 border-transparent hover:border-green-500 hover:bg-green-50 hover:text-green-600'
                  }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center space-x-3 px-6 py-4 text-red-500 hover:bg-red-50 mt-2 border-t border-gray-100 transition-colors w-full text-left"
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

  return (
    <aside className="w-64 bg-white border-r hidden md:block">
      <div className="p-4">
        <h4 className="font-semibold mb-4">Menu</h4>
        <nav className="flex flex-col space-y-1">
          {items.map((item) => (
            <Link
              key={item.id || item.to}
              to={item.to}
              className={`group flex items-center space-x-3 px-4 py-3 transition-colors duration-200 transform ${
                derivedActive === item.id
                  ? 'border-l-4 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 border-l-4 border-transparent hover:translate-x-1'
              }`}
            >
              <span className="flex-shrink-0">
                {cloneElement(item.icon, {
                  className: derivedActive === item.id ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600',
                })}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
