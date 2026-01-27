import React from 'react';

const ChangePasswordContent = () => {
  return (
    <div className="w-full lg:w-3/4 lg:pl-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">Đổi mật khẩu</h3>
        <p className="text-sm text-gray-500 mb-6">Vui lòng nhập mật khẩu hiện tại để thay đổi mật khẩu mới.</p>

        <form className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nhập mật khẩu cũ" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nhập mật khẩu mới" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
            <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nhập lại mật khẩu mới" />
          </div>

          <div className="pt-2">
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordContent;