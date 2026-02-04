import React, { useState, useEffect } from 'react';
import { Shield, Ban, CheckCircle, Plus, Edit, Trash2, X, Key, Search } from 'lucide-react';
import {
  getAllUsersApi,
  searchUsersApi,
  getUserByIdApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  activateUserApi,
  deactivateUserApi,
  resetUserPasswordApi
} from '../../api/adminUserApi';
import { getAllRolesApi } from '../../api/roleApi';

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

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    roleId: null, // Will be set after roles are loaded
    isActive: true
  });

  const [newPassword, setNewPassword] = useState('');

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch users on component mount and when page changes
  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await getAllRolesApi();
      setRoles(response.data || []);

      // Set default roleId to CUSTOMER if available
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
    setPage(0); // Reset to first page
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.isActive) {
        await deactivateUserApi(user.userId);
      } else {
        await activateUserApi(user.userId);
      }
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái người dùng');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUserApi(formData);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      alert('Tạo người dùng thành công!');
    } catch (err) {
      console.error('Error creating user:', err);
      alert(err.response?.data?.message || 'Không thể tạo người dùng');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { password, ...updateData } = formData; // Remove password from update
      await updateUserApi(selectedUser.userId, updateData);
      setShowEditModal(false);
      resetForm();
      fetchUsers();
      alert('Cập nhật người dùng thành công!');
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      await deleteUserApi(userId);
      fetchUsers();
      alert('Xóa người dùng thành công!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetUserPasswordApi(selectedUser.userId, { newPassword });
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      alert('Reset mật khẩu thành công!');
    } catch (err) {
      console.error('Error resetting password:', err);
      alert(err.response?.data?.message || 'Không thể reset mật khẩu');
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openPasswordModal(user)}
                        className="text-orange-500 hover:text-orange-700 p-1"
                        title="Reset mật khẩu"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`${user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} p-1`}
                        title={user.isActive ? 'Khóa' : 'Mở khóa'}
                      >
                        {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Xóa"
                      >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Hiển thị {page * size + 1} - {Math.min((page + 1) * size, totalElements)} / {totalElements} người dùng
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <Modal title="Tạo người dùng mới" onClose={() => { setShowCreateModal(false); resetForm(); }}>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormInput
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label="Họ tên *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <FormInput
              label="Mật khẩu *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
            <FormInput
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <FormInput
                label="Ngày sinh"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
              <select
                value={formData.roleId || ''}
                onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <option value="">Đang tải...</option>
                ) : (
                  roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))
                )}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Kích hoạt ngay</label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Tạo người dùng
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal title="Chỉnh sửa người dùng" onClose={() => { setShowEditModal(false); resetForm(); }}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormInput
              label="Họ tên"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <FormInput
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <FormInput
                label="Ngày sinh"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <select
                value={formData.roleId || ''}
                onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <option value="">Đang tải...</option>
                ) : (
                  roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))
                )}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="isActiveEdit" className="text-sm text-gray-700">Tài khoản hoạt động</label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <Modal title="Reset mật khẩu" onClose={() => { setShowPasswordModal(false); setNewPassword(''); setSelectedUser(null); }}>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-gray-600">
              Reset mật khẩu cho: <strong>{selectedUser.fullName}</strong> ({selectedUser.email})
            </p>
            <FormInput
              label="Mật khẩu mới *"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Reset mật khẩu
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordModal(false); setNewPassword(''); setSelectedUser(null); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Reusable Modal Component
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

// Reusable Form Input Component
const FormInput = ({ label, type = 'text', value, onChange, required = false, minLength, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

export default AdminUsers;