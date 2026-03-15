import { useState, useEffect, useRef } from 'react';
import {
  Car, User, FileText, CheckCircle, ArrowLeft,
  Camera, Phone, Clock, X, ChevronRight, ChevronLeft,
  AlertTriangle, Loader2, MapPin,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingByIdApi, staffHandoverReturnApi } from '../../api/bookingApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (s) =>
  s ? new Date(s).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const fmtMoney = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const STEPS = [
  { key: 'mileage', label: 'Số KM đồng hồ' },
  { key: 'condition', label: 'Tình trạng xe' },
  { key: 'photos', label: 'Chụp ảnh xe' },
  { key: 'confirm', label: 'Xác nhận nhận xe' },
];

const ReceiveCar = () => {
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Step 1 — Số KM
  const [returnMileage, setReturnMileage] = useState('');

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

  // Step 4 — Xác nhận
  const [staffConfirmed, setStaffConfirmed] = useState(false);

  // ── Fetch real booking ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getBookingByIdApi(bookingId)
      .then((res) => {
        const data = res.data?.data;
        if (!data) throw new Error('Không tìm thấy booking');
        setBooking(data);
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-purple-500" size={36} />
        <p className="text-gray-500">Đang tải thông tin đơn...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <AlertTriangle size={40} className="text-red-400 mx-auto" />
        <p className="text-gray-500 text-lg">Không tìm thấy đơn đặt xe #{bookingId}</p>
        <button onClick={() => navigate('/staff/receive-car')} className="text-blue-600 underline">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const selfDriveUnits = (booking.rentalUnits || []).filter((u) => !u.isWithDriver);
  const firstUnit = selfDriveUnits[0];

  const canGoNext = () => {
    if (step === 0) return returnMileage && Number(returnMileage) > 0;
    if (step === 1) return condition.exteriorOk && condition.interiorOk;
    if (step === 2) return photos.front && photos.back && photos.left && photos.right;
    if (step === 3) return staffConfirmed;
    return false;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && activePhotoSlot) {
      setPhotos((prev) => ({ ...prev, [activePhotoSlot]: file }));
    }
    setActivePhotoSlot(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFileForSlot = (slot) => {
    setActivePhotoSlot(slot);
    fileInputRef.current?.click();
  };

  const removePhoto = (slot) => setPhotos((prev) => ({ ...prev, [slot]: null }));

  // ── Gọi staffHandoverReturnApi cho từng xe tự lái ─────────────────────────
  const handleFinalConfirm = async () => {
    setSubmitting(true);
    setApiError(null);
    const conditionNote = [
      condition.damageNotes,
      condition.hasDamage ? 'Có hư hại ghi nhận' : '',
    ]
      .filter(Boolean)
      .join('. ');

    try {
      for (const unit of selfDriveUnits) {
        await staffHandoverReturnApi(booking.id, {
          rentalUnitId: unit.id,
          type: 'RETURN',
          odoMeter: Number(returnMileage),
          condition: conditionNote || '',
          photos: null,
        });
      }
      notifySuccess('✅ Đã nhận xe thành công! Booking hoàn tất.');
      navigate('/staff/booking');
    } catch (e) {
      const msg = e.response?.data?.message || 'Nhận xe thất bại. Vui lòng thử lại.';
      setApiError(msg);
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // STEP RENDERERS
  // ══════════════════════════════════════════════════════════════════════════

  const renderStepMileage = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Kiểm tra Số KM đồng hồ</h3>
      <p className="text-sm text-gray-500">
        Ghi nhận số km đồng hồ lúc khách trả xe để hoàn tất biên bản.
      </p>

      {/* Booking summary */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2 text-sm">
        <p className="font-semibold text-purple-700">Thông tin đơn trả xe:</p>
        <div className="grid grid-cols-2 gap-2 text-gray-700">
          {booking.customerName && (
            <p className="flex items-center gap-1"><User size={13} /> {booking.customerName}</p>
          )}
          {firstUnit && (
            <p className="flex items-center gap-1">
              <Car size={13} />
              {firstUnit.vehicleBrand
                ? `${firstUnit.vehicleBrand} ${firstUnit.vehicleModel}`
                : `Xe #${firstUnit.vehicleId}`}
            </p>
          )}
          {firstUnit?.vehiclePlateNumber && (
            <p className="font-mono font-semibold text-purple-600">{firstUnit.vehiclePlateNumber}</p>
          )}
          {booking.deliveryMode === 'DELIVERY' && booking.deliveryAddress && (
            <p className="flex items-center gap-1 col-span-2">
              <MapPin size={13} className="text-purple-500" /> {booking.deliveryAddress}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Số KM lúc trả xe *</label>
        <input
          type="number"
          value={returnMileage}
          onChange={(e) => setReturnMileage(e.target.value)}
          placeholder="VD: 52500"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />
      </div>
    </div>
  );

  const renderStepCondition = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Kiểm tra tình trạng xe</h3>
      <p className="text-sm text-gray-500">Xác nhận tình trạng ngoại thất, nội thất và ghi nhận hư hại nếu có.</p>

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
            <p className="font-medium text-red-700 flex items-center gap-1">
              <AlertTriangle size={14} /> Có hư hại / sự cố
            </p>
            <p className="text-xs text-gray-500">Đánh dấu nếu phát hiện hư hại mới</p>
          </div>
        </label>
      </div>

      {condition.hasDamage && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết hư hại</label>
          <textarea
            rows="4"
            value={condition.damageNotes}
            onChange={(e) => setCondition({ ...condition, damageNotes: e.target.value })}
            placeholder="VD: Xước cản trước bên phải dài 15cm, móp nhẹ cửa sau bên trái..."
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none bg-red-50"
          />
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
        <p className="text-sm text-gray-500">Chụp rõ 4 góc xe để làm bằng chứng tình trạng xe khi trả.</p>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

        <div className="grid grid-cols-2 gap-4">
          {slots.map((slot) => (
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

  const renderStepConfirm = () => {
    return (
      <div className="space-y-5">
        <h3 className="font-bold text-lg text-gray-800">Xác nhận nhận xe</h3>
        <p className="text-sm text-gray-500">Kiểm tra lại tổng quan trước khi hoàn tất.</p>

        {apiError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertTriangle size={16} /> {apiError}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-5 space-y-4 border text-sm">
          <div className="grid grid-cols-2 gap-3">
            {booking.customerName && (
              <div>
                <p className="text-gray-500">Khách hàng</p>
                <p className="font-semibold">{booking.customerName}</p>
              </div>
            )}
            {firstUnit && (
              <div>
                <p className="text-gray-500">Xe</p>
                <p className="font-semibold">
                  {firstUnit.vehicleBrand
                    ? `${firstUnit.vehicleBrand} ${firstUnit.vehicleModel}`
                    : `Xe #${firstUnit.vehicleId}`}
                  {firstUnit.vehiclePlateNumber && ` — ${firstUnit.vehiclePlateNumber}`}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Số KM trả</p>
              <p className="font-semibold">{Number(returnMileage).toLocaleString('vi-VN')} km</p>
            </div>
            <div>
              <p className="text-gray-500">Tổng tiền</p>
              <p className="font-semibold text-green-600">{fmtMoney(booking.totalAmount)}</p>
            </div>
          </div>

          {condition.hasDamage && condition.damageNotes && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-red-600 font-semibold text-xs mb-1">Ghi nhận hư hại:</p>
              <p className="text-gray-700 text-sm">{condition.damageNotes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {Object.entries(photos).map(([key, file]) =>
              file && (
                <img key={key} src={URL.createObjectURL(file)} alt={key}
                  className="w-16 h-16 object-cover rounded-lg border" />
              )
            )}
          </div>
        </div>

        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50 cursor-pointer">
          <input type="checkbox" checked={staffConfirmed} onChange={(e) => setStaffConfirmed(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Xác nhận đã kiểm tra xe và nhận xe từ khách</p>
            <p className="text-xs text-gray-500">
              Staff xác nhận hoàn tất quy trình nhận xe — booking sẽ chuyển sang <strong>COMPLETED</strong>
            </p>
          </div>
        </label>
      </div>
    );
  };

  const stepRenderers = [renderStepMileage, renderStepCondition, renderStepPhotos, renderStepConfirm];

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
          <p className="text-sm text-gray-500">
            Đơn #{booking.id}
            {firstUnit && ` — ${firstUnit.vehicleBrand ? `${firstUnit.vehicleBrand} ${firstUnit.vehicleModel}` : `Xe #${firstUnit.vehicleId}`}`}
            {firstUnit?.vehiclePlateNumber && ` (${firstUnit.vehiclePlateNumber})`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-purple-600" /> Thông tin đơn
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              {booking.customerName && (
                <p className="flex items-center gap-2"><User size={14} /> {booking.customerName}</p>
              )}
              {booking.customerPhone && (
                <p className="flex items-center gap-2"><Phone size={14} /> {booking.customerPhone}</p>
              )}
              {selfDriveUnits.map((u) => (
                <div key={u.id}>
                  <p className="flex items-center gap-2">
                    <Car size={14} />
                    {u.vehicleBrand ? `${u.vehicleBrand} ${u.vehicleModel}` : `Xe #${u.vehicleId}`}
                  </p>
                  {u.vehiclePlateNumber && (
                    <p className="text-purple-600 font-semibold bg-purple-50 border border-purple-100 w-fit px-2 py-0.5 rounded mt-1">
                      {u.vehiclePlateNumber}
                    </p>
                  )}
                </div>
              ))}
              <p className="flex items-center gap-2">
                <Clock size={14} />
                {booking.deliveryMode === 'DELIVERY' ? '🚚 Giao tận nơi' : '🏢 Tại bãi'}
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Quy trình</h3>
            <div className="space-y-1">
              {STEPS.map((s, i) => (
                <div key={s.key}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition
                    ${i === step ? 'bg-purple-50 text-purple-700 font-semibold'
                    : i < step ? 'text-green-600'
                    : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0
                    ${i === step ? 'border-purple-500 bg-purple-500 text-white'
                    : i < step ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300'}`}>
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
              <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
                className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-medium transition
                  ${step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ChevronLeft size={18} /> Quay lại
              </button>

              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext()}
                  className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-medium transition
                    ${canGoNext()
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Tiếp theo <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleFinalConfirm} disabled={!canGoNext() || submitting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition shadow-lg
                    ${canGoNext() && !submitting
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                    : <><CheckCircle size={18} /> Xác nhận Nhận Xe</>
                  }
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
