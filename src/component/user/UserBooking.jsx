import { useState, useEffect, useCallback } from "react";
import {
  Car, MapPin, Calendar, Clock, ChevronRight, ChevronLeft,
  Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  History, Plus, X, User, CreditCard,
} from "lucide-react";
import { getAllVehiclesApi } from "../../api/vehicleApi";
import {
  createBookingApi,
  getBookingsByUserApi,
  cancelBookingApi,
  processPaymentApi,
} from "../../api/bookingApi";
import { useNotification } from "../../context/NotificationContext";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtMoney = (n) =>
  n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—";

const fmtDate = (s) =>
  s ? new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100   text-blue-700   border-blue-200" },
  IN_PROGRESS: { label: "Đang diễn ra", color: "bg-green-100  text-green-700  border-green-200" },
  COMPLETED: { label: "Hoàn tất", color: "bg-gray-100   text-gray-600   border-gray-200" },
  CANCELLED: { label: "Đã huỷ", color: "bg-red-100    text-red-700    border-red-200" },
};

// ─── Vehicle Selector Card ─────────────────────────────────────────────────
function VehicleCard({ vehicle, selected, onSelect }) {
  const isAvailable = vehicle.status === "AVAILABLE";
  return (
    <div
      onClick={() => isAvailable && onSelect(vehicle)}
      className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${selected
        ? "border-green-500 bg-green-50 shadow-md"
        : isAvailable
          ? "border-gray-200 bg-white hover:border-green-300 hover:shadow"
          : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
        }`}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle size={12} className="text-white" />
        </span>
      )}
      <Car size={24} className={`mb-2 ${selected ? "text-green-600" : "text-gray-400"}`} />
      <p className="font-semibold text-gray-800 text-sm">
        {vehicle.modelName || `Model #${vehicle.modelId}`}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{vehicle.plateNumber || "—"}</p>
      <p className="text-xs font-medium mt-1.5">
        {isAvailable ? (
          <span className="text-green-600">● Có sẵn</span>
        ) : (
          <span className="text-red-500">● {vehicle.status}</span>
        )}
      </p>
      <p className="text-xs text-gray-400 mt-1">Pin: {vehicle.batteryLevel != null ? `${vehicle.batteryLevel}%` : "—"}</p>
    </div>
  );
}

// ─── Payment method options ────────────────────────────────────────────────
const PAY_METHODS = [
  { value: "CASH",          label: "💵 Tiền mặt" },
  { value: "E_WALLET",      label: "📱 Ví điện tử (Momo / ZaloPay)" },
  { value: "BANK_TRANSFER", label: "🏦 Chuyển khoản ngân hàng" },
  { value: "CREDIT_CARD",   label: "💳 Thẻ tín dụng" },
];

// ─── Inline Payment Modal ──────────────────────────────────────────────────
function PaymentModal({ booking, invoice, onClose, onPaid }) {
  const [method, setMethod] = useState("CASH");
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState(null);

  const handlePay = async () => {
    setPaying(true);
    setErr(null);
    try {
      const res = await processPaymentApi(invoice.id, method, invoice.amount);
      const result = res.data?.data;
      if (result?.status === "PAID") {
        onPaid();
      } else {
        setErr(result?.message || "Thanh toán không thành công.");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Thanh toán thất bại.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => !paying && onClose()} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CreditCard size={20} className="text-blue-500" />
            Thanh toán đặt xe
          </h3>
          {!paying && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Invoice info */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã booking</span>
            <span className="font-mono font-semibold text-green-700">{booking.bookingCode}</span>
          </div>
          <div className="flex justify-between border-t border-green-100 pt-2 mt-1">
            <span className="font-semibold text-gray-700">Số tiền cần thanh toán</span>
            <span className="text-xl font-bold text-green-600">{fmtMoney(invoice.amount)}</span>
          </div>
        </div>

        {/* Method selector */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Chọn phương thức thanh toán</p>
          {PAY_METHODS.map((m) => (
            <label
              key={m.value}
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                method === m.value
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="payMethod"
                value={m.value}
                checked={method === m.value}
                onChange={() => setMethod(m.value)}
                className="accent-green-500"
              />
              <span className="text-sm font-medium text-gray-700">{m.label}</span>
            </label>
          ))}
        </div>

        {err && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {err}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={paying}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium disabled:opacity-40"
          >
            Thanh toán sau
          </button>
          <button
            onClick={handlePay}
            disabled={paying}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
          >
            {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            {paying ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking History Card ──────────────────────────────────────────────────
function HistoryCard({ booking, onCancelled, onPaymentDone }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelInput, setCancelInput] = useState(false);
  const [reason, setReason] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBookingApi(booking.id, reason);
      onCancelled();
    } catch (e) {
      alert(e.response?.data?.message || "Không thể huỷ booking.");
    } finally {
      setCancelling(false);
      setCancelInput(false);
    }
  };

  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const units = booking.rentalUnits || [];

  // Invoice logic
  const unpaidInvoice = booking.invoices?.find((inv) => inv.status === "UNPAID");
  const paidInvoice   = booking.invoices?.find((inv) => inv.status === "PAID");
  const canPay = unpaidInvoice && booking.status !== "CANCELLED";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Booking</p>
          <p className="font-bold text-gray-800">
            #{booking.id}
            {booking.bookingCode && (
              <span className="ml-1.5 text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {booking.bookingCode}
              </span>
            )}
          </p>
        </div>
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Giao nhận</p>
            <p className="font-medium text-gray-700">
              {booking.deliveryMode === "DELIVERY" ? "🚚 Giao tận nơi" : "🏢 Tự đến bãi"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Tổng tiền</p>
            <p className="font-semibold text-green-600">{fmtMoney(booking.totalAmount)}</p>
          </div>
        </div>

        {booking.deliveryAddress && (
          <div className="flex items-start gap-2 text-gray-700 bg-blue-50 rounded-lg px-3 py-2">
            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <span className="text-xs">{booking.deliveryAddress}</span>
          </div>
        )}

        {units.length > 0 && (
          <div className="space-y-1.5">
            {units.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Car size={13} /> Xe #{u.vehicleId}
                  {u.isWithDriver
                    ? <span className="text-purple-600 bg-purple-50 px-1.5 rounded-full border border-purple-100 ml-1">Có tài xế</span>
                    : <span className="text-orange-600 bg-orange-50 px-1.5 rounded-full border border-orange-100 ml-1">Tự lái</span>
                  }
                </span>
                <span className="text-gray-400">{fmtDate(u.startTime)} → {fmtDate(u.endTime)}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">Đặt lúc: {fmtDate(booking.createdAt)}</p>
      </div>

      {/* Payment status row */}
      {(paidInvoice || unpaidInvoice) && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          {paidInvoice ? (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle size={15} /> Đã thanh toán {fmtMoney(paidInvoice.amount)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-orange-500 text-sm font-medium">
              <AlertTriangle size={15} /> Chưa thanh toán {fmtMoney(unpaidInvoice.amount)}
            </span>
          )}
          {canPay && (
            <button
              onClick={() => setShowPayModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition"
            >
              <CreditCard size={13} /> Thanh toán
            </button>
          )}
        </div>
      )}

      {/* Cancel */}
      {canCancel && (
        <div className="px-5 py-3 border-t border-gray-100">
          {!cancelInput ? (
            <button
              onClick={() => setCancelInput(true)}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium transition"
            >
              <XCircle size={15} /> Huỷ booking
            </button>
          ) : (
            <div className="space-y-2">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Lý do huỷ (tuỳ chọn)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setCancelInput(false)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-60"
                >
                  {cancelling && <Loader2 size={11} className="animate-spin" />}
                  Xác nhận huỷ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment modal */}
      {showPayModal && unpaidInvoice && (
        <PaymentModal
          booking={booking}
          invoice={unpaidInvoice}
          onClose={() => setShowPayModal(false)}
          onPaid={() => {
            setShowPayModal(false);
            onPaymentDone();
          }}
        />
      )}
    </div>
  );
}

// ─── Inline Payment Form (after booking created, embedded in page) ─────────
function PaymentInlineForm({ booking, invoice, onClose, onPaid }) {
  const { notifySuccess, notifyError } = useNotification();
  const [method, setMethod] = useState("CASH");
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState(null);

  const handlePay = async () => {
    setPaying(true);
    setErr(null);
    try {
      const res = await processPaymentApi(invoice.id, method, invoice.amount);
      const result = res.data?.data;
      if (result?.status === "PAID") {
        notifySuccess("✅ Thanh toán thành công! Đơn đặt xe đang chờ Staff xác nhận.");
        onPaid();
      } else {
        setErr(result?.message || "Thanh toán không thành công.");
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại.";
      setErr(msg);
      notifyError(msg);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <CreditCard size={20} className="text-green-500" /> Thanh toán đặt xe
      </h3>

      {/* Invoice summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Mã booking</span>
          <span className="font-mono font-semibold text-green-700">{booking.bookingCode}</span>
        </div>
        <div className="flex justify-between border-t border-green-100 pt-2 mt-1">
          <span className="font-semibold text-gray-700">Số tiền</span>
          <span className="text-xl font-bold text-green-600">{fmtMoney(invoice.amount)}</span>
        </div>
      </div>

      {/* Method selector */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Chọn phương thức thanh toán</p>
        {PAY_METHODS.map((m) => (
          <label
            key={m.value}
            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
              method === m.value ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="inlinePayMethod"
              value={m.value}
              checked={method === m.value}
              onChange={() => setMethod(m.value)}
              className="accent-green-500"
            />
            <span className="text-sm font-medium text-gray-700">{m.label}</span>
          </label>
        ))}
      </div>

      {err && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={paying}
          className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium disabled:opacity-40 text-sm"
        >
          Thanh toán sau
        </button>
        <button
          onClick={handlePay}
          disabled={paying}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm text-sm"
        >
          {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
          {paying ? "Đang xử lý..." : "Xác nhận thanh toán"}
        </button>
      </div>
    </div>
  );
}

// ─── Create Booking Form ───────────────────────────────────────────────────
function CreateBookingForm({ onCreated }) {
  const { notifySuccess, notifyError } = useNotification();

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Payment step after booking creation
  const [pendingPayment, setPendingPayment] = useState(null); // { booking, invoice }

  const [form, setForm] = useState({
    deliveryMode: "SELF_PICKUP",
    deliveryAddress: "",
    isWithDriver: false,
    startTime: "",
    endTime: "",
    unitPrice: "",
  });

  useEffect(() => {
    getAllVehiclesApi({ size: 50 })
      .then((r) => setVehicles(r.data?.data?.content || r.data?.data || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));
  }, []);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) {
      notifyError("Bạn chưa đăng nhập. Vui lòng đăng nhập trước.");
      return;
    }
    if (!selectedVehicle) {
      notifyError("Vui lòng chọn một xe.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      notifyError("Vui lòng chọn thời gian bắt đầu và kết thúc.");
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      notifyError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }
    if (!form.unitPrice || isNaN(Number(form.unitPrice)) || Number(form.unitPrice) <= 0) {
      notifyError("Vui lòng nhập giá thuê hợp lệ.");
      return;
    }
    if (form.isWithDriver && form.deliveryMode === "DELIVERY" && !form.deliveryAddress.trim()) {
      notifyError("Vui lòng nhập địa chỉ tài xế đến đón.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId,
        deliveryMode: form.deliveryMode,
        deliveryAddress: (form.isWithDriver && form.deliveryMode === "DELIVERY") ? form.deliveryAddress.trim() : null,
        rentalUnits: [
          {
            vehicleId: selectedVehicle.id,
            isWithDriver: form.isWithDriver,
            startTime: form.startTime,
            endTime: form.endTime,
            unitPrice: Number(form.unitPrice),
          },
        ],
      };
      const res = await createBookingApi(payload);
      const newBooking = res.data?.data;

      // Reset form
      setSelectedVehicle(null);
      setForm({ deliveryMode: "SELF_PICKUP", deliveryAddress: "", isWithDriver: false, startTime: "", endTime: "", unitPrice: "" });

      // Kiểm tra có invoice chưa thanh toán không → hiện modal thanh toán ngay
      const unpaidInvoice = newBooking?.invoices?.find((inv) => inv.status === "UNPAID");
      if (unpaidInvoice && newBooking) {
        setPendingPayment({ booking: newBooking, invoice: unpaidInvoice });
      } else {
        notifySuccess("🎉 Đặt xe thành công! Đơn đang chờ Staff xác nhận.");
        onCreated();
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "Đặt xe thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");

  // Render payment modal after booking created
  if (pendingPayment) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Đặt xe thành công!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Mã booking: <span className="font-mono font-bold">{pendingPayment.booking.bookingCode}</span>
            </p>
          </div>
        </div>

        <PaymentInlineForm
          booking={pendingPayment.booking}
          invoice={pendingPayment.invoice}
          onClose={() => { setPendingPayment(null); onCreated(); }}
          onPaid={() => { setPendingPayment(null); onCreated(); }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Chọn xe */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Chọn xe *
          {loadingVehicles && <Loader2 size={14} className="animate-spin inline ml-2 text-blue-500" />}
        </label>
        {!loadingVehicles && availableVehicles.length === 0 && (
          <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
            Hiện tại không có xe nào khả dụng. Vui lòng thử lại sau.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableVehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              selected={selectedVehicle?.id === v.id}
              onSelect={setSelectedVehicle}
            />
          ))}
        </div>
      </div>

      {/* Thời gian */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <Calendar size={14} /> Thời gian bắt đầu *
          </label>
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => set("startTime", e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <Clock size={14} /> Thời gian kết thúc *
          </label>
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      {/* Loại dịch vụ */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Loại dịch vụ *</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, isWithDriver: false, deliveryMode: "SELF_PICKUP", deliveryAddress: "" }))}
            className={`p-4 rounded-xl border-2 text-center transition ${!form.isWithDriver ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"
              }`}
          >
            <Car className="w-6 h-6 mx-auto mb-2 text-current" />
            <p className="font-medium text-sm">Tự lái</p>
            <p className="text-xs text-gray-500 mt-0.5">Tự đến bãi nhận xe</p>
          </button>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, isWithDriver: true, deliveryMode: "SELF_PICKUP" }))}
            className={`p-4 rounded-xl border-2 text-center transition ${form.isWithDriver ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"
              }`}
          >
            <User className="w-6 h-6 mx-auto mb-2 text-current" />
            <p className="font-medium text-sm">Có tài xế</p>
            <p className="text-xs text-gray-500 mt-0.5">Tài xế đưa đón bạn</p>
          </button>
        </div>
      </div>

      {/* Phương thức nhận xe — chỉ hiện khi có tài xế */}
      {form.isWithDriver ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Phương thức nhận xe *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => set("deliveryMode", "SELF_PICKUP")}
              className={`p-4 rounded-xl border-2 text-center transition ${form.deliveryMode === "SELF_PICKUP" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"
                }`}
            >
              <p className="text-2xl mb-1">🏢</p>
              <p className="font-medium text-sm">Tại bãi</p>
              <p className="text-xs text-gray-500 mt-0.5">Tài xế đón tại bãi xe</p>
            </button>
            <button
              type="button"
              onClick={() => set("deliveryMode", "DELIVERY")}
              className={`p-4 rounded-xl border-2 text-center transition ${form.deliveryMode === "DELIVERY" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-green-300"
                }`}
            >
              <p className="text-2xl mb-1">🚚</p>
              <p className="font-medium text-sm">Giao tận nơi</p>
              <p className="text-xs text-gray-500 mt-0.5">Tài xế đến đón tại địa chỉ bạn</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <span className="text-2xl">🏢</span>
          <div>
            <p className="font-semibold text-orange-700 text-sm">Tự đến bãi nhận xe</p>
            <p className="text-xs text-orange-500 mt-0.5">Xe tự lái: khách đến trực tiếp bãi xe để nhận xe</p>
          </div>
        </div>
      )}

      {/* Địa chỉ giao xe — chỉ khi có tài xế + chọn DELIVERY */}
      {form.isWithDriver && form.deliveryMode === "DELIVERY" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <MapPin size={14} /> Địa chỉ tài xế đến đón *
          </label>
          <input
            type="text"
            value={form.deliveryAddress}
            onChange={(e) => set("deliveryAddress", e.target.value)}
            placeholder="Nhập địa chỉ tài xế đến đón bạn..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      )}

      {/* Giá thuê */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Giá thuê (VNĐ) *
        </label>
        <input
          type="number"
          min={0}
          value={form.unitPrice}
          onChange={(e) => set("unitPrice", e.target.value)}
          placeholder="Ví dụ: 500000"
          required
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !selectedVehicle}
        className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
      >
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Car size={18} />}
        {submitting ? "Đang xử lý..." : "Đặt xe ngay"}
      </button>
    </form>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

export default function UserBooking() {
  const [view, setView] = useState("new"); // "new" | "history"
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const userId = localStorage.getItem("userId");

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBookingsByUserApi(userId, page, PAGE_SIZE);
      const data = res.data?.data;
      setBookings(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch (e) {
      setError("Không thể tải lịch sử đặt xe.");
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    if (view === "history") fetchHistory();
  }, [view, fetchHistory]);

  const handleBookingCreated = () => {
    setView("history");
    setPage(0);
    fetchHistory();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header + Tabs */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đặt xe</h1>
        <p className="text-gray-500 mt-1">Thuê xe nhanh chóng, tiện lợi và an toàn.</p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setView("new")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition ${view === "new" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-800"
            }`}
        >
          <Plus size={16} /> Đặt xe mới
        </button>
        <button
          onClick={() => { setView("history"); setPage(0); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition ${view === "history" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-800"
            }`}
        >
          <History size={16} /> Lịch sử đặt xe
        </button>
      </div>

      {/* View: New Booking */}
      {view === "new" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {!userId ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <AlertTriangle size={40} className="text-yellow-400" />
              <p className="font-medium text-gray-700">Bạn cần đăng nhập để đặt xe.</p>
            </div>
          ) : (
            <CreateBookingForm onCreated={handleBookingCreated} />
          )}
        </div>
      )}

      {/* View: History */}
      {view === "history" && (
        <div className="space-y-4">
          {!userId ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <AlertTriangle size={40} className="text-yellow-400" />
              <p className="font-medium text-gray-700">Bạn cần đăng nhập để xem lịch sử.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Các đơn đặt xe của bạn</p>
                <button
                  onClick={fetchHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  Làm mới
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-24 gap-3">
                  <Loader2 className="animate-spin text-green-500" size={32} />
                  <p className="text-gray-500 text-sm">Đang tải lịch sử...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <AlertTriangle size={36} className="text-red-400" />
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={fetchHistory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    Thử lại
                  </button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center py-20 gap-3">
                  <Car size={48} className="text-gray-300" />
                  <p className="text-gray-500">Bạn chưa có đơn đặt xe nào.</p>
                  <button
                    onClick={() => setView("new")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition font-medium"
                  >
                    Đặt xe ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookings.map((b) => (
                    <HistoryCard
                      key={b.id}
                      booking={b}
                      onCancelled={() => fetchHistory()}
                      onPaymentDone={() => fetchHistory()}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-600">Trang {page + 1} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}