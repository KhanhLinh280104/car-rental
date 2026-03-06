import React, { useState, useEffect } from 'react';
import { Battery, MapPin, Edit, Trash2, Plus, Zap, RefreshCw, Cpu } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  getAllVehiclesApi,
  getVehicleByIdApi,
  createVehicleApi,
  updateVehicleApi,
  deleteVehicleApi,
} from '../../api/vehicleApi';
import SimulatorConfigModal from '../../components/admin/SimulatorConfigModal';

const AdminFleet = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await getAllVehiclesApi({
        page: pagination.page,
        size: pagination.size,
        sortBy: "id",
        sortDir: "ASC"
      });

      const data = response.data.data; // ApiResponse wrapper
      setCars(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      }));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      Swal.fire('Lỗi', 'Không thể tải danh sách xe. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, [pagination.page]);

  // --- 1. XỬ LÝ THÊM XE MỚI ---
  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Thêm xe mới vào đội xe',
      html:
        '<input id="swal-plate" class="swal2-input" placeholder="Biển số (VD: 29A-12345)">' +
        '<input id="swal-vin" class="swal2-input" placeholder="VIN (17 ký tự)" maxlength="17">' +
        '<input id="swal-color" class="swal2-input" placeholder="Màu sắc (VD: White)">' +
        '<input id="swal-year" type="number" class="swal2-input" placeholder="Năm sản xuất (VD: 2024)" min="2020" max="2030">' +
        '<select id="swal-model" class="swal2-input">' +
        '<option value="1">VinFast VF8</option>' +
        '<option value="2">VinFast VF9</option>' +
        '</select>' +
        '<select id="swal-hub" class="swal2-input">' +
        '<option value="1">District 1 Hub</option>' +
        '<option value="2">Thu Duc Hub</option>' +
        '</select>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Thêm xe',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const plateNumber = document.getElementById('swal-plate').value;
        const vin = document.getElementById('swal-vin').value;
        const color = document.getElementById('swal-color').value;
        const manufactureYear = parseInt(document.getElementById('swal-year').value);

        // Validate plate number format: 29A-12345
        const plateRegex = /^[0-9]{2}[A-Z]-[0-9]{4,5}$/;
        if (!plateRegex.test(plateNumber)) {
          Swal.showValidationMessage('Biển số phải theo định dạng: 29A-12345 (2 số + 1 chữ + dấu gạch + 4-5 số)');
          return false;
        }

        // Validate VIN
        if (vin.length !== 17) {
          Swal.showValidationMessage('VIN phải đúng 17 ký tự');
          return false;
        }

        // Validate color
        if (!color.trim()) {
          Swal.showValidationMessage('Vui lòng nhập màu sắc');
          return false;
        }

        // Validate year
        if (isNaN(manufactureYear) || manufactureYear < 2020 || manufactureYear > 2030) {
          Swal.showValidationMessage('Năm sản xuất phải từ 2020 đến 2030');
          return false;
        }

        return {
          plateNumber,
          vin,
          color,
          manufactureYear,
          modelId: parseInt(document.getElementById('swal-model').value),
          fleetHubId: parseInt(document.getElementById('swal-hub').value),
          odometerKm: 0.0,
          isVirtual: true
        }
      }
    });

    if (formValues) {

      try {
        setLoading(true);
        await createVehicleApi(formValues);
        await fetchVehicles(); // Reload list
        Swal.fire('Thành công', 'Đã thêm xe mới vào hệ thống.', 'success');
      } catch (error) {
        console.error("Error creating vehicle:", error);
        Swal.fire('Lỗi', error.response?.data?.message || 'Không thể thêm xe. Vui lòng thử lại.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // --- 2. XỬ LÝ SỬA THÔNG TIN XE ---
  const handleEdit = async (car) => {
    const { value: formValues } = await Swal.fire({
      title: `Cập nhật xe: ${car.plateNumber}`,
      html:
        `<label class="block text-left text-sm font-bold mt-3">Màu sắc:</label>` +
        `<input id="swal-edit-color" class="swal2-input" value="${car.color}">` +

        `<label class="block text-left text-sm font-bold mt-3">Trạng thái:</label>` +
        `<select id="swal-edit-status" class="swal2-input">` +
        `<option value="AVAILABLE" ${car.status === 'AVAILABLE' ? 'selected' : ''}>Sẵn sàng (Available)</option>` +
        `<option value="MAINTENANCE" ${car.status === 'MAINTENANCE' ? 'selected' : ''}>Bảo trì (Maintenance)</option>` +
        `<option value="IN_USE" ${car.status === 'IN_USE' ? 'selected' : ''}>Đang sử dụng (In Use)</option>` +
        `<option value="CHARGING" ${car.status === 'CHARGING' ? 'selected' : ''}>Đang sạc (Charging)</option>` +
        `</select>` +

        `<label class="block text-left text-sm font-bold mt-3">Số km đã chạy:</label>` +
        `<input id="swal-edit-odometer" type="number" class="swal2-input" value="${car.odometerKm || 0}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      preConfirm: () => {
        return {
          color: document.getElementById('swal-edit-color').value,
          status: document.getElementById('swal-edit-status').value,
          odometerKm: parseFloat(document.getElementById('swal-edit-odometer').value)
        }
      }
    });

    if (formValues) {
      try {
        setLoading(true);
        await updateVehicleApi(car.id, formValues);
        await fetchVehicles(); // Reload list
        Swal.fire('Đã cập nhật', 'Thông tin xe đã được lưu.', 'success');
      } catch (error) {
        console.error("Error updating vehicle:", error);
        Swal.fire('Lỗi', error.response?.data?.message || 'Không thể cập nhật xe. Vui lòng thử lại.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // --- 3. XỬ LÝ XÓA XE ---
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Cảnh báo!',
      text: "Bạn có chắc chắn muốn xóa xe này khỏi đội xe?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await deleteVehicleApi(id);
          await fetchVehicles(); // Reload list
          Swal.fire('Đã xóa!', 'Xe đã bị loại bỏ khỏi danh sách.', 'success');
        } catch (error) {
          console.error("Error deleting vehicle:", error);
          Swal.fire('Lỗi', error.response?.data?.message || 'Không thể xóa xe. Vui lòng thử lại.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-700';
      case 'IN_USE': return 'bg-blue-100 text-blue-700';
      case 'MAINTENANCE': return 'bg-red-100 text-red-700';
      case 'CHARGING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'Sẵn sàng';
      case 'IN_USE': return 'Đang dùng';
      case 'MAINTENANCE': return 'Bảo trì';
      case 'CHARGING': return 'Đang sạc';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý đội xe & IoT</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSimulatorModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 font-medium transition"
          >
            <Cpu size={18} /> Simulator
          </button>
          <button
            onClick={fetchVehicles}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 font-medium transition disabled:opacity-50"
          >
            <Plus size={18} /> Thêm xe mới
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-4">Đang tải dữ liệu...</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">Thông tin xe</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">IoT: Pin</th>
              <th className="p-4">IoT: Vị trí (GPS)</th>
              <th className="p-4">Số km</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{car.model?.name || 'Unknown Model'}</p>
                  <p className="text-sm text-gray-500">{car.plateNumber} • {car.color}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(car.status)}`}>
                    {getStatusLabel(car.status)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 font-medium text-gray-700">
                      {(car.currentState?.batteryLevel || 0) < 20 ?
                        <Battery className="text-red-500" size={18} /> :
                        <Battery className="text-green-500" size={18} />
                      }
                      {car.currentState?.batteryLevel || 0}%
                    </div>
                    {car.currentState?.isCharging && <Zap size={14} className="text-yellow-500 animate-pulse" />}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-blue-500" />
                    {car.currentState?.latitude && car.currentState?.longitude ?
                      `${car.currentState.latitude.toFixed(4)}, ${car.currentState.longitude.toFixed(4)}` :
                      'Chưa cập nhật'
                    }
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{car.odometerKm?.toFixed(1) || 0} km</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(car)}
                      disabled={loading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                      title="Sửa thông tin"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Xóa xe"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && !loading && (
          <p className="text-center p-8 text-gray-500">Chưa có xe nào trong hệ thống.</p>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
            disabled={pagination.page === 0 || loading}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {pagination.page + 1} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
            disabled={pagination.page >= pagination.totalPages - 1 || loading}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Simulator Config Modal */}
      <SimulatorConfigModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
      />
    </div>
  );
};

export default AdminFleet;