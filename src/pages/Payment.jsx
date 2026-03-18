import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// API endpoint
const PAYMENT_API = "/api/payments/process";
const BOOKING_API = "/api/bookings";

const PaymentPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState("CASH");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lấy booking theo id từ API
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${BOOKING_API}/${id}`);
        setBooking(res.data?.data || res.data);
        setAmount(res.data?.data?.totalAmount || res.data?.totalAmount || 0);
      } catch (e) {
        setError("Không tìm thấy booking hoặc lỗi kết nối.");
      }
    };
    fetchBooking();
  }, [id]);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(PAYMENT_API, {
        invoiceId: booking.invoiceId || booking.id,
        paymentMethodType: method,
        amount: Number(amount),
      });
      setResult(res.data?.data || res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="max-w-md mx-auto mt-10 text-red-600">{error}</div>;
  if (!booking) return <div className="max-w-md mx-auto mt-10 text-gray-500">Đang tải booking...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Thanh toán cho Booking #{booking?.id}</h2>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Số tiền</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Phương thức thanh toán</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={method}
          onChange={e => setMethod(e.target.value)}
        >
          <option value="CASH">Tiền mặt</option>
          <option value="E-WALLET">Ví điện tử (QR)</option>
        </select>
      </div>
      <button
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-2 disabled:opacity-60"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Thanh toán"}
      </button>
      {error && <div className="mt-3 text-red-600">{error}</div>}
      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="font-bold text-green-700 mb-2">Thanh toán thành công!</div>
          <div>Mã hóa đơn: {result.invoiceId}</div>
          <div>Trạng thái: {result.status}</div>
          <div>Số tiền: {result.amount}</div>
          {method === "E-WALLET" && result.qrCodeData && (
            <div className="mt-3">
              <div className="mb-1 font-medium">Quét mã QR để thanh toán:</div>
              <img src={result.qrCodeData} alt="QR Code" style={{ maxWidth: 200 }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
