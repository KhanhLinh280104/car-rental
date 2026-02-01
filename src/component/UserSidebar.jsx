import { useState } from 'react';
import { User, Lock, Trash2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

const UserSidebar = ({ active = 'account' }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Đã bấm đăng xuất!");
    setShowLogoutModal(false);
    navigate('/');
  };

  const menuItems = [
    { id: 'account', icon: <User size={20} />, label: 'Tài khoản của tôi', path: '/user' },
    { id: 'password', icon: <Lock size={20} />, label: 'Đổi mật khẩu', path: '/user/change-password' },
    { id: 'delete', icon: <Trash2 size={20} />, label: 'Yêu cầu xoá tài khoản', path: '/user/delete-account' },
  ];

  return (
    <div className="w-full lg:w-1/4 mb-6 lg:mb-0">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Xin chào bạn!</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-4 transition-colors duration-200 
                ${active === item.id
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
};

export default UserSidebar;
