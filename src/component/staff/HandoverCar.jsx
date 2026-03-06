import React, { useState, useEffect, useRef } from 'react';
import {
  Car, User, Calendar, FileText, CheckCircle, ArrowLeft,
  Camera, Phone, CreditCard, Clock, Shield, X, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data — sau này thay bằng API call
const MOCK_BOOKINGS = {
  "1": {
    id: "1",
    customer: { name: "Nguyễn Văn A", phone: "0912345678", idCard: "079201001234", driverLicense: "B2-012345" },
    vehicle: { name: "Toyota Camry", plate: "ABC-123", color: "Trắng", currentMileage: 14520, fuelLevel: 100 },
    rentalType: "self", // 'self' = tự lái
    start: "2024-02-01",
    end: "2024-02-05",
    total: 3500000,
    status: "confirmed",
    deposit: 5000000,
  },
  "2": {
    id: "2",
    customer: { name: "Trần Thị B", phone: "0987654321", idCard: "079302005678", driverLicense: "B2-067890" },
    vehicle: { name: "Honda Civic", plate: "XYZ-789", color: "Đen", currentMileage: 22350, fuelLevel: 85 },
    rentalType: "driver",
    start: "2024-01-28",
    end: "2024-02-02",
    total: 2800000,
    status: "checked_in",
    deposit: 3000000,
  },
};

const STEPS = [
  { key: "verify", label: "Xác minh khách hàng" },
  { key: "vehicle", label: "Kiểm tra xe" },
  { key: "photos", label: "Chụp ảnh xe" },
  { key: "confirm", label: "Xác nhận giao xe" },
];

const HandoverCar = () => {
  const { notifySuccess, notifyConfirm } = useNotification();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Step 1 — Xác minh khách hàng
  const [idVerified, setIdVerified] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [depositConfirmed, setDepositConfirmed] = useState(false);

  // Step 2 — Kiểm tra xe
  const [formData, setFormData] = useState({
    startMileage: '',
    fuelLevel: '100',
    exteriorOk: false,
    interiorOk: false,
    spareWheel: false,
    toolkit: false,
    notes: '',
  });

  // Step 3 — Ảnh xe
  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const fileInputRef = useRef(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState(null);

  // Step 4 — Xác nhận cuối
  const [customerAgreed, setCustomerAgreed] = useState(false);

  useEffect(() => {
    // Giả lập fetch booking theo ID
    const data = MOCK_BOOKINGS[bookingId];
    if (data) {
      setBooking(data);
      setFormData(prev => ({
        ...prev,
        startMileage: String(data.vehicle.currentMileage),
        fuelLevel: String(data.vehicle.fuelLevel),
      }));
    }
    setLoading(false);
  }, [bookingId]);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Đang tải...</div>;
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Không tìm thấy đơn đặt xe #{bookingId}</p>
        <button onClick={() => navigate('/staff/booking')} className="text-blue-600 underline">Quay lại danh sách</button>
      </div>
    );
  }

  const canGoNext = () => {
    if (step === 0) return idVerified && licenseVerified && depositConfirmed;
    if (step === 1) return formData.startMileage && formData.exteriorOk && formData.interiorOk;
    if (step === 2) return photos.front && photos.back && photos.left && photos.right;
    if (step === 3) return customerAgreed;
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

  const removePhoto = (slot) => {
    setPhotos(prev => ({ ...prev, [slot]: null }));
  };

  const handleFinalConfirm = () => {
    notifyConfirm(
      "Xác nhận giao xe cho khách?",
      `Xe ${booking.vehicle.name} (${booking.vehicle.plate}) sẽ được giao cho ${booking.customer.name}. Số KM: ${formData.startMileage}, Nhiên liệu: ${formData.fuelLevel}%.`,
      () => {
        notifySuccess("Đã giao xe cho khách thành công!", () => {
          navigate('/staff/booking');
        });
      }
    );
  };

  // ========== RENDER STEPS ==========

  const renderStepVerify = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Xác minh giấy tờ khách hàng</h3>
      <p className="text-sm text-gray-500">Kiểm tra giấy tờ tùy thân và bằng lái xe của khách trước khi giao xe.</p>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3 border">
        <div className="flex items-center gap-3 text-sm">
          <User size={16} className="text-gray-400" />
          <span className="text-gray-600">Khách hàng:</span>
          <span className="font-semibold">{booking.customer.name}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone size={16} className="text-gray-400" />
          <span className="text-gray-600">SĐT:</span>
          <span className="font-semibold">{booking.customer.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CreditCard size={16} className="text-gray-400" />
          <span className="text-gray-600">CCCD:</span>
          <span className="font-semibold">{booking.customer.idCard}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield size={16} className="text-gray-400" />
          <span className="text-gray-600">GPLX:</span>
          <span className="font-semibold">{booking.customer.driverLicense}</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition">
          <input type="checkbox" checked={idVerified} onChange={(e) => setIdVerified(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Đã kiểm tra CCCD / CMND</p>
            <p className="text-xs text-gray-500">Đối chiếu ảnh và thông tin trên giấy tờ với khách hàng</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition">
          <input type="checkbox" checked={licenseVerified} onChange={(e) => setLicenseVerified(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Đã kiểm tra Giấy phép lái xe</p>
            <p className="text-xs text-gray-500">GPLX hạng B2 trở lên, còn hạn sử dụng</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-green-50 transition">
          <input type="checkbox" checked={depositConfirmed} onChange={(e) => setDepositConfirmed(e.target.checked)}
            className="w-5 h-5 text-green-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Đã xác nhận tiền cọc</p>
            <p className="text-xs text-gray-500">Số tiền cọc: {booking.deposit?.toLocaleString()} ₫</p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderStepVehicle = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Kiểm tra tình trạng xe</h3>
      <p className="text-sm text-gray-500">Ghi nhận số KM, nhiên liệu và tình trạng tổng quát của xe trước khi giao.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Số KM hiện tại *</label>
          <input type="number" value={formData.startMileage}
            onChange={(e) => setFormData({ ...formData, startMileage: e.target.value })}
            placeholder="VD: 15000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nhiên liệu / Pin (%) *</label>
          <select value={formData.fuelLevel}
            onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="100">100% (Đầy)</option>
            <option value="75">75% (3/4)</option>
            <option value="50">50% (1/2)</option>
            <option value="25">25% (1/4)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Checklist tình trạng xe:</p>
        {[
          { key: 'exteriorOk', label: 'Ngoại thất OK (không xước, móp, vỡ)' },
          { key: 'interiorOk', label: 'Nội thất OK (ghế, điều hoà, màn hình)' },
          { key: 'spareWheel', label: 'Có lốp dự phòng' },
          { key: 'toolkit', label: 'Có bộ dụng cụ sửa chữa' },
        ].map(item => (
          <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition">
            <input type="checkbox" checked={formData[item.key]}
              onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded" />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú thêm</label>
        <textarea rows="3" value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="VD: Xước nhẹ cản trước bên phải, đã thông báo cho khách..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
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
        <h3 className="font-bold text-lg text-gray-800">Chụp ảnh hiện trạng xe (4 góc)</h3>
        <p className="text-sm text-gray-500">Chụp rõ 4 góc xe để làm bằng chứng tình trạng trước khi giao.</p>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

        <div className="grid grid-cols-2 gap-4">
          {slots.map(slot => (
            <div key={slot.key} className="relative">
              {photos[slot.key] ? (
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(photos[slot.key])}
                    alt={slot.label}
                    className="w-full h-40 object-cover rounded-xl border-2 border-green-400"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition">
                    <button onClick={() => removePhoto(slot.key)}
                      className="bg-white p-2 rounded-full shadow hover:bg-red-50">
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} /> {slot.label}
                  </span>
                </div>
              ) : (
                <button onClick={() => openFileForSlot(slot.key)}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-400 transition">
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

  const renderStepConfirm = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Xác nhận giao xe</h3>
      <p className="text-sm text-gray-500">Kiểm tra lại tổng quan thông tin trước khi hoàn tất.</p>

      <div className="bg-gray-50 rounded-xl p-5 space-y-4 border text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-500">Khách hàng</p>
            <p className="font-semibold">{booking.customer.name}</p>
          </div>
          <div>
            <p className="text-gray-500">SĐT</p>
            <p className="font-semibold">{booking.customer.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Xe</p>
            <p className="font-semibold">{booking.vehicle.name} — {booking.vehicle.plate}</p>
          </div>
          <div>
            <p className="text-gray-500">Loại thuê</p>
            <p className="font-semibold">{booking.rentalType === 'self' ? 'Tự lái' : 'Có tài xế'}</p>
          </div>
          <div>
            <p className="text-gray-500">Thời gian</p>
            <p className="font-semibold">{booking.start} → {booking.end}</p>
          </div>
          <div>
            <p className="text-gray-500">Tổng tiền</p>
            <p className="font-semibold text-green-600">{booking.total.toLocaleString()} ₫</p>
          </div>
          <div>
            <p className="text-gray-500">Số KM lúc giao</p>
            <p className="font-semibold">{Number(formData.startMileage).toLocaleString()} km</p>
          </div>
          <div>
            <p className="text-gray-500">Nhiên liệu</p>
            <p className="font-semibold">{formData.fuelLevel}%</p>
          </div>
        </div>

        {formData.notes && (
          <div>
            <p className="text-gray-500">Ghi chú</p>
            <p className="font-medium text-gray-700">{formData.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {Object.entries(photos).map(([key, file]) => file && (
            <img key={key} src={URL.createObjectURL(file)} alt={key}
              className="w-16 h-16 object-cover rounded-lg border" />
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <input type="checkbox" checked={customerAgreed} onChange={(e) => setCustomerAgreed(e.target.checked)}
          className="w-5 h-5 text-blue-600 rounded" />
        <div>
          <p className="font-medium text-gray-800">Khách hàng đã kiểm tra xe, ký tên và đồng ý nhận xe</p>
          <p className="text-xs text-gray-500">Staff xác nhận đã hoàn tất quy trình bàn giao xe cho khách tự lái</p>
        </div>
      </label>
    </div>
  );

  const stepRenderers = [renderStepVerify, renderStepVehicle, renderStepPhotos, renderStepConfirm];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/staff/booking')}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Check-In Giao Xe</h2>
          <p className="text-sm text-gray-500">Đơn #{booking.id} — {booking.rentalType === 'self' ? 'Khách tự lái' : 'Có tài xế'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar — Booking info + Stepper */}
        <div className="md:col-span-1 space-y-4">
          {/* Booking card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-blue-600" /> Thông tin đơn
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex items-center gap-2"><User size={14} /> {booking.customer.name}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {booking.customer.phone}</p>
              <p className="flex items-center gap-2"><Car size={14} /> {booking.vehicle.name}</p>
              <p className="text-blue-600 font-semibold bg-blue-50 border border-blue-100 w-fit px-2 py-0.5 rounded text-xs">
                {booking.vehicle.plate}
              </p>
              <p className="flex items-center gap-2"><Calendar size={14} /> {booking.start} → {booking.end}</p>
              <p className="flex items-center gap-2"><Clock size={14} /> {booking.rentalType === 'self' ? 'Tự lái' : 'Có tài xế'}</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Quy trình</h3>
            <div className="space-y-1">
              {STEPS.map((s, i) => (
                <div key={s.key}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition
                    ${i === step ? 'bg-blue-50 text-blue-700 font-semibold' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border
                    ${i === step ? 'border-blue-500 bg-blue-500 text-white' : i < step ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {s.label}
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
                    ${canGoNext() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Tiếp theo <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleFinalConfirm} disabled={!canGoNext()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition shadow-lg
                    ${canGoNext() ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  <CheckCircle size={18} /> Xác nhận Giao Xe
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandoverCar;