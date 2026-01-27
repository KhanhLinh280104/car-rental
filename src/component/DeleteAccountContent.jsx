import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteAccountContent = () => {
  return (
    <div className="w-full lg:w-3/4 lg:pl-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu xóa tài khoản</h3>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" />
            <div>
                <h4 className="font-bold text-red-700 mb-1">Cảnh báo quan trọng</h4>
                <p className="text-sm text-red-600 leading-relaxed">
                    Khi xóa tài khoản, toàn bộ thông tin cá nhân, lịch sử chuyến đi và điểm thưởng sẽ bị xóa vĩnh viễn và không thể khôi phục.
                </p>
            </div>
        </div>

        <form className="max-w-md space-y-4" onSubmit={(e) => e.preventDefault()}>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lý do xóa tài khoản</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none bg-white text-gray-700 focus:ring-2 focus:ring-red-200 transition">
                    <option>Tôi không còn nhu cầu sử dụng</option>
                    <option>Tôi muốn tạo tài khoản mới</option>
                    <option>Lo ngại về bảo mật</option>
                    <option>Khác</option>
                </select>
             </div>

             <div className="flex items-start gap-2 pt-2">
                 <input type="checkbox" id="confirm" className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer" />
                 <label htmlFor="confirm" className="text-sm text-gray-600 cursor-pointer select-none">Tôi cam kết chịu trách nhiệm về yêu cầu này và hiểu rằng hành động này không thể hoàn tác.</label>
             </div>

             <div className="pt-4">
                <button className="w-full bg-gray-100 text-gray-400 font-bold px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition duration-300">
                  Gửi yêu cầu xóa
                </button>
             </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountContent;