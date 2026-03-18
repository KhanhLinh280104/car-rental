import { useEffect, useState } from "react";
import { Eye, EyeOff, X, CheckCircle } from "lucide-react";
import { loginApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";
// 👇 1. Import Hook thông báo
import { useNotification } from "../context/NotificationContext";

const LoginModal = ({ close, goRegister, successMessage }) => {
  const [show, setShow] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // 👇 2. Lấy hàm notifyError từ Context
  const { notifyError } = useNotification();

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(close, 200);
  };

  const handleLogin = async () => {
    // Validate cơ bản
    if (!email || !password) {
      notifyError("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    try {
      const res = await loginApi({ email, password });

      const token = res.data.accessToken;
      const refreshToken = res.data.refreshToken;
      const role = res.data.role;

      // Lấy userId UUID từ response (ưu tiên), fallback decode JWT nếu server cũ
      let userId = res.data.userId;
      if (!userId) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.userId || payload.sub;
        } catch (_) { /* ignore */ }
      }
      if (userId) localStorage.setItem("userId", userId);

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);

      handleClose();

      if (role === "ADMIN") navigate("/admin");
      else if (role === "STAFF") navigate("/staff");
      else if (role === "DRIVER") navigate("/driver");
      else navigate("/user");

    } catch (err) {
      console.error("Login Error:", err);

      notifyError("Bạn đã nhập sai mật khẩu hoặc sai email đăng nhập, vui lòng thử lại");
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

        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

        {/* Nếu có tin nhắn thành công từ trang Register chuyển sang thì hiện ở đây */}
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 animate-pulse">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            placeholder="Nhập email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <div className="relative">
            <input
              placeholder="Nhập mật khẩu"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded-lg pr-10 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <p className="text-sm text-center text-gray-500 mt-3 mb-5">
          Chưa có tài khoản?{" "}
          <span
            onClick={goRegister}
            className="text-green-600 font-semibold cursor-pointer hover:underline"
          >
            Đăng ký
          </span>
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default LoginModal;