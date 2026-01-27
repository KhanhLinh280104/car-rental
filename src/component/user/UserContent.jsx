import React, { useState } from 'react';
import { Edit2, ShieldCheck, AlertCircle, Plus, CreditCard, Car, Gift, ExternalLink, Link } from 'lucide-react';

// --- PHẦN 1: MOCK DATA (Dữ liệu giả lập) ---
// Sau này BackEnd trả về API, bạn chỉ cần map vào object này là xong
const USER_DATA = {
  name: "Trương Quốc Lập",
  joinDate: "25/01/2026",
  points: 0,
  trips: 0,
  email: "truongquoclap@gmail.com",
  phone: "Chưa xác thực",
  dob: "--/--/----",
  gender: "Nam",
  avatarKey: "T", // Chữ cái hiển thị trên avatar
  facebook: "Thêm liên kết",
  google: "Trương Quốc Lập"
};

const UserContent = () => {
  // State để chuyển tab "Tự lái" và "Có tài xế"
  const [activeTab, setActiveTab] = useState('self-driving'); // 'self-driving' | 'with-driver'

  return (
    <div className="w-full lg:w-3/4 lg:pl-8 space-y-6">
      
      {/* --- KHỐI 1: THÔNG TIN TÀI KHOẢN --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            Thông tin tài khoản 
            <Edit2 size={16} className="ml-2 text-gray-400 cursor-pointer hover:text-green-600" />
          </h3>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1">
             💰 {USER_DATA.trips} chuyến
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Cột trái: Avatar & Tên */}
            <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 pr-0 md:pr-6">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg">
                  {USER_DATA.avatarKey}
                </div>
                <h4 className="text-lg font-bold text-gray-900 text-center">{USER_DATA.name}</h4>
                <p className="text-xs text-gray-400 mt-1">Tham gia: {USER_DATA.joinDate}</p>
                 <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold mt-3 shadow-sm">
                  ⭐ {USER_DATA.points} điểm
                </span>
            </div>

            {/* Cột phải: Chi tiết thông tin */}
            <div className="md:w-2/3 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ngày sinh</label>
                    <p className="font-medium text-gray-700 mt-1">{USER_DATA.dob}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Giới tính</label>
                    <p className="font-medium text-gray-700 mt-1">{USER_DATA.gender}</p>
                  </div>
                </div>

                <div>
                   <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Số điện thoại</label>
                   <div className="flex justify-between items-center mt-1">
                     <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold">{USER_DATA.phone}</span>
                     <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                        Thêm số điện thoại <Edit2 size={12} className="ml-1"/>
                     </button>
                   </div>
                </div>

                <div>
                   <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email</label>
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mt-1 border border-gray-100">
                     <span className="truncate text-sm font-medium text-gray-700">{USER_DATA.email}</span>
                     <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-2">Đã xác thực</span>
                   </div>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Facebook</span>
                        <button className="text-blue-600 text-sm hover:underline flex items-center">
                            {USER_DATA.facebook} <ExternalLink size={12} className="ml-1"/>
                        </button>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Google</span>
                        <span className="text-gray-800 text-sm font-medium flex items-center">
                            {USER_DATA.google} <Link size={12} className="ml-1 text-gray-400"/>
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- KHỐI 2: GIẤY PHÉP LÁI XE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">Giấy phép lái xe</h3>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">Chưa xác thực</span>
            </div>
            <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center">
                Chỉnh sửa <Edit2 size={14} className="ml-2"/>
            </button>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700 leading-relaxed">
            Khách thuê cần xác thực GPLX <strong>chính chủ</strong> đồng thời phải là người <strong>trực tiếp</strong> làm thủ tục khi nhận xe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 transition hover:border-green-400 group">
                <span className="text-sm font-medium group-hover:text-green-600">Ảnh mặt trước GPLX</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 transition hover:border-green-400 group">
                <span className="text-sm font-medium group-hover:text-green-600">Thông tin chung</span>
            </div>
        </div>
      </div>

      {/* --- KHỐI 3: GIỚI THIỆU BẠN MỚI --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start">
            <div className="w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Giới thiệu bạn mới</h3>
                <p className="text-gray-500 text-sm mb-4">Nhận quà hấp dẫn khi giới thiệu bạn bè sử dụng dịch vụ.</p>
                
                <div className="w-full h-48 bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl flex items-center justify-between px-6 md:px-10 relative overflow-hidden border border-green-50">
                    <div className="z-10 relative">
                        <h4 className="text-green-800 font-extrabold text-xl md:text-2xl leading-tight mb-4">
                            CHƯƠNG TRÌNH<br/>GIỚI THIỆU CAR RENTAL<br/>ĐẾN BẠN BÈ
                        </h4>
                        <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-green-700 hover:shadow-xl transition transform hover:-translate-y-0.5">
                            Tham gia ngay
                        </button>
                    </div>
                    {/* Icon trang trí */}
                    <Gift size={120} className="text-green-300 opacity-60 absolute right-4 -bottom-4 rotate-12" />
                </div>
            </div>
        </div>
      </div>

      {/* --- KHỐI 4: THẺ THANH TOÁN --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Thẻ thanh toán</h3>
            <button className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                <Plus size={16} />
                <span>Thêm thẻ</span>
            </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-12 bg-white rounded flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                <CreditCard size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Bạn chưa có thẻ nào</p>
        </div>
      </div>

      {/* --- KHỐI 5: DANH SÁCH XE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4 sm:border-0 sm:pb-0">
            <h3 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">Danh sách xe</h3>
            
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('with-driver')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition duration-200 ${
                        activeTab === 'with-driver' 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Có tài xế
                </button>
                <button 
                    onClick={() => setActiveTab('self-driving')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition duration-200 ${
                        activeTab === 'self-driving' 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Tự lái
                </button>
            </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Car size={40} className="text-blue-300" />
            </div>
            <p className="text-gray-500 font-medium">Không tìm thấy xe nào.</p>
        </div>
      </div>

    </div>
  );
};

export default UserContent;