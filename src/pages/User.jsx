import React from 'react';
import { Edit2, AlertCircle, Plus, CreditCard, ExternalLink } from 'lucide-react';

const MOCK_USER = {
  id: "USR_LAPTQ",
  fullName: "Trương Quốc Lập",
  email: "truongquoclap.work@gmail.com",
  joinDate: "01/02/2026",
  phone: "Chưa xác thực",
  dob: "15/08/1998",
  gender: "Nam",
  avatarKey: "L",
  socials: { facebook: "Liên kết ngay", google: "Trương Quốc Lập" },
  stats: { trips: 0 }
};

const User = () => {
  return (
    <div className="space-y-6">
      {/* 1. THÔNG TIN TÀI KHOẢN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            Thông tin tài khoản 
            <Edit2 size={16} className="ml-2 text-gray-400 cursor-pointer hover:text-green-600" />
          </h3>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
             💰 {MOCK_USER.stats.trips} chuyến
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center justify-center md:w-1/3 border-r border-gray-100 pr-6">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg">
                  {MOCK_USER.avatarKey}
                </div>
                <h4 className="text-lg font-bold text-gray-900">{MOCK_USER.fullName}</h4>
                <p className="text-xs text-gray-400 mt-1">Tham gia: {MOCK_USER.joinDate}</p>
            </div>

            <div className="md:w-2/3 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ngày sinh</label>
                    <p className="font-medium text-gray-700 mt-1">{MOCK_USER.dob}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Giới tính</label>
                    <p className="font-medium text-gray-700 mt-1">{MOCK_USER.gender}</p>
                  </div>
                </div>
                <div>
                   <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email</label>
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mt-1 border border-gray-100">
                     <span className="truncate text-sm font-medium text-gray-700">{MOCK_USER.email}</span>
                     <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Đã xác thực</span>
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. GIẤY PHÉP LÁI XE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Giấy phép lái xe <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full ml-2">Chưa xác thực</span></h3>
            <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Chỉnh sửa</button>
        </div>
        <div className="grid grid-cols-2 gap-6 h-32">
            <div className="border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50 text-gray-400">Ảnh mặt trước</div>
            <div className="border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50 text-gray-400">Thông tin chung</div>
        </div>
      </div>
      
      {/* 3. THẺ THANH TOÁN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Thẻ thanh toán</h3>
            <button className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              <Plus size={16}/><span>Thêm thẻ</span>
            </button>
         </div>
         <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <CreditCard size={32} className="text-gray-300 mb-2"/>
            <p className="text-gray-400 text-sm">Chưa có thẻ nào</p>
         </div>
      </div>
    </div>
  );
};

export default User;