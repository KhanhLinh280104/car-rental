import { useState, cloneElement } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IdCard, User, Lock, Trash2, LogOut, Home, Users, FileText, Drill, Car } from "lucide-react";
import LogoutModal from "./LogoutModal";

export default function Sidebar({ role = "user", active = "", sidebarType = "role" }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/");
  };

  const menus = {
    user: [
      { to: "/", label: "Trang chủ", icon: <Home size={18} /> },
      { to: "/user", label: "Thông tin cá nhân", icon: <User size={18} /> },
      {to: "/user/change-password", label: "Đổi mật khẩu", icon: <User size={18} /> },
      {to: "/user/delete-account", label: "Xóa tài khoản", icon: <Trash2 size={18} /> },
    ],
    staff: [
      { id: 'home', to: "/staff", label: "Trang chủ", icon: <Home size={18} /> },
      { id: 'bookings', to: "/staff/booking", label: "Đơn đặt", icon: <FileText size={18} /> },
      { id: 'account', to: "/staff/driver-list", label: "Danh sách tài xế", icon: <IdCard size={18} /> },
      { id: 'account', to: "/staff/vehicle-list", label: "Danh sách xe", icon: <Car size={18} /> },
    ],
    admin: [
      { id: 'home', to: "/", label: "Trang chủ", icon: <Home size={18} /> },
      { id: 'admin', to: "/admin", label: "Quản trị", icon: <Users size={18} /> },
      { id: 'users', to: "/manage/users", label: "Người dùng", icon: <Users size={18} /> },
      { id: 'profile', to: "/user", label: "Hồ sơ", icon: <User size={18} /> },
    ],
  };

  const items = menus[role] || menus.user;

  // derive whether to use the user-style sidebar: always render user style for all roles
  const renderStyle = true;

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

  if (renderStyle) {
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
                  ${derivedActive === (item.id || item.to)
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
                derivedActive === (item.id || item.to)
                  ? 'border-l-4 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 border-l-4 border-transparent hover:translate-x-1'
              }`}
            >
              <span className="flex-shrink-0">
                {cloneElement(item.icon, {
                  className: derivedActive === (item.id || item.to) ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600',
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
