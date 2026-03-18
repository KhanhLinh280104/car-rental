import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { registerApi } from "../api/authApi";
import { useNotification } from "../context/NotificationContext"; // 1. Import

const RegisterModal = ({ close, goLogin, onSuccess }) => {
  const [show, setShow] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { notifySuccess, notifyError } = useNotification(); // 2. Lấy hàm

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(close, 200);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      notifyError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!agree) return;

    try {
      await registerApi({ fullName, phoneNumber, email, password });
      
      handleClose();
      
      // 3. Thông báo thành công -> Chuyển sang Login
      notifySuccess("Đăng ký thành công! Vui lòng đăng nhập.", () => {
          if (onSuccess) onSuccess(); // Logic cũ (nếu có)
          else if (goLogin) goLogin(); // Mở modal Login
      });

    } catch (error) {
      console.error("Register Error:", error);
      notifyError(error.response?.data?.message || "Đăng ký thất bại: " + error.message);
    }
  };

  // --- PHẦN GIAO DIỆN GIỮ NGUYÊN ---
  // (Tôi chỉ copy đoạn logic, phần UI bên dưới y hệt file cũ của bạn, nhớ copy cả phần return vào nhé)
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} onClick={handleClose} />

      <div className={`relative bg-white w-[420px] p-8 rounded-2xl shadow-2xl z-10 max-h-[120vh] overflow-y-auto transform transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X /></button>

        <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Họ và tên</label>
          <input placeholder="Nhập vào" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Số điện thoại</label>
          <input placeholder="Nhập vào" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input placeholder="Nhập vào" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <div className="relative">
            <input placeholder="Nhập mật khẩu" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded-lg pr-10 outline-none focus:ring-2 focus:ring-green-500" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-gray-500">{showPass ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Xác nhận mật khẩu</label>
          <div className="relative">
            <input placeholder="Nhập mật khẩu" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border p-2 rounded-lg pr-10 outline-none focus:ring-2 focus:ring-green-500" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-gray-500">{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
        </div>

        <div className="flex items-start gap-2 mb-5">
          <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} className="mt-1 accent-green-600" />
          <p className="text-sm text-gray-600">Tôi đồng ý với <span className="text-green-600 font-semibold cursor-pointer">điều khoản sử dụng</span></p>
        </div>

        <button onClick={handleRegister} disabled={!agree} className={`w-full py-2 rounded-lg font-semibold transition ${agree ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>Đăng ký</button>
      </div>
    </div>
  );
};

export default RegisterModal;