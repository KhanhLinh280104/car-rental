import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

const RegisterModal = ({ close, goLogin }) => {
  const [show, setShow] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(close, 200);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-white w-[420px] p-8 rounded-2xl shadow-2xl z-10 max-h-[120vh] overflow-y-auto transform transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>

        {[
          { label: "Họ và tên", type: "text" },
          { label: "Số điện thoại", type: "tel" },
          { label: "Email", type: "email" },
          { label: "Ngày sinh", type: "date" },
        ].map((item, i) => (
          <div className="mb-4" key={i}>
            <label className="block mb-1 font-medium">{item.label}</label>
            <input
              placeholder="Nhập vào"
              type={item.type}
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        ))}

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <div className="relative">
            <input
            placeholder="Nhập mật khẩu"
              type={showPass ? "text" : "password"}
              className="w-full border p-2 rounded-lg pr-10"
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

        {/* Confirm */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Xác nhận mật khẩu</label>
          <div className="relative">
            <input
            placeholder="Nhập mật khẩu"
              type={showConfirm ? "text" : "password"}
              className="w-full border p-2 rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 mb-5">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            className="mt-1 accent-green-600"
          />
          <p className="text-sm text-gray-600">
            Tôi đồng ý với{" "}
            <span className="text-green-600 font-semibold cursor-pointer">
              điều khoản sử dụng
            </span>
          </p>
        </div>

        <button
          disabled={!agree}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            agree
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Đăng ký
        </button>

        
      </div>
    </div>
  );
};

export default RegisterModal;
