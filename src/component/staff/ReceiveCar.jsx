import React, { useState, useEffect, useRef } from 'react';
import {
  Car, User, Calendar, FileText, CheckCircle, ArrowLeft,
  Camera, Phone, Clock, X, ChevronRight, ChevronLeft,
  Gauge, Fuel, AlertTriangle, Sparkles, DollarSign, ScanLine
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data — sau này thay bằng API
const MOCK_BOOKINGS = {
  "2": {
    id: "2",
    customer: { name: "Trần Thị B", phone: "0987654321" },
    vehicle: { name: "Honda Civic", plate: "XYZ-789", color: "Đen" },
    driver: { name: "Tài xế Minh" },
    start: "2024-01-28",
    end: "2024-02-02",
    total: 2800000,
    deposit: 3000000,
    handover: { mileage: 22350, fuelLevel: 85 },
  },
  "4": {
    id: "4",
    customer: { name: "Phạm Thị D", phone: "0944222333" },
    vehicle: { name: "VinFast VF8", plate: "VF-888", color: "Xanh" },
    driver: { name: "Tài xế Hùng" },
    start: "2024-02-04",
    end: "2024-02-08",
    total: 4200000,
    deposit: 5000000,
    handover: { mileage: 8200, fuelLevel: 100 },
  },
  "5": {
    id: "5",
    customer: { name: "Hoàng Minh E", phone: "0955333444" },
    vehicle: { name: "Toyota Vios", plate: "TV-321", color: "Trắng" },
    driver: null,
    start: "2024-02-02",
    end: "2024-02-05",
    total: 2100000,
    deposit: 3000000,
    handover: { mileage: 45000, fuelLevel: 100 },
  },
};

const STEPS = [
  { key: "mileage", label: "Số KM & Nhiên liệu" },
  { key: "condition", label: "Tình trạng xe" },
  { key: "photos", label: "Chụp ảnh xe" },
  { key: "ai", label: "Phân tích AI" },
  { key: "confirm", label: "Xác nhận nhận xe" },
];

const ReceiveCar = () => {
  const { notifySuccess, notifyConfirm, notifyError } = useNotification();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Step 1 — Số KM & Nhiên liệu
  const [returnMileage, setReturnMileage] = useState('');
  const [returnFuelLevel, setReturnFuelLevel] = useState('100');

  // Step 2 — Tình trạng xe
  const [condition, setCondition] = useState({
    exteriorOk: false,
    interiorOk: false,
    hasDamage: false,
    damageNotes: '',
  });

  // Step 3 — Ảnh xe
  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const fileInputRef = useRef(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState(null);

  // Step 4 — AI Scan
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null); // null = chưa scan
  const [selectedAiPhoto, setSelectedAiPhoto] = useState('front');
  const [extraFeeOverride, setExtraFeeOverride] = useState('');

  // Step 5 — Xác nhận
  const [staffConfirmed, setStaffConfirmed] = useState(false);

  useEffect(() => {
    const data = MOCK_BOOKINGS[bookingId];
    if (data) setBooking(data);
    setLoading(false);
  }, [bookingId]);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Đang tải...</div>;

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Không tìm thấy đơn đặt xe #{bookingId}</p>
        <button onClick={() => navigate('/staff/receive-car')} className="text-blue-600 underline">Quay lại danh sách</button>
      </div>
    );
  }

  const kmDiff = returnMileage ? Number(returnMileage) - booking.handover.mileage : 0;
  const fuelDiff = Number(returnFuelLevel) - booking.handover.fuelLevel;

  const canGoNext = () => {
    if (step === 0) return returnMileage && Number(returnMileage) >= booking.handover.mileage;
    if (step === 1) return condition.exteriorOk && condition.interiorOk;
    if (step === 2) return photos.front && photos.back && photos.left && photos.right;
    if (step === 3) return aiResult !== null; // phải đã chạy AI xong
    if (step === 4) return staffConfirmed;
    return false;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && activePhotoSlot) {
      setPhotos(prev => ({ ...prev, [activePhotoSlot]: file }));
    }
    setActivePhotoSlot(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFileForSlot = (slot) => {
    setActivePhotoSlot(slot);
    fileInputRef.current?.click();
  };

  const removePhoto = (slot) => setPhotos(prev => ({ ...prev, [slot]: null }));

  const handleRunAI = () => {
    setIsAnalyzing(true);
    setAiResult(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResult({
        hasDamage: true,
        issues: [
          { type: 'Vết xước (Scratch)', location: 'Cản trước bên trái', confidence: '98%', feeRaw: 500000, fee: '500.000 ₫' },
          { type: 'Móp nhẹ (Dent)', location: 'Cửa sau bên phải', confidence: '85%', feeRaw: 1200000, fee: '1.200.000 ₫' },
        ],
        totalFeeRaw: 1700000,
        totalFee: '1.700.000 ₫',
      });
      notifySuccess("AI đã phân tích xong hình ảnh!");
    }, 3000);
  };

  const handleFinalConfirm = () => {
    const extra = extraFeeOverride !== '' ? Number(extraFeeOverride) : (aiResult?.totalFeeRaw ?? 0);
    notifyConfirm(
      "Xác nhận nhận xe?",
      `Nhận xe ${booking.vehicle.name} (${booking.vehicle.plate}) từ ${booking.customer.name}. KM trả: ${Number(returnMileage).toLocaleString()}. Phụ thu: ${extra.toLocaleString()} ₫.`,
      () => {
        notifySuccess("Đã nhận xe thành công!", () => {
          navigate('/staff/receive-car');
        });
      }
    );
  };

  // ========== RENDER STEPS ==========

  const renderStepMileage = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Kiểm tra Số KM & Nhiên liệu</h3>
      <p className="text-sm text-gray-500">So sánh với thông tin lúc giao xe để tính toán chi phí phát sinh (nếu có).</p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-sm">
        <p className="font-semibold text-blue-700">Thông tin lúc giao xe:</p>
        <div className="flex gap-6">
          <p className="flex items-center gap-2"><Gauge size={14} /> Số KM: <strong>{booking.handover.mileage.toLocaleString()} km</strong></p>
          <p className="flex items-center gap-2"><Fuel size={14} /> Nhiên liệu: <strong>{booking.handover.fuelLevel}%</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Số KM lúc trả *</label>
          <input type="number" value={returnMileage}
            onChange={(e) => setReturnMileage(e.target.value)}
            placeholder={`≥ ${booking.handover.mileage}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
          {returnMileage && (
            <p className="text-xs mt-1 text-gray-500">Đã đi: <strong className="text-gray-700">{kmDiff.toLocaleString()} km</strong></p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nhiên liệu lúc trả (%) *</label>
          <select value={returnFuelLevel}
            onChange={(e) => setReturnFuelLevel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="100">100% (Đầy)</option>
            <option value="75">75% (3/4)</option>
            <option value="50">50% (1/2)</option>
            <option value="25">25% (1/4)</option>
          </select>
          {fuelDiff !== 0 && (
            <p className={`text-xs mt-1 ${fuelDiff < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {fuelDiff < 0 ? `Thiếu ${Math.abs(fuelDiff)}% so với lúc giao` : `Nhiều hơn ${fuelDiff}%`}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepCondition = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Kiểm tra tình trạng xe</h3>
      <p className="text-sm text-gray-500">Xác nhận tình trạng ngoại thất, nội thất và ghi nhận hư hại (nếu có).</p>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition">
          <input type="checkbox" checked={condition.exteriorOk}
            onChange={(e) => setCondition({ ...condition, exteriorOk: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Ngoại thất đã kiểm tra</p>
            <p className="text-xs text-gray-500">Kiểm tra xước, móp, vỡ, sơn bong tróc</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition">
          <input type="checkbox" checked={condition.interiorOk}
            onChange={(e) => setCondition({ ...condition, interiorOk: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Nội thất đã kiểm tra</p>
            <p className="text-xs text-gray-500">Ghế, điều hoà, màn hình, âm thanh</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-red-200 cursor-pointer hover:bg-red-50 transition">
          <input type="checkbox" checked={condition.hasDamage}
            onChange={(e) => setCondition({ ...condition, hasDamage: e.target.checked })}
            className="w-5 h-5 text-red-600 rounded" />
          <div>
            <p className="font-medium text-red-700 flex items-center gap-1"><AlertTriangle size={14} /> Có hư hại / sự cố</p>
            <p className="text-xs text-gray-500">Đánh dấu nếu phát hiện hư hại mới</p>
          </div>
        </label>
      </div>

      {condition.hasDamage && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết hư hại</label>
          <textarea rows="4" value={condition.damageNotes}
            onChange={(e) => setCondition({ ...condition, damageNotes: e.target.value })}
            placeholder="VD: Xước cản trước bên phải dài 15cm, móp nhẹ cửa sau bên trái..."
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none bg-red-50" />
        </div>
      )}
    </div>
  );

  const renderStepPhotos = () => {
    const slots = [
      { key: 'front', label: 'Mặt trước' },
      { key: 'back', label: 'Mặt sau' },
      { key: 'left', label: 'Bên trái' },
      { key: 'right', label: 'Bên phải' },
    ];
    return (
      <div className="space-y-5">
        <h3 className="font-bold text-lg text-gray-800">Chụp ảnh xe lúc trả (4 góc)</h3>
        <p className="text-sm text-gray-500">Chụp rõ 4 góc xe. Ảnh này sẽ được AI phân tích hư hại ở bước tiếp theo.</p>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

        <div className="grid grid-cols-2 gap-4">
          {slots.map(slot => (
            <div key={slot.key}>
              {photos[slot.key] ? (
                <div className="relative group">
                  <img src={URL.createObjectURL(photos[slot.key])} alt={slot.label}
                    className="w-full h-40 object-cover rounded-xl border-2 border-green-400" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition">
                    <button onClick={() => removePhoto(slot.key)} className="bg-white p-2 rounded-full shadow hover:bg-red-50">
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} /> {slot.label}
                  </span>
                </div>
              ) : (
                <button onClick={() => openFileForSlot(slot.key)}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-purple-400 transition">
                  <Camera size={28} className="mb-1" />
                  <span className="text-sm font-medium">{slot.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepAI = () => {
    const photoSlots = ['front', 'back', 'left', 'right'];
    const slotLabels = { front: 'Mặt trước', back: 'Mặt sau', left: 'Bên trái', right: 'Bên phải' };

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Phân tích AI</h3>
            <p className="text-sm text-gray-500">Chọn ảnh và nhấn phân tích để AI tự động phát hiện hư hại.</p>
          </div>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Sparkles size={14} /> Powered by AI
          </span>
        </div>

        {/* Thumbnail selector */}
        <div className="flex gap-2">
          {photoSlots.map(slot => (
            <button key={slot} onClick={() => setSelectedAiPhoto(slot)}
              className={`relative rounded-lg overflow-hidden border-2 transition ${selectedAiPhoto === slot ? 'border-purple-500' : 'border-gray-200'}`}
              style={{ width: 64, height: 48 }}>
              <img src={URL.createObjectURL(photos[slot])} alt={slotLabels[slot]}
                className="w-full h-full object-cover" />
              {selectedAiPhoto === slot && (
                <div className="absolute inset-0 bg-purple-500/20" />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Image panel */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{slotLabels[selectedAiPhoto]}</p>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900" style={{ minHeight: 220 }}>
              <img
                src={URL.createObjectURL(photos[selectedAiPhoto])}
                alt="scan target"
                className="w-full h-full object-cover opacity-80"
                style={{ minHeight: 220 }}
              />

              {/* Scanning line animation */}
              {isAnalyzing && (
                <div className="absolute left-0 right-0 h-0.5 bg-purple-400 shadow-[0_0_12px_4px_rgba(168,85,247,0.7)]"
                  style={{ animation: 'aiScan 1.8s ease-in-out infinite', top: 0 }} />
              )}

              {/* AI bounding boxes after scan */}
              {aiResult?.hasDamage && selectedAiPhoto === 'front' && (
                <>
                  <div className="absolute border-2 border-red-400 bg-red-400/10 rounded"
                    style={{ top: '28%', left: '15%', width: 72, height: 60 }}>
                    <span className="absolute -top-5 left-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                      Xước 98%
                    </span>
                  </div>
                </>
              )}
              {aiResult?.hasDamage && selectedAiPhoto === 'back' && (
                <div className="absolute border-2 border-orange-400 bg-orange-400/10 rounded"
                  style={{ top: '48%', right: '12%', width: 80, height: 65 }}>
                  <span className="absolute -top-5 left-0 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                    Móp 85%
                  </span>
                </div>
              )}

              {!isAnalyzing && !aiResult && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400 text-sm bg-black/40 px-3 py-1.5 rounded-full">Nhấn phân tích để bắt đầu</p>
                </div>
              )}
            </div>

            <button onClick={handleRunAI} disabled={isAnalyzing}
              className={`w-full py-3 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition shadow-lg
                ${isAnalyzing
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200'
                }`}>
              {isAnalyzing ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> AI đang quét...</>
              ) : (
                <><ScanLine size={18} /> {aiResult ? 'Quét lại' : 'Bắt đầu Phân tích AI'}</>
              )}
            </button>
          </div>

          {/* Results panel */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kết quả</p>

            {!aiResult && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-10 border border-dashed rounded-xl">
                <Sparkles size={36} className="mb-2" />
                <p className="text-sm">Chờ AI phân tích...</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-purple-600 py-10 border border-purple-100 rounded-xl bg-purple-50">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
                <p className="font-medium text-sm animate-pulse">Đang dùng Computer Vision...</p>
              </div>
            )}

            {aiResult && (
              <div className="space-y-3">
                {aiResult.hasDamage ? (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="flex items-center gap-2 text-red-700 font-bold mb-3 text-sm">
                        <AlertTriangle size={16} /> AI phát hiện {aiResult.issues.length} vấn đề
                      </p>
                      <div className="space-y-2">
                        {aiResult.issues.map((issue, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-red-100 text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="font-semibold text-gray-800">{issue.type}</span>
                              <span className="text-red-600 font-bold">{issue.fee}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{issue.location}</span>
                              <span>Độ chính xác: {issue.confidence}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-red-200 flex justify-between font-bold">
                        <span className="text-gray-700">Dự kiến phụ thu:</span>
                        <span className="text-red-600">{aiResult.totalFee}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                        <DollarSign size={13} /> Phụ thu thực tế (có thể chỉnh)
                      </label>
                      <input type="number" value={extraFeeOverride !== '' ? extraFeeOverride : aiResult.totalFeeRaw}
                        onChange={(e) => setExtraFeeOverride(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none text-sm" />
                    </div>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-bold">Không phát hiện hư hại!</p>
                    <p className="text-green-600 text-sm mt-1">Xe trả trong tình trạng tốt.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes aiScan {
            0%   { top: 0%; }
            50%  { top: calc(100% - 2px); }
            100% { top: 0%; }
          }
        `}} />
      </div>
    );
  };

  const renderStepConfirm = () => {
    const extraFee = extraFeeOverride !== '' ? Number(extraFeeOverride) : (aiResult?.totalFeeRaw ?? 0);
    return (
      <div className="space-y-5">
        <h3 className="font-bold text-lg text-gray-800">Xác nhận nhận xe</h3>
        <p className="text-sm text-gray-500">Kiểm tra lại tổng quan trước khi hoàn tất.</p>

        <div className="bg-gray-50 rounded-xl p-5 space-y-4 border text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500">Khách hàng</p>
              <p className="font-semibold">{booking.customer.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Xe</p>
              <p className="font-semibold">{booking.vehicle.name} — {booking.vehicle.plate}</p>
            </div>
            <div>
              <p className="text-gray-500">KM giao → trả</p>
              <p className="font-semibold">{booking.handover.mileage.toLocaleString()} → {Number(returnMileage).toLocaleString()} km</p>
              <p className="text-xs text-gray-400">Đã đi: {kmDiff.toLocaleString()} km</p>
            </div>
            <div>
              <p className="text-gray-500">Nhiên liệu giao → trả</p>
              <p className="font-semibold">{booking.handover.fuelLevel}% → {returnFuelLevel}%</p>
              {fuelDiff < 0 && <p className="text-xs text-red-500">Thiếu {Math.abs(fuelDiff)}%</p>}
            </div>
          </div>

          {/* AI result summary */}
          {aiResult && (
            <div className={`rounded-xl p-4 border ${aiResult.hasDamage ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Sparkles size={14} className={aiResult.hasDamage ? 'text-red-600' : 'text-green-600'} />
                <span className={aiResult.hasDamage ? 'text-red-700' : 'text-green-700'}>
                  Kết quả AI: {aiResult.hasDamage ? `Phát hiện ${aiResult.issues.length} hư hại` : 'Không có hư hại'}
                </span>
              </p>
              {aiResult.hasDamage && (
                <div className="flex justify-between items-center font-bold text-sm mt-1">
                  <span className="text-gray-700">Phụ thu:</span>
                  <span className="text-red-600">{extraFee.toLocaleString()} ₫</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {Object.entries(photos).map(([key, file]) => file && (
              <img key={key} src={URL.createObjectURL(file)} alt={key}
                className="w-16 h-16 object-cover rounded-lg border" />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50 cursor-pointer">
          <input type="checkbox" checked={staffConfirmed} onChange={(e) => setStaffConfirmed(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Xác nhận đã kiểm tra xe và nhận xe từ khách</p>
            <p className="text-xs text-gray-500">Staff xác nhận hoàn tất quy trình nhận xe và kiểm tra tình trạng</p>
          </div>
        </label>
      </div>
    );
  };

  const stepRenderers = [renderStepMileage, renderStepCondition, renderStepPhotos, renderStepAI, renderStepConfirm];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/staff/receive-car')}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nhận và kiểm tra xe</h2>
          <p className="text-sm text-gray-500">Đơn #{booking.id} — {booking.vehicle.name} ({booking.vehicle.plate})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar info */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-purple-600" /> Thông tin đơn
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex items-center gap-2"><User size={14} /> {booking.customer.name}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {booking.customer.phone}</p>
              <p className="flex items-center gap-2"><Car size={14} /> {booking.vehicle.name}</p>
              <p className="text-purple-600 font-semibold bg-purple-50 border border-purple-100 w-fit px-2 py-0.5 rounded">
                {booking.vehicle.plate}
              </p>
              <p className="flex items-center gap-2"><Calendar size={14} /> {booking.start} → {booking.end}</p>
              <p className="flex items-center gap-2"><Clock size={14} /> {booking.driver ? `Tài xế: ${booking.driver.name}` : 'Tự lái'}</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Quy trình</h3>
            <div className="space-y-1">
              {STEPS.map((s, i) => (
                <div key={s.key}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition
                    ${i === step ? 'bg-purple-50 text-purple-700 font-semibold' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0
                    ${i === step ? 'border-purple-500 bg-purple-500 text-white' : i < step ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {s.label}
                  {s.key === 'ai' && (
                    <Sparkles size={11} className={i <= step ? 'text-purple-400' : 'text-gray-300'} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[420px] flex flex-col">
            <div className="flex-1">
              {stepRenderers[step]()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t">
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-medium transition
                  ${step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ChevronLeft size={18} /> Quay lại
              </button>

              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()}
                  className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-medium transition
                    ${canGoNext() ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Tiếp theo <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleFinalConfirm} disabled={!canGoNext()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition shadow-lg
                    ${canGoNext() ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  <CheckCircle size={18} /> Xác nhận Nhận Xe
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveCar;
