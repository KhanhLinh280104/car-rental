import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

const LoginModal = ({ close, goRegister }) => {
  const [show, setShow] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(close, 200);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white w-96 p-8 rounded-2xl shadow-2xl z-10 transform transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
             placeholder="Nhập email"
            type="email"
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <div className="relative">
            <input
              placeholder="Nhập mật khẩu"
              type={showPass ? "text" : "password"}
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

        <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold">
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
