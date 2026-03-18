import React, { useState, useEffect } from 'react';
import { Shield, Ban, CheckCircle, Plus, Edit, Trash2, X, Key, Search, Eye, EyeOff, UserCog } from 'lucide-react';
import {
  getAllUsersApi,
  searchUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  activateUserApi,
  deactivateUserApi,
  resetUserPasswordApi
} from '../../api/adminUserApi';
import { getAllRolesApi } from '../../api/roleApi';
import { useNotification } from '../../context/NotificationContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Roles
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State hỗ trợ giao diện
  const [showPass, setShowPass] = useState(false);
  const { notifySuccess, notifyError, notifyConfirm } = useNotification();

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    roleId: null,
    isActive: true
  });

  const [newPassword, setNewPassword] = useState('');

  // Hàm tạo password ngẫu nhiên
  const generateRandomPassword = () => {
    const chars = "ABCabc123!@#$";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await getAllRolesApi();
      setRoles(response.data || []);
      const customerRole = response.data?.find(r => r.name === 'CUSTOMER');
      if (customerRole && !formData.roleId) {
        setFormData(prev => ({ ...prev, roleId: customerRole.id }));
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (searchKeyword || filterActive !== '') {
        const searchParams = {
          page,
          size,
          keyword: searchKeyword || undefined,
          isActive: filterActive === '' ? undefined : filterActive === 'true'
        };
        response = await searchUsersApi(searchParams);
      } else {
        response = await getAllUsersApi({ page, size });
      }
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  // 👇 SỬA LẠI: Thêm Modal Xác Nhận khi Khóa/Mở khóa
  const handleToggleStatus = (user) => {
    const actionName = user.isActive ? 'khóa' : 'mở khóa';
    const confirmText = user.isActive 
      ? `Bạn có chắc chắn muốn KHÓA tài khoản ${user.email}? Người dùng sẽ không thể đăng nhập.`
      : `Bạn có muốn MỞ KHÓA cho tài khoản ${user.email}?`;

    notifyConfirm(
      `Xác nhận ${actionName}?`,
      confirmText,
      async () => {
        try {
          if (user.isActive) {
            await deactivateUserApi(user.userId);
          } else {
            await activateUserApi(user.userId);
          }
          notifySuccess(`Đã ${actionName} tài khoản thành công!`);
          fetchUsers();
        } catch (err) {
          console.error('Error toggling user status:', err);
          notifyError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
      }
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUserApi(formData);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      notifySuccess('Tạo người dùng mới thành công!');
    } catch (err) {
      console.error('Error creating user:', err);
      notifyError(err.response?.data?.message || 'Không thể tạo người dùng');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { password, ...updateData } = formData;
      await updateUserApi(selectedUser.userId, updateData);
      setShowEditModal(false);
      resetForm();
      fetchUsers();
      notifySuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Error updating user:', err);
      notifyError(err.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  };

  const handleDelete = (userId) => {
    notifyConfirm(
      'Xóa người dùng?', 
      'Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Hành động này không thể hoàn tác.', 
      async () => {
        try {
          await deleteUserApi(userId);
          fetchUsers();
          notifySuccess('Đã xóa người dùng thành công!');
        } catch (err) {
          console.error('Error deleting user:', err);
          notifyError(err.response?.data?.message || 'Không thể xóa người dùng');
        }
      }
    );
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetUserPasswordApi(selectedUser.userId, { newPassword });
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      notifySuccess('Reset mật khẩu thành công!');
    } catch (err) {
      console.error('Error resetting password:', err);
      notifyError(err.response?.data?.message || 'Không thể reset mật khẩu');
    }
  };

  const openEditModal = async (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || '',
      gender: user.gender || '',
      dob: user.dob || '',
      roleId: user.role.id,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      password: '',
      phone: '',
      gender: '',
      dob: '',
      roleId: 2,
      isActive: true
    });
    setSelectedUser(null);
    setNewPassword('');
    setShowPass(false);
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'ADMIN': return 'text-purple-600 bg-purple-50';
      case 'STAFF': return 'text-blue-600 bg-blue-50';
      case 'CUSTOMER': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          <Plus size={20} />
          Tạo người dùng mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Đã khóa</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Search size={18} />
          Tìm kiếm
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có người dùng nào</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
              <tr>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.fullName}</td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getRoleBadgeColor(user.role.name)}`}>
                      {user.role.name === 'ADMIN' && <Shield size={14} />}
                      {user.role.name}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.isActive
                      ? <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle size={14} /> Hoạt động</span>
                      : <span className="text-red-600 text-sm flex items-center gap-1"><Ban size={14} /> Đã khóa</span>
                    }
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Chỉnh sửa">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => openPasswordModal(user)} className="text-orange-500 hover:text-orange-700 p-1 rounded hover:bg-orange-50" title="Reset mật khẩu">
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user)} 
                        className={`${user.isActive ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'} p-1 rounded`} 
                        title={user.isActive ? 'Khóa' : 'Mở khóa'}
                      >
                        {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button onClick={() => handleDelete(user.userId)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination (Giữ nguyên logic cũ) */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Hiển thị {page * size + 1} - {Math.min((page + 1) * size, totalElements)} / {totalElements} người dùng</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">Trước</button>
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">Sau</button>
          </div>
        </div>
      )}

      {/* Create User Modal (Đã thêm nút Random Password) */}
      {showCreateModal && (
        <Modal title="Tạo người dùng mới" onClose={() => { setShowCreateModal(false); resetForm(); }}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <FormInput label="Họ tên *" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            
            {/* Password Field with Toggle & Random */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button type="button" onClick={() => {
                    const chars = "ABCabc123!@#";
                    let pass = "";
                    for(let i=0; i<8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                    setFormData({...formData, password: pass});
                }} className="absolute right-2 top-2 p-1 text-blue-600 hover:bg-blue-50 rounded" title="Random">
                  <Key size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                    <select value={formData.roleId || ''} onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled={rolesLoading}>
                        {rolesLoading ? <option>Đang tải...</option> : roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <FormInput label="Ngày sinh" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-blue-600" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Kích hoạt ngay</label>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Tạo người dùng</button>
              <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Hủy</button>
            </div>
          </form>
        </Modal>
      )}

      {/* 👇 EDIT USER MODAL - GIAO DIỆN ĐẸP MỚI */}
      {showEditModal && selectedUser && (
        <Modal title="" onClose={() => { setShowEditModal(false); resetForm(); }}>
          {/* Header Edit */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-50">
              <UserCog size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin</h3>
            <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin cá nhân và quyền hạn.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <FormInput label="Email (Không thể sửa)" type="email" value={formData.email} onChange={() => {}} disabled className="bg-gray-100 cursor-not-allowed text-gray-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Họ tên" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                <FormInput label="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <FormInput label="Ngày sinh" type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <select value={formData.roleId || ''} onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={rolesLoading}>
                {rolesLoading ? <option>Đang tải...</option> : roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <input type="checkbox" id="isActiveEdit" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700 select-none cursor-pointer">Tài khoản đang hoạt động</label>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition shadow-lg shadow-blue-200 transform active:scale-95">
                Lưu thay đổi
              </button>
              <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
                Hủy bỏ
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 👇 RESET PASSWORD MODAL (ĐẸP) */}
      {showPasswordModal && selectedUser && (
        <Modal title="" onClose={() => { setShowPasswordModal(false); setNewPassword(''); setSelectedUser(null); }}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-50">
              <Key size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Đặt lại mật khẩu</h3>
            <p className="text-gray-500 text-sm mt-1">Hành động này sẽ thay đổi mật khẩu đăng nhập của người dùng.</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              {selectedUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left overflow-hidden">
              <h4 className="font-bold text-gray-800 truncate">{selectedUser.fullName}</h4>
              <p className="text-sm text-gray-500 truncate">{selectedUser.email}</p>
            </div>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
              <div className="relative group">
                <input
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 pr-24 font-medium text-gray-700 transition-all group-hover:border-orange-300"
                  placeholder="Nhập mật khẩu mới..."
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-12 top-3 text-gray-400 hover:text-gray-600 p-1" title="Xem mật khẩu">
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button type="button" onClick={generateRandomPassword} className="absolute right-2 top-2 p-1.5 bg-gray-100 text-orange-600 rounded-lg hover:bg-orange-100 hover:scale-105 transition-all shadow-sm" title="Tạo ngẫu nhiên">
                  <Key size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 pl-1 italic">* Mật khẩu tự động cập nhật ngay sau khi bấm xác nhận.</p>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-200 transform active:scale-95">
                Xác nhận đổi
              </button>
              <button type="button" onClick={() => { setShowPasswordModal(false); setNewPassword(''); setSelectedUser(null); }} className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
                Hủy bỏ
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Reusable Components
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FormInput = ({ label, type = 'text', value, onChange, required = false, minLength, disabled, className, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} value={value} onChange={onChange} required={required} minLength={minLength} disabled={disabled} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
  </div>
);

export default AdminUsers;