import { useState } from "react";
import { Edit2, Save, X, AlertCircle, CheckCircle, Eye, EyeOff, Lock, Trash2 } from "lucide-react";

export default function DriverProfile() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn A",
    email: "driver@example.com",
    phone: "0987654321",
    licenseNumber: "DL123456789",
    licenseExpiry: "2026-12-31",
    vehicle: "Toyota Vios - Biển số 51K-123.45",
    joinDate: "2024-01-15",
  });

  const [editData, setEditData] = useState(profileData);

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteAccountData, setDeleteAccountData] = useState({
    password: "",
    confirmText: "",
  });

  // Handle profile edit
  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditData(profileData);
  };

  const handleSaveProfile = () => {
    if (!editData.fullName || !editData.phone || !editData.licenseNumber) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin bắt buộc!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setProfileData(editData);
    setIsEditingProfile(false);
    setSuccessMessage("Thông tin cá nhân được cập nhật thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  // Handle change password
  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMessage("Vui lòng điền đầy đủ các trường!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Mật khẩu mới không trùng khớp!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải ít nhất 6 ký tự!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setSuccessMessage("Mật khẩu đã được thay đổi thành công!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsChangingPassword(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (!deleteAccountData.password || deleteAccountData.confirmText !== "XÓA TÀI KHOẢN CỦA TÔI") {
      setErrorMessage("Vui lòng xác nhận để xóa tài khoản!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setSuccessMessage("Tài khoản đã được xóa thành công!");
    setDeleteAccountData({ password: "", confirmText: "" });
    setIsDeletingAccount(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700 font-medium">{errorMessage}</span>
        </div>
      )}

      {/* === PROFILE SECTION === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
          {!isEditingProfile && (
            <button
              onClick={handleEditProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Edit2 size={18} />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>

        {isEditingProfile ? (
          // Edit Form
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số bằng lái xe *</label>
                <input
                  type="text"
                  value={editData.licenseNumber}
                  onChange={(e) => setEditData({ ...editData, licenseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn bằng</label>
                <input
                  type="date"
                  value={editData.licenseExpiry}
                  onChange={(e) => setEditData({ ...editData, licenseExpiry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Save size={18} />
                <span>Lưu</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                <X size={18} />
                <span>Hủy</span>
              </button>
            </div>
          </div>
        ) : (
          // View Profile
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                <p className="text-lg font-semibold text-gray-800">{profileData.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-800">{profileData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <p className="text-lg font-semibold text-gray-800">{profileData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số bằng lái xe</p>
                <p className="text-lg font-semibold text-gray-800">{profileData.licenseNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ngày hết hạn bằng</p>
                <p className="text-lg font-semibold text-gray-800">{profileData.licenseExpiry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Xe được phân công</p>
                <p className="text-lg font-semibold text-gray-800">{profileData.vehicle}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày tham gia</p>
              <p className="text-lg font-semibold text-gray-800">{profileData.joinDate}</p>
            </div>
          </div>
        )}
      </div>

      {/* === CHANGE PASSWORD SECTION === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Lock size={24} className="text-orange-500" />
            <span>Đổi mật khẩu</span>
          </h2>
        </div>

        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Đổi mật khẩu
          </button>
        ) : (
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleChangePassword}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === DELETE ACCOUNT SECTION === */}
      <div className="bg-red-50 rounded-xl shadow-md border border-red-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-700 flex items-center space-x-2">
            <Trash2 size={24} />
            <span>Xóa tài khoản</span>
          </h2>
        </div>

        {!isDeletingAccount ? (
          <div className="space-y-4">
            <p className="text-red-700 font-medium">⚠️ Cảnh báo: Hành động này không thể hoàn tác!</p>
            <button
              onClick={() => setIsDeletingAccount(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Xóa tài khoản
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-md bg-white p-6 rounded-lg">
            <p className="text-red-700 font-semibold mb-4">Bạn chắc chắn muốn xóa tài khoản?</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu của bạn *</label>
              <input
                type="password"
                value={deleteAccountData.password}
                onChange={(e) => setDeleteAccountData({ ...deleteAccountData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập "XÓA TÀI KHOẢN CỦA TÔI" để xác nhận *
              </label>
              <input
                type="text"
                value={deleteAccountData.confirmText}
                onChange={(e) => setDeleteAccountData({ ...deleteAccountData, confirmText: e.target.value })}
                placeholder="XÓA TÀI KHOẢN CỦA TÔI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa vĩnh viễn
              </button>
              <button
                onClick={() => {
                  setIsDeletingAccount(false);
                  setDeleteAccountData({ password: "", confirmText: "" });
                }}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
