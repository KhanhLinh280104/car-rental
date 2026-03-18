import { useEffect, useState } from "react";
import { X, CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import paymentApi from "../api/paymentApi";

const PaymentModal = ({ invoiceId, amount, onSuccess, onClose }) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200);
  };

  const handlePayment = async () => {
    if (!invoiceId || !amount) {
      notifyError("Thiếu thông tin hóa đơn!");
      return;
    }

    try {
      setLoading(true);

      const paymentData = {
        invoiceId: parseInt(invoiceId),
        paymentMethodType: paymentMethod,
        amount: parseFloat(amount),
      };

      const response = await paymentApi.processPayment(paymentData);

      if (response.data.success) {
        const { data } = response.data;
        notifySuccess(data.message || "Thanh toán thành công!");

        if (paymentMethod === "E_WALLET" && data.qrCodeData) {
          setQrCodeData(data.qrCodeData);
        } else {
          setPaymentSuccess(true);
        }

        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        notifyError("Thanh toán thất bại!");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      notifyError("Lỗi thanh toán. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-white w-96 p-8 rounded-2xl shadow-2xl z-10 transform transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Thanh toán</h2>

        {!paymentSuccess && !qrCodeData && (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Mã hóa đơn:</div>
              <div className="font-semibold">{invoiceId}</div>
              <div className="text-sm text-gray-600 mt-2">Số tiền:</div>
              <div className="font-semibold text-lg text-green-600">{amount} VND</div>
            </div>

            <div className="mb-6">
              <label className="block mb-3 font-medium">Chọn phương thức thanh toán</label>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 ${
                    paymentMethod === "CASH"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300"
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Tiền mặt</div>
                    <div className="text-sm opacity-75">Thanh toán khi nhận xe</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("E_WALLET")}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 ${
                    paymentMethod === "E_WALLET"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300"
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Ví điện tử</div>
                    <div className="text-sm opacity-75">Quét mã QR để thanh toán</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold flex justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : "Thanh toán"}
            </button>
          </>
        )}

        {qrCodeData && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">Quét mã QR để thanh toán</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-2">Mã QR:</div>
              <div className="font-mono text-sm bg-white p-2 rounded border break-all">
                {qrCodeData}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sử dụng ứng dụng ví điện tử để quét mã QR này
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Đã thanh toán
            </button>
          </div>
        )}

        {paymentSuccess && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Thanh toán thành công!</h3>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã thanh toán bằng tiền mặt.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;