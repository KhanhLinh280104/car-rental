import React, { useState } from 'react';
import { Camera, Sparkles, CheckCircle, AlertTriangle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingById } from './mockBookings';

const ReturnCarAI = () => {
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const booking = getBookingById(bookingId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(false);

  const handleUploadClick = () => {
    setUploadedImage(true);
  };

  const handleAnalyzeAI = () => {
    if (!uploadedImage) {
      notifyError("Vui lòng tải ảnh lên trước khi phân tích!");
      return;
    }
    
    setIsAnalyzing(true);
    setAiResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResult({
        hasDamage: true,
        issues: [
          { type: 'Vết xước (Scratch)', location: 'Cản trước bên trái', confidence: '98%', fee: '500.000 đ' },
          { type: 'Móp nhẹ (Dent)', location: 'Cửa sau bên phải', confidence: '85%', fee: '1.200.000 đ' }
        ],
        totalExtraFee: '1.700.000 đ'
      });
      notifySuccess("AI đã phân tích xong hình ảnh!");
    }, 3000);
  };

  const handleComplete = () => {
    notifySuccess("Đã hoàn tất thủ tục thu hồi xe!", () => {
      navigate(`/staff/payment/${bookingId}`);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/staff/booking')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Kiểm tra xe Trả (AI Scan)</h2>
            {booking && (
              <p className="text-sm text-gray-500 mt-0.5">
                Đơn #{booking.id} • {booking.vehicle.name} • {booking.vehicle.plate}
              </p>
            )}
          </div>
        </div>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Sparkles size={16} /> Powered by AI
        </span>
      </div>

      {!booking ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 font-semibold">Không tìm thấy đơn đặt.</p>
          <p className="text-gray-500 text-sm mt-1">Vui lòng quay lại danh sách Đơn đặt và chọn lại.</p>
          <div className="mt-4">
            <button onClick={() => navigate('/staff/booking')} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition">
              Về Đơn đặt
            </button>
          </div>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Camera size={18} className="text-gray-600"/> Ảnh chụp xe lúc trả
          </h3>
          
          {!uploadedImage ? (
            <div onClick={handleUploadClick} className="flex-1 min-h-[250px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition">
              <ImageIcon size={40} className="mb-3 text-gray-400" />
              <p className="font-medium text-gray-700">Tải ảnh xe lên đây</p>
              <p className="text-sm mt-1">Hỗ trợ định dạng JPG, PNG</p>
            </div>
          ) : (
            <div className="relative flex-1 min-h-[250px] rounded-xl overflow-hidden border border-gray-200 bg-gray-900 group">
              <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Car uploaded" className="w-full h-full object-cover opacity-80" />
              
              {isAnalyzing && (
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_5px_rgba(168,85,247,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
              )}

              {aiResult && aiResult.hasDamage && (
                <>
                  <div className="absolute top-[30%] left-[20%] w-16 h-16 border-2 border-red-500 bg-red-500/20 rounded-md animate-pulse">
                    <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">Xước 98%</span>
                  </div>
                  <div className="absolute top-[50%] right-[15%] w-20 h-20 border-2 border-orange-500 bg-orange-500/20 rounded-md animate-pulse">
                    <span className="absolute -top-6 left-0 bg-orange-500 text-white text-xs px-1 rounded">Móp 85%</span>
                  </div>
                </>
              )}
            </div>
          )}

          <button onClick={handleAnalyzeAI} disabled={isAnalyzing} className={`mt-4 w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2 ${isAnalyzing ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200'}`}>
            <Sparkles size={20} /> 
            {isAnalyzing ? 'AI Đang quét chi tiết...' : 'Bắt đầu Phân tích AI'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="font-bold text-gray-800 mb-4">Kết quả kiểm tra</h3>

          {!aiResult && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Sparkles size={48} className="mb-3 opacity-50" />
              <p>Chờ AI phân tích hình ảnh...</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-purple-600">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
              <p className="font-medium animate-pulse">Đang dùng Computer Vision phân tích...</p>
            </div>
          )}

          {aiResult && (
            <div className="flex-1 space-y-4 animate-fade-in">
              {aiResult.hasDamage ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="flex items-center gap-2 text-red-700 font-bold mb-3">
                    <AlertTriangle size={20} /> AI Phát hiện vấn đề!
                  </h4>
                  <ul className="space-y-3">
                    {aiResult.issues.map((issue, idx) => (
                      <li key={idx} className="bg-white p-3 rounded border border-red-100 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-gray-800">{issue.type}</span>
                          <span className="text-red-600 font-bold">{issue.fee}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Vị trí: {issue.location}</span>
                          <span>Độ chính xác: {issue.confidence}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-red-200 flex justify-between items-center font-bold text-lg">
                    <span className="text-gray-800">Dự kiến phụ thu:</span>
                    <span className="text-red-600">{aiResult.totalExtraFee}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                  <h4 className="text-green-700 font-bold text-lg">Hoàn hảo!</h4>
                  <p className="text-green-600 text-sm mt-1">AI không phát hiện hư hại nào.</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Số KM nhận về" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"/>
                  <input type="number" placeholder="Phụ thu thực tế" defaultValue={aiResult.hasDamage ? 1700000 : 0} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
                <button onClick={handleComplete} className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition shadow-lg">
                  Hoàn tất Thu Hồi Xe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
      </>
      )}
    </div>
  );
};

export default ReturnCarAI;