import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Check, X, CreditCard, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  getAllBookingsApi,
  confirmBookingApi,
  cancelBookingApi,
  processPaymentApi,
} from '../../api/bookingApi';

// ── helpers ────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  PENDING:     { label: 'Chờ duyệt',  cls: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:   { label: 'Đã duyệt',   cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Đang thuê',  cls: 'bg-purple-100 text-purple-700' },
  COMPLETED:   { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Đã hủy',     cls: 'bg-red-100 text-red-600' },
  OVERDUE:     { label: 'Quá hạn',    cls: 'bg-orange-100 text-orange-700' },
};

const PAY_STATUS_CLS = {
  PAID:   'bg-green-50 text-green-700',
  UNPAID: 'bg-red-50 text-red-600',
};

const fmt = (amount) =>
  amount != null ? Number(amount).toLocaleString('vi-VN') + ' đ' : '—';

const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString('vi-VN') : '—';

// ── Payment method options ─────────────────────────────────────────────────
const PAY_METHODS = [
  { value: 'CASH',          label: '💵 Tiền mặt' },
  { value: 'E_WALLET',      label: '📱 Ví điện tử (Momo / ZaloPay)' },
  { value: 'BANK_TRANSFER', label: '🏦 Chuyển khoản ngân hàng' },
  { value: 'CREDIT_CARD',   label: '💳 Thẻ tín dụng' },
];

// ── Component ──────────────────────────────────────────────────────────────
const AdminBookings = () => {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Payment modal state
  const [payModal, setPayModal]       = useState(null); // { booking, invoice }
  const [payMethod, setPayMethod]     = useState('CASH');
  const [paying, setPaying]           = useState(false);

  // Detail modal state
  const [detailModal, setDetailModal] = useState(null);

  const PAGE_SIZE = 10;

  // ── Load bookings ────────────────────────────────────────────────────────
  const loadBookings = useCallback(async (p = 0, status = '') => {
    setLoading(true);
    try {
      const res = await getAllBookingsApi(status || null, p, PAGE_SIZE);
      const data = res.data?.data ?? res.data;
      setBookings(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch (err) {
      console.error('Load bookings error:', err);
      Swal.fire('Lỗi', 'Không thể tải danh sách đặt xe.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings(page, filterStatus);
  }, [page, filterStatus, loadBookings]);

  const reload = () => loadBookings(page, filterStatus);

  // ── Confirm booking ──────────────────────────────────────────────────────
  const handleConfirm = async (booking) => {
    const result = await Swal.fire({
      title: 'Duyệt đơn hàng?',
      html: `Xác nhận booking <b>${booking.bookingCode}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Duyệt ngay',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();
      await confirmBookingApi(booking.id);
      Swal.fire('Đã duyệt!', 'Hóa đơn RENTAL đã được tạo tự động.', 'success');
      reload();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message ?? 'Không thể xác nhận.', 'error');
    }
  };

  // ── Cancel booking ───────────────────────────────────────────────────────
  const handleCancel = async (booking) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Từ chối / Hủy đơn?',
      input: 'text',
      inputLabel: 'Lý do hủy (tuỳ chọn)',
      inputPlaceholder: 'Nhập lý do...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Hủy đơn',
      cancelButtonText: 'Không',
    });
    if (!isConfirmed) return;

    try {
      Swal.showLoading();
      await cancelBookingApi(booking.id, reason ?? '');
      Swal.fire('Đã hủy!', '', 'success');
      reload();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message ?? 'Không thể hủy.', 'error');
    }
  };

  // ── Open payment modal ───────────────────────────────────────────────────
  const handleOpenPayment = (booking) => {
    const unpaidInvoice = booking.invoices?.find(inv => inv.status === 'UNPAID');
    if (!unpaidInvoice) {
      Swal.fire('Thông báo', 'Không có hóa đơn chưa thanh toán.', 'info');
      return;
    }
    setPayMethod('CASH');
    setPayModal({ booking, invoice: unpaidInvoice });
  };

  // ── Submit payment ───────────────────────────────────────────────────────
  const handlePaySubmit = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      const res = await processPaymentApi(
        payModal.invoice.id,
        payMethod,
        payModal.invoice.amount,
      );
      const payRes = res.data?.data;

      if (payRes?.status === 'PAID') {
        setPayModal(null);
        Swal.fire({
          icon: 'success',
          title: 'Thanh toán thành công!',
          html: `
            <p>Hóa đơn <b>#${payRes.invoiceId}</b></p>
            <p>Số tiền: <b>${fmt(payRes.amount)}</b></p>
            <p>Phương thức: <b>${PAY_METHODS.find(m => m.value === payMethod)?.label}</b></p>
            ${payRes.qrCodeData ? `<p class="text-xs text-gray-400 mt-2">${payRes.qrCodeData}</p>` : ''}
          `,
        });
        reload();
      } else {
        Swal.fire('Thông báo', payRes?.message ?? 'Kết quả không xác định.', 'warning');
      }
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message ?? 'Thanh toán thất bại.', 'error');
    } finally {
      setPaying(false);
    }
  };

  // ── Render invoice badges ─────────────────────────────────────────────────
  const renderInvoiceBadge = (booking) => {
    if (!booking.invoices || booking.invoices.length === 0) {
      return <span className="text-xs text-gray-400">—</span>;
    }
    return booking.invoices.map(inv => (
      <span
        key={inv.id}
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${PAY_STATUS_CLS[inv.status] ?? 'bg-gray-50 text-gray-500'}`}
      >
        {inv.status === 'PAID' ? '✓ Đã TT' : '✗ Chưa TT'}
      </span>
    ));
  };

  // ── Unit time range ──────────────────────────────────────────────────────
  const getDateRange = (booking) => {
    const units = booking.rentalUnits ?? [];
    if (units.length === 0) return '—';
    const start = units.map(u => u.startTime).filter(Boolean).sort()[0];
    const end   = units.map(u => u.endTime).filter(Boolean).sort().reverse()[0];
    return `${fmtDate(start)} → ${fmtDate(end)}`;
  };

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý đặt xe</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          {/* Refresh */}
          <button
            onClick={reload}
            className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Total */}
      {!loading && (
        <p className="text-sm text-gray-500">
          Tổng: <b>{totalElements}</b> booking
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thanh toán</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Đang tải...</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Không có booking nào.</td>
              </tr>
            ) : (
              bookings.map((b) => {
                const sm = STATUS_MAP[b.status] ?? { label: b.status, cls: 'bg-gray-100 text-gray-600' };
                const hasUnpaid = b.invoices?.some(inv => inv.status === 'UNPAID');
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-medium text-gray-600">{b.bookingCode}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{b.customerName ?? b.userId}</p>
                      {b.customerEmail && <p className="text-xs text-gray-400">{b.customerEmail}</p>}
                    </td>
                    <td className="p-4 text-gray-500">{getDateRange(b)}</td>
                    <td className="p-4 font-bold text-gray-800">{fmt(b.totalAmount)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sm.cls}`}>
                        {sm.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {renderInvoiceBadge(b)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {/* Confirm */}
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleConfirm(b)}
                            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                            title="Duyệt đơn"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        {/* Cancel */}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleCancel(b)}
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            title="Hủy đơn"
                          >
                            <X size={15} />
                          </button>
                        )}
                        {/* Payment */}
                        {b.status === 'CONFIRMED' && hasUnpaid && (
                          <button
                            onClick={() => handleOpenPayment(b)}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                            title="Thanh toán"
                          >
                            <CreditCard size={15} />
                          </button>
                        )}
                        {/* Detail */}
                        <button
                          onClick={() => setDetailModal(b)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                          title="Chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Payment Modal ─────────────────────────────────────────────────── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !paying && setPayModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-800">Thanh toán hóa đơn</h3>

            {/* Invoice info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mã booking</span>
                <span className="font-mono font-medium">{payModal.booking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Khách hàng</span>
                <span className="font-medium">{payModal.booking.customerName ?? payModal.booking.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Loại hóa đơn</span>
                <span className="font-medium">{payModal.invoice.type}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-semibold">Số tiền</span>
                <span className="text-blue-600 font-bold text-base">{fmt(payModal.invoice.amount)}</span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Chọn phương thức thanh toán</p>
              <div className="space-y-2">
                {PAY_METHODS.map(m => (
                  <label
                    key={m.value}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                      payMethod === m.value
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={m.value}
                      checked={payMethod === m.value}
                      onChange={() => setPayMethod(m.value)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPayModal(null)}
                disabled={paying}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                onClick={handlePaySubmit}
                disabled={paying}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                {paying ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết booking</h3>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Mã booking" value={detailModal.bookingCode} mono />
              <Row label="Khách hàng" value={detailModal.customerName ?? detailModal.userId} />
              <Row label="Email" value={detailModal.customerEmail} />
              <Row label="SĐT" value={detailModal.customerPhone} />
              <Row label="Giao xe" value={detailModal.deliveryMode === 'DELIVERY' ? `Giao tận nơi — ${detailModal.deliveryAddress}` : 'Tự đến lấy'} />
              <Row label="Tổng tiền" value={fmt(detailModal.totalAmount)} />
              <Row label="Trạng thái" value={STATUS_MAP[detailModal.status]?.label ?? detailModal.status} />
              <Row label="Tạo lúc" value={detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleString('vi-VN') : '—'} />
            </div>

            {/* Rental units */}
            {detailModal.rentalUnits?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">Xe thuê</p>
                <div className="space-y-2">
                  {detailModal.rentalUnits.map(u => (
                    <div key={u.id} className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                      <p><span className="text-gray-500">Biển số:</span> <b>{u.vehiclePlateNumber ?? `#${u.vehicleId}`}</b></p>
                      <p><span className="text-gray-500">Xe:</span> {u.vehicleBrand} {u.vehicleModel}</p>
                      <p><span className="text-gray-500">Thời gian:</span> {fmtDate(u.startTime)} → {fmtDate(u.endTime)}</p>
                      <p><span className="text-gray-500">Đơn giá:</span> <b>{fmt(u.unitPrice)}</b></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices */}
            {detailModal.invoices?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">Hóa đơn</p>
                <div className="space-y-2">
                  {detailModal.invoices.map(inv => (
                    <div key={inv.id} className="bg-gray-50 rounded-lg p-3 text-sm flex justify-between items-center">
                      <div>
                        <p className="font-medium">{inv.type} — {fmt(inv.amount)}</p>
                        {inv.paidAt && <p className="text-xs text-gray-400">{new Date(inv.paidAt).toLocaleString('vi-VN')}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PAY_STATUS_CLS[inv.status] ?? ''}`}>
                        {inv.status === 'PAID' ? '✓ Đã TT' : '✗ Chưa TT'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Small helper component
const Row = ({ label, value, mono }) => (
  <div className="flex justify-between gap-4">
    <span className="text-gray-500 flex-shrink-0">{label}</span>
    <span className={`text-right font-medium text-gray-800 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
  </div>
);

export default AdminBookings;
