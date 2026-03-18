import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Swal from 'sweetalert2';

// --- MOCK DATA: CONFIGURATION ---
const MOCK_CONFIG = {
  security: { lockoutLimit: 5, sessionTimeout: 15, passwordExpiry: 90 },
  ai: { recommendation: false, damageDetection: true },
  pricing: { baseRate: 100, weekendRate: 20, holidayRate: 50 }
};

const AdminSettings = () => {
  const [config, setConfig] = useState(MOCK_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  // Hàm xử lý lưu
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      
      // Popup 
      Swal.fire({
        icon: 'success',
        title: 'Lưu thành công!',
        text: 'Cấu hình hệ thống đã được cập nhật.',
        showConfirmButton: false, // Ẩn nút OK đi cho gọn
        timer: 1500 // Tự tắt sau 1.5 giây
      });
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Cấu hình hệ thống</h2>
        
        {/* SỬA 1: Gắn sự kiện onClick và disabled vào nút Lưu */}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition
            ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
        >
          <Save size={18} /> 
          {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>

      {/* 1. Security Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Bảo mật (Security Policy)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Policy (lần sai tối đa)</label>
            {/* SỬA 2: Dùng value và onChange để cập nhật state */}
            <input 
              type="number" 
              value={config.security.lockoutLimit}
              onChange={(e) => setConfig({...config, security: {...config.security, lockoutLimit: e.target.value}})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (phút)</label>
             <input 
               type="number" 
               value={config.security.sessionTimeout} 
               onChange={(e) => setConfig({...config, security: {...config.security, sessionTimeout: e.target.value}})}
               className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
             />
          </div>
        </div>
      </div>

      {/* 2. AI Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cấu hình AI</h3>
        <div className="space-y-4">
           {/* Checkbox toggle */}
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">AI Recommendation Engine</p>
                <p className="text-sm text-gray-500">Tự động đề xuất xe dựa trên hành vi khách hàng</p>
              </div>
              <input 
                type="checkbox" 
                checked={config.ai.recommendation} 
                onChange={(e) => setConfig({...config, ai: {...config.ai, recommendation: e.target.checked}})}
                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
              />
           </div>

           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">AI Damage Inspection</p>
                <p className="text-sm text-gray-500">Tự động phát hiện hư hại qua ảnh chụp camera</p>
              </div>
              <input 
                type="checkbox" 
                checked={config.ai.damageDetection} 
                onChange={(e) => setConfig({...config, ai: {...config.ai, damageDetection: e.target.checked}})}
                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
              />
           </div>
        </div>
      </div>

      {/* 3. Pricing Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Thiết lập giá (Pricing Tiers)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
              <p className="font-bold text-gray-700">Giá cơ bản</p>
              <input type="text" value={config.pricing.baseRate + "%"} className="w-full mt-2 border p-2 rounded bg-white text-gray-500 cursor-not-allowed" disabled />
           </div>
           <div className="border border-gray-200 p-4 rounded-lg">
              <p className="font-bold text-gray-700">Tăng giá cuối tuần (+%)</p>
              <input 
                type="number" 
                value={config.pricing.weekendRate} 
                onChange={(e) => setConfig({...config, pricing: {...config.pricing, weekendRate: e.target.value}})}
                className="w-full mt-2 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
           </div>
           <div className="border border-gray-200 p-4 rounded-lg">
              <p className="font-bold text-gray-700">Tăng giá ngày lễ (+%)</p>
              <input 
                type="number" 
                value={config.pricing.holidayRate} 
                onChange={(e) => setConfig({...config, pricing: {...config.pricing, holidayRate: e.target.value}})}
                className="w-full mt-2 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;