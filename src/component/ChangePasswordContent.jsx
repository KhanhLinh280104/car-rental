import React, { useState } from 'react';
import Swal from 'sweetalert2'; 

const ChangePasswordContent = () => {
  // 1. State lưu dữ liệu nhập vào từ ô input
  const [formData, setFormData] = useState({
    currentPassword: '', // React gọi là currentPassword
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  // Hàm cập nhật state khi gõ phím
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. HÀM XỬ LÝ KHI BẤM NÚT "CẬP NHẬT"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Chặn web reload lại trang

    // --- BƯỚC 1: KIỂM TRA LỖI SƠ ĐẲNG (VALIDATION) ---
    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (formData.newPassword.length < 6) {
      Swal.fire('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    try {
      setLoading(true); // Bật trạng thái loading (làm mờ nút)

      // --- BƯỚC 2: LẤY TOKEN ---
      // Lấy token đã lưu lúc đăng nhập (thường tên là 'accessToken' hoặc 'token')
      // Bạn kiểm tra lại localStorage xem nhóm trưởng lưu tên gì nhé. Tôi để tạm là 'token'
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken'); 

      if (!token) {
        Swal.fire('Lỗi', 'Bạn chưa đăng nhập!', 'warning');
        return;
      }

      // --- BƯỚC 3: GỌI API (FETCH) ---
      // Đây là đoạn quan trọng nhất bạn thắc mắc
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'POST', // Trong Controller dùng @PostMapping nên ở đây là POST
        headers: {
          'Content-Type': 'application/json', // Báo cho server biết mình gửi JSON
          'Authorization': `Bearer ${token}`  // Gửi token đi kèm để chứng minh danh tính
        },
        // Chuyển đổi dữ liệu từ Javascript Object sang chuỗi JSON để gửi đi
        body: JSON.stringify({
          // Bên trái: Tên biến Backend yêu cầu (oldPassword)
          // Bên phải: Tên biến Frontend đang có (currentPassword)
          oldPassword: formData.currentPassword, 
          newPassword: formData.newPassword
        })
      });

      // --- BƯỚC 4: XỬ LÝ KẾT QUẢ TRẢ VỀ ---
      
      // Kiểm tra xem thành công (Status 200) hay thất bại
      if (response.ok) {
        // Vì Controller trả về String ("Đổi mật khẩu thành công!"), nên ta không dùng .json() mà dùng text nhưng thông báo luôn là được
        Swal.fire('Thành công', 'Đổi mật khẩu thành công!', 'success');
        
        // Reset form cho trắng
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        // Nếu thất bại (ví dụ sai mật khẩu cũ), server thường trả về lỗi 400 hoặc 403
        // Cố gắng đọc thông báo lỗi từ server (nếu có)
        try {
            // Backend có thể trả về JSON hoặc Text, ta thử đọc text trước
            const errorText = await response.text(); 
            // Nếu errorText là JSON thì parse, không thì hiển thị luôn
            let errorMessage = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || JSON.stringify(errorJson);
            } catch (e) {
                // Không phải JSON, giữ nguyên text
            }
            
            Swal.fire('Thất bại', errorMessage || 'Mật khẩu cũ không đúng', 'error');
        } catch (err) {
            Swal.fire('Thất bại', 'Có lỗi xảy ra phía Server', 'error');
        }
      }

    } catch (error) {
      // Lỗi mạng (ví dụ chưa bật Backend)
      Swal.fire('Lỗi kết nối', 'Không thể kết nối đến Server (8080)', 'error');
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ô nhập mật khẩu hiện tại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            name="currentPassword" // Phải khớp với state formData
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Nhập mật khẩu cũ..."
            required
          />
        </div>

        {/* Ô nhập mật khẩu mới */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Tối thiểu 6 ký tự..."
            required
          />
        </div>

        {/* Ô xác nhận mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Nhập lại mật khẩu mới..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordContent;