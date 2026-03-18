import { useState, useEffect, useRef } from 'react';
import {
  Car, User, Calendar, FileText, CheckCircle, ArrowLeft,
  Camera, Phone, Clock, Shield, X, ChevronRight, ChevronLeft,
  Loader2, AlertTriangle, MapPin, CreditCard,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingByIdApi, staffHandoverStartPreviewApi, staffHandoverStartApi } from '../../api/bookingApi';
import InspectionResultsDisplay from './InspectionResultsDisplay';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (s) =>
  s ? new Date(s).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const fmtMoney = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const STEPS = [
  { key: 'verify', label: 'Xác minh khách hàng' },
  { key: 'inspection', label: 'Kiểm tra xe' },
  { key: 'confirm', label: 'Xác nhận giao xe' },
];

const HandoverCar = () => {
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

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

  // Step 2 — Ảnh xe (gộp chung với kiểm tra xe)
  const [photos, setPhotos] = useState({ FRONT_LEFT: null, FRONT_RIGHT: null, REAR_LEFT: null, REAR_RIGHT: null });
  const fileInputRef = useRef(null);
  const [activePhotoSlot, setActivePhotoSlot] = useState(null);

  // Scan (AI Analysis) state — new workflow
  const [scannedAnalysisId, setScannedAnalysisId] = useState(null);
  const [scannedAnalysis, setScannedAnalysis] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [editedFeeFromAI, setEditedFeeFromAI] = useState(0);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [scanSkipped, setScanSkipped] = useState(false);

  // Step 3 — Xác nhận cuối
  const [customerAgreed, setCustomerAgreed] = useState(false);

  // Inspection results from BE (confirm endpoint)
  const [inspectionResults, setInspectionResults] = useState({});

  // ── Fetch booking from real API ──────────────────────────────────────────
  const [notes, setNotes]     = useState("");

  useEffect(() => {
    const fetchState = async () => {
      try {
        setLoading(true);
        const res = await getVehicleStateApi(vehicleId);
        console.log("VEHICLE STATE:", res.data);
        const data = res.data?.data ?? res.data;
        setState(data);
      } catch (err) {
        setError("Không thể tải trạng thái xe");
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, [vehicleId]);

  const handleReceive = async () => {
    try {
      setSubmitting(true);
      await staffHandoverReturnApi(bookingId);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Nhận xe thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={28} />
        <p>Đang tải trạng thái xe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-red-500">
        <AlertCircle size={28} />
        <p>{error}</p>
      </div>
    );
  }

  // Chỉ lấy xe tự lái
  const selfDriveUnits = (booking.rentalUnits || []).filter((u) => !u.isWithDriver);
  const firstUnit = selfDriveUnits[0];
  const hasAllPhotos = photos.FRONT_LEFT && photos.FRONT_RIGHT && photos.REAR_LEFT && photos.REAR_RIGHT;
  const canReviewCondition = scannedAnalysisId !== null || scanSkipped;

  const canGoNext = () => {
    if (step === 0) return idVerified && licenseVerified && depositConfirmed;
    if (step === 1) return formData.startMileage && canReviewCondition && formData.exteriorOk && formData.interiorOk;
    if (step === 2) return customerAgreed;
    return false;
  };

  // Validate photos: exactly 4, all corners present, no duplicates
  const validatePhotos = () => {
    const corners = ['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT'];
    const present = corners.filter(c => photos[c]);
    if (present.length !== 4) {
      notifyError('❌ Phải có đủ 4 ảnh từ 4 góc khác nhau');
      return false;
    }
    return true;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && activePhotoSlot) {
      setPhotos((prev) => ({ ...prev, [activePhotoSlot]: file }));
      // Photo changed => previous analysis is stale.
      setScannedAnalysisId(null);
      setScannedAnalysis(null);
      setScanError(null);
      setScanSkipped(false);
    }
    setActivePhotoSlot(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFileForSlot = (slot) => {
    setActivePhotoSlot(slot);
    fileInputRef.current?.click();
  };

  const removePhoto = (slot) => {
    setPhotos((prev) => ({ ...prev, [slot]: null }));
    setScannedAnalysisId(null);
    setScannedAnalysis(null);
    setScanError(null);
    setScanSkipped(false);
  };

  // ── Upload ảnh lên Cloudinary và build vehiclePhotos payload ───────────
  const uploadVehiclePhotos = async (bookingIdForPath, rentalUnitIdForPath) => {
    const corners = ['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT'];
    const uploaded = await Promise.all(
      corners.map(async (corner) => {
        const file = photos[corner];
        if (!file) {
          throw new Error(`Thiếu ảnh góc ${corner}`);
        }

        const imageUrl = await uploadImageToCloudinary(
          file,
          `bookings/${bookingIdForPath}/units/${rentalUnitIdForPath}/PICKUP`
        );

        if (!imageUrl || !(imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
          throw new Error(`URL ảnh không hợp lệ cho góc ${corner}`);
        }

        return { corner, imageUrl };
      })
    );

    return uploaded;
  };

  // ── Scan AI Analysis (preview endpoint) ────────────────────────────────
  const handleScanAnalyze = async () => {
    if (!validatePhotos()) {
      return;
    }

    setScanSkipped(false);
    setScanInProgress(true);
    setScanError(null);

    try {
      const unit = firstUnit;
      if (!unit) {
        throw new Error('Xe không tìm thấy');
      }

      // Upload photos to Cloudinary
      const vehiclePhotos = await uploadVehiclePhotos(booking.id, unit.id);

      // Call scan preview endpoint
      const response = await staffHandoverStartPreviewApi(booking.id, {
        rentalUnitId: unit.id,
        vehiclePhotos,
      });

      const data = response.data?.data;
      if (!data) {
        throw new Error('Không nhận được dữ liệu từ AI');
      }

      // Fetch full detail record for review UI.
      const analysisId = data.inspectionAnalysisId;
      let resolvedAnalysis = data;
      if (analysisId) {
        try {
          const detailResponse = await getVehicleInspectionByAnalysisIdApi(analysisId);
          resolvedAnalysis = detailResponse.data?.data || data;
        } catch {
          // Fallback to preview response if detail endpoint is temporarily unavailable.
          resolvedAnalysis = data;
        }
      }

      // Save scan results
      setScannedAnalysisId(analysisId || null);
      setScannedAnalysis(resolvedAnalysis);
      setEditedFeeFromAI(resolvedAnalysis.inspectionAnalysis?.recommendedFee || data.inspectionAnalysis?.recommendedFee || 0);

      notifySuccess('✅ Phân tích AI hoàn tất.');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Phân tích AI thất bại. Vui lòng thử lại.';
      setScanError(msg);
      notifyError(msg);
    } finally {
      setScanInProgress(false);
    }
  };

  // ── Gọi staffHandoverStartApi cho từng xe tự lái ──────────────────────────
  const handleFinalConfirm = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      for (const unit of selfDriveUnits) {
        const response = await staffHandoverStartApi(booking.id, {
          rentalUnitId: unit.id,
          type: 'PICKUP',
          odoMeter: Number(formData.startMileage),
          condition: formData.notes || '',
          inspectionAnalysisId: scannedAnalysisId || null, // Send ID from scan, or null if skipped
        });
        // Store inspection results from response
        if (response.data?.data?.rentalUnits?.[0]) {
          const unitData = response.data.data.rentalUnits[0];
          setInspectionResults({
            inspectionAnalysisId: unitData.inspectionAnalysisId,
            inspectionStage: unitData.inspectionStage,
            inspectionStatus: unitData.inspectionStatus,
            inspectionSeverity: unitData.inspectionSeverity,
            comparisonSummary: unitData.comparisonSummary,
            inspectionRecommendedFee: unitData.inspectionRecommendedFee,
            newDamageDetected: unitData.newDamageDetected,
            needsManualReview: unitData.needsManualReview,
          });
        }
      }
      notifySuccess('✅ Đã bàn giao xe thành công! Chuyến đi bắt đầu.');
      navigate('/staff/booking');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Bàn giao xe thất bại. Vui lòng thử lại.';
      setApiError(msg);
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // STEP RENDERERS
  // ══════════════════════════════════════════════════════════════════════════

  const renderStepVerify = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Xác minh khách hàng</h3>
      <p className="text-sm text-gray-500">
        Kiểm tra thông tin khách hàng và giấy tờ trước khi bàn giao xe.
      </p>

      {/* Booking + customer info from real API */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3 border">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText size={15} className="text-blue-500" />
          Đơn #{booking.id}
          {booking.bookingCode && (
            <span className="ml-1 font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-xs">
              {booking.bookingCode}
            </span>
          )}
        </div>

        {booking.customerName && (
          <div className="flex items-center gap-2 text-sm">
            <User size={14} className="text-gray-400" />
            <span className="text-gray-600">Khách hàng:</span>
            <span className="font-semibold text-gray-800">{booking.customerName}</span>
          </div>
        )}
        {booking.customerPhone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className="text-gray-400" />
            <span className="text-gray-600">SĐT:</span>
            <span className="font-semibold text-gray-800">{booking.customerPhone}</span>
          </div>
        )}
        {booking.customerEmail && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 text-xs">✉</span>
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-700">{booking.customerEmail}</span>
          </div>
        )}

        <div className="pt-2 border-t space-y-1">
          {selfDriveUnits.map((u) => (
            <div key={u.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Car size={13} className="text-gray-400" />
                <span className="font-medium text-gray-700">
                  {u.vehicleBrand ? `${u.vehicleBrand} ${u.vehicleModel}` : `Xe #${u.vehicleId}`}
                </span>
                {u.vehiclePlateNumber && (
                  <span className="font-mono text-blue-600 bg-blue-50 px-1.5 rounded">{u.vehiclePlateNumber}</span>
                )}
              </div>
              <span className="text-gray-400">{fmtDate(u.startTime)} → {fmtDate(u.endTime)}</span>
            </div>
          ))}
        </div>

        {booking.deliveryMode === 'DELIVERY' && booking.deliveryAddress && (
          <div className="flex items-start gap-2 text-sm bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <span className="text-blue-700">{booking.deliveryAddress}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm pt-1 border-t">
          <span className="text-gray-500">Tổng tiền:</span>
          <span className="font-bold text-green-600">{fmtMoney(booking.totalAmount)}</span>
        </div>
        {booking.depositRequired && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Tiền cọc:</span>
            <span className="font-semibold text-orange-600">{fmtMoney(booking.depositRequired)}</span>
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition">
          <input type="checkbox" checked={idVerified} onChange={(e) => setIdVerified(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded" />
          <div>
            <p className="font-medium text-gray-800">Đã kiểm tra CCCD / CMND</p>
            <p className="text-xs text-gray-500">Đối chiếu ảnh và thông tin giấy tờ với khách hàng</p>
          </div>

          {/* Speed */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-2">
            <Gauge size={24} className="text-purple-500" />
            <p className="text-xs text-gray-400">Tốc độ</p>
            <p className="font-semibold text-lg">{state?.speedKmh ?? 0} km/h</p>
          </div>

          {/* GPS */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-2">
            <MapPin size={24} className="text-red-500" />
            <p className="text-xs text-gray-400">Vị trí</p>
            <p className="font-medium text-sm text-center">
              {state?.latitude && state?.longitude
                ? `${state.latitude.toFixed(4)}, ${state.longitude.toFixed(4)}`
                : "Không có"}
            </p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderStepVehicle = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Kiểm tra tình trạng xe</h3>
      <p className="text-sm text-gray-500">
        Chụp ảnh và phân tích AI trước, sau đó xác nhận checklist tình trạng tổng quát của xe.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Số km đồng hồ *
          </label>
          <input
            type="number"
            value={formData.startMileage}
            onChange={(e) => setFormData({ ...formData, startMileage: e.target.value })}
            placeholder="VD: 15000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nhiên liệu / Pin (%)
          </label>
          <select
            value={formData.fuelLevel}
            onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="100">100% (Đầy)</option>
            <option value="75">75% (3/4)</option>
            <option value="50">50% (1/2)</option>
            <option value="25">25% (1/4)</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        Quy ước trái/phải theo chiều xe chạy (ngồi trong xe nhìn về phía trước).
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'FRONT_LEFT', label: 'FRONT_LEFT · Góc trước trái' },
          { key: 'FRONT_RIGHT', label: 'FRONT_RIGHT · Góc trước phải' },
          { key: 'REAR_LEFT', label: 'REAR_LEFT · Góc sau trái' },
          { key: 'REAR_RIGHT', label: 'REAR_RIGHT · Góc sau phải' },
        ].map((slot) => (
          <div key={slot.key} className="relative">
            {photos[slot.key] ? (
              <div className="relative group">
                <img
                  src={URL.createObjectURL(photos[slot.key])}
                  alt={slot.label}
                  className="w-full h-40 object-cover rounded-xl border-2 border-green-400"
                />
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
              <button
                onClick={() => openFileForSlot(slot.key)}
                className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-400 transition"
              >
                <Camera size={28} className="mb-1" />
                <span className="text-sm font-medium">{slot.label}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleScanAnalyze}
          disabled={!hasAllPhotos || scanInProgress}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            !hasAllPhotos || scanInProgress
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {scanInProgress ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang phân tích...
            </>
          ) : (
            <>🔍 Phân tích AI</>
          )}
        </button>
        <button
          onClick={() => {
            setScanSkipped(true);
            setScanError(null);
          }}
          disabled={scanInProgress}
          className={`px-4 py-3 rounded-lg font-semibold transition ${
            scanInProgress
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          ⏭ Bỏ qua AI
        </button>
        {scanError && (
          <button
            onClick={handleScanAnalyze}
            disabled={scanInProgress}
            className="px-4 py-3 rounded-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 transition"
          >
            🔄 Thử lại
          </button>
        )}
      </div>

      {scanError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-700">Phân tích AI thất bại</p>
            <p className="text-sm text-red-600 mt-1">{scanError}</p>
            <button
              onClick={() => setScanSkipped(true)}
              className="text-xs text-red-700 underline hover:no-underline mt-2 font-semibold"
            >
              Bỏ qua AI, xác nhận ngay →
            </button>
          </div>
        </div>
      )}

      {scannedAnalysis && scannedAnalysis.analysisStatus === 'SUCCESS' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <p className="font-semibold text-blue-700">📊 Kết quả phân tích AI:</p>
          <InspectionResultsDisplay
            inspectionStatus={scannedAnalysis.analysisStatus}
            inspectionSeverity={scannedAnalysis.inspectionAnalysis?.severity}
            inspectionRecommendedFee={editedFeeFromAI}
            needsManualReview={scannedAnalysis.inspectionAnalysis?.needsManualReview}
            inspectionStage="PICKUP"
            editableFee={true}
            onFeeChange={setEditedFeeFromAI}
            comparisonSummary={null}
            showRecommendedFee={false}
          />
        </div>
      )}

      {scanSkipped && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-700">⚠️ Bỏ qua phân tích AI</p>
            <p className="text-xs text-amber-600">Xe chưa được phân tích AI, staff sẽ đánh giá hư hại thủ công</p>
          </div>
        </div>
      )}

      {!canReviewCondition && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-700">
          Vui lòng bấm <strong>Phân tích AI</strong> trước khi tích checklist tình trạng xe.
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Checklist tình trạng xe:</p>
        {[
          { key: 'exteriorOk', label: 'Ngoại thất OK (không xước, móp, vỡ)' },
          { key: 'interiorOk', label: 'Nội thất OK (ghế, điều hoà, màn hình)' },
          { key: 'spareWheel', label: 'Có lốp dự phòng' },
          { key: 'toolkit', label: 'Có bộ dụng cụ sửa chữa' },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={formData[item.key]}
              onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
              disabled={!canReviewCondition}
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú thêm</label>
        <textarea
          rows="3"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="VD: Xước nhẹ cản trước bên phải, đã thông báo cho khách..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={!canReviewCondition}
        />
      </div>
    </div>
  );

  const renderStepConfirm = () => (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-gray-800">Xác nhận giao xe</h3>
      <p className="text-sm text-gray-500">Kiểm tra lại tổng quan thông tin trước khi hoàn tất.</p>

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
          {booking.customerPhone && (
            <div>
              <p className="text-gray-500">SĐT</p>
              <p className="font-semibold">{booking.customerPhone}</p>
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
            <p className="text-gray-500">Loại thuê</p>
            <p className="font-semibold text-orange-600">Tự lái</p>
          </div>
          {firstUnit && (
            <div>
              <p className="text-gray-500">Thời gian</p>
              <p className="font-semibold">{fmtDate(firstUnit.startTime)} → {fmtDate(firstUnit.endTime)}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Tổng tiền</p>
            <p className="font-semibold text-green-600">{fmtMoney(booking.totalAmount)}</p>
          </div>
          <div>
            <p className="text-gray-500">Số km lúc giao</p>
            <p className="font-semibold">{Number(formData.startMileage).toLocaleString('vi-VN')} km</p>
          </div>
          <div>
            <p className="text-gray-500">Nhiên liệu / Pin</p>
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
          {Object.entries(photos).map(([key, file]) =>
            file && (
              <img key={key} src={URL.createObjectURL(file)} alt={key}
                className="w-16 h-16 object-cover rounded-lg border" />
            )
          )}
        </div>
      </div>

      {/* AI Inspection Results (if available) */}
      {Object.keys(inspectionResults).length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="font-semibold text-blue-700 mb-3">📊 Kết quả phân tích AI tình trạng xe</h4>
          <InspectionResultsDisplay
            inspectionStatus={inspectionResults.inspectionStatus}
            inspectionSeverity={inspectionResults.inspectionSeverity}
            comparisonSummary={inspectionResults.comparisonSummary}
            inspectionRecommendedFee={inspectionResults.inspectionRecommendedFee}
            newDamageDetected={inspectionResults.newDamageDetected}
            needsManualReview={inspectionResults.needsManualReview}
            inspectionStage={inspectionResults.inspectionStage}
            showRecommendedFee={false}
          />
        </div>
      )}

      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <input
          type="checkbox"
          checked={customerAgreed}
          onChange={(e) => setCustomerAgreed(e.target.checked)}
          className="w-5 h-5 text-blue-600 rounded"
        />
        <div>
          <p className="font-medium text-gray-800">Khách hàng đã kiểm tra xe và đồng ý nhận xe</p>
          <p className="text-xs text-gray-500">
            Staff xác nhận đã hoàn tất quy trình bàn giao xe — booking sẽ chuyển sang <strong>IN_PROGRESS</strong>
          </p>
        </div>
      </label>
    </div>
  );

  const stepRenderers = [renderStepVerify, renderStepVehicle, renderStepConfirm];

      {/* ACTION */}
      <div className="flex justify-end">
        <button
          onClick={handleReceive}
          disabled={submitting}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
            : <><CheckCircle2 size={18} /> Xác nhận nhận xe</>
          }
        </button>
      </div>

    </div>
  );
};

export default ReceiveCar;