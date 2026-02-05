import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNotification } from "../context/NotificationContext"; // 1. Import

const ChangePasswordContent = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // 2. Lấy hàm thông báo
  const { notifySuccess, notifyError } = useNotification();

  const togglePasswordVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      notifyError('Mật khẩu xác nhận không khớp!'); // 3. Thay Swal bằng notifyError
      return;
    }
    if (formData.newPassword.length < 6) {
      notifyError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

      if (!token) {
        notifyError('Bạn chưa đăng nhập!');
        return;
      }

      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        // 4. Thay Swal bằng notifySuccess
        notifySuccess('Đổi mật khẩu thành công!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || JSON.stringify(errorJson);
        } catch (e) {}
        
        notifyError(errorMessage || 'Mật khẩu cũ không đúng');
      }

    } catch (error) {
      notifyError('Không thể kết nối đến Server (8080)');
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- PHẦN GIAO DIỆN GIỮ NGUYÊN ---
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <div className="relative">
            <input type={showPassword.current ? "text" : "password"} name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nhập mật khẩu cũ..." required />
            <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <div className="relative">
            <input type={showPassword.new ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Tối thiểu 6 ký tự..." required />
            <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
          <div className="relative">
            <input type={showPassword.confirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nhập lại mật khẩu mới..." required />
            <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordContent;