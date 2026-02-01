import React, { useState } from 'react';
import { Battery, MapPin, Edit, Trash2, Plus, Zap } from 'lucide-react';
import Swal from 'sweetalert2';

// --- MOCK DATA ---
const MOCK_FLEET = [
  { id: 1, name: "VinFast VF8", plate: "51K-123.45", type: "SUV", status: "Available", battery: 85, location: "Bãi xe Q1", maintenanceDue: "2026-03-15" },
  { id: 2, name: "VinFast VF e34", plate: "51H-987.65", type: "Crossover", status: "Rented", battery: 45, location: "Đang di chuyển (Q7)", maintenanceDue: "2026-04-01" },
  { id: 3, name: "Tesla Model 3", plate: "30A-555.88", type: "Sedan", status: "Maintenance", battery: 12, location: "Garage Center", maintenanceDue: "2026-02-01" },
  { id: 4, name: "Kia Carnival", plate: "59Z-999.99", type: "MPV", status: "Available", battery: 100, location: "Bãi xe Q3", maintenanceDue: "2026-05-20" },
];

const AdminFleet = () => {
  const [cars, setCars] = useState(MOCK_FLEET);

  // --- 1. XỬ LÝ THÊM XE MỚI (Full Option theo SRS) ---
  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Thêm xe mới vào đội xe',
      html:
        '<input id="swal-name" class="swal2-input" placeholder="Tên xe (VD: VinFast VF9)">' +
        '<input id="swal-plate" class="swal2-input" placeholder="Biển số (VD: 59A-123.45)">' +
        '<select id="swal-type" class="swal2-input">' +
          '<option value="SUV">SUV</option>' +
          '<option value="Sedan">Sedan</option>' +
          '<option value="MPV">MPV</option>' +
          '<option value="Crossover">Crossover</option>' +
        '</select>' +
        '<input id="swal-maintenance" type="date" class="swal2-input" placeholder="Hạn bảo trì">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Thêm xe',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        return [
          document.getElementById('swal-name').value,
          document.getElementById('swal-plate').value,
          document.getElementById('swal-type').value,
          document.getElementById('swal-maintenance').value
        ]
      }
    });

    if (formValues) {
      const [name, plate, type, maintenance] = formValues;
      
      // Validate dữ liệu cơ bản
      if (!name || !plate) {
        Swal.fire('Lỗi', 'Vui lòng nhập tên và biển số xe!', 'error');
        return;
      }

      const newCar = {
        id: Date.now(),
        name: name,
        plate: plate,
        type: type,
        status: "Available", // Mặc định xe mới là sẵn sàng
        battery: 100,        // Mặc định đầy pin
        location: "Kho trung tâm", // Vị trí mặc định
        maintenanceDue: maintenance || "Chưa cập nhật"
      };

      setCars([...cars, newCar]);
      Swal.fire('Thành công', 'Đã thêm xe mới vào hệ thống.', 'success');
    }
  };

  // --- 2. XỬ LÝ SỬA THÔNG TIN XE (Edit Profile) ---
  const handleEdit = async (car) => {
    const { value: formValues } = await Swal.fire({
      title: `Cập nhật hồ sơ: ${car.plate}`,
      html:
        `<label class="block text-left text-sm font-bold mt-3">Tên xe:</label>` +
        `<input id="swal-edit-name" class="swal2-input" value="${car.name}">` +
        
        `<label class="block text-left text-sm font-bold mt-3">Trạng thái:</label>` +
        `<select id="swal-edit-status" class="swal2-input">` +
          `<option value="Available" ${car.status === 'Available' ? 'selected' : ''}>Sẵn sàng (Available)</option>` +
          `<option value="Maintenance" ${car.status === 'Maintenance' ? 'selected' : ''}>Bảo trì (Maintenance)</option>` +
          `<option value="Rented" ${car.status === 'Rented' ? 'selected' : ''}>Đang thuê (Rented)</option>` +
        `</select>` +

        `<label class="block text-left text-sm font-bold mt-3">Hạn bảo trì:</label>` +
        `<input id="swal-edit-maintenance" type="date" class="swal2-input" value="${car.maintenanceDue}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      preConfirm: () => {
        return [
          document.getElementById('swal-edit-name').value,
          document.getElementById('swal-edit-status').value,
          document.getElementById('swal-edit-maintenance').value
        ]
      }
    });

    if (formValues) {
      const [newName, newStatus, newDate] = formValues;
      
      // Cập nhật State
      setCars(cars.map(c => 
        c.id === car.id 
          ? { ...c, name: newName, status: newStatus, maintenanceDue: newDate } 
          : c
      ));

      Swal.fire('Đã cập nhật', 'Thông tin xe đã được lưu.', 'success');
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
    }).then((result) => {
      if (result.isConfirmed) {
        setCars(cars.filter(car => car.id !== id));
        Swal.fire('Đã xóa!', 'Xe đã bị loại bỏ khỏi danh sách.', 'success');
      }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Rented': return 'bg-blue-100 text-blue-700';
      case 'Maintenance': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý đội xe & IoT</h2>
        <button 
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 font-medium transition"
        >
          <Plus size={18} /> Thêm xe mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
            <tr>
              <th className="p-4">Thông tin xe</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">IoT: Pin / Sạc</th>
              <th className="p-4">IoT: Vị trí (GPS)</th>
              <th className="p-4">Bảo trì</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{car.name}</p>
                  <p className="text-sm text-gray-500">{car.plate} • {car.type}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(car.status)}`}>
                    {car.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 font-medium text-gray-700">
                        {car.battery < 20 ? <Battery className="text-red-500" size={18}/> : <Battery className="text-green-500" size={18}/>}
                        {car.battery}%
                    </div>
                    {car.status === 'Available' && car.battery < 100 && <Zap size={14} className="text-yellow-500 animate-pulse" />}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                   <div className="flex items-center gap-1">
                     <MapPin size={16} className="text-blue-500"/> {car.location}
                   </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{car.maintenanceDue}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(car)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Sửa thông tin"
                    >
                      <Edit size={18}/>
                    </button>
                    <button 
                      onClick={() => handleDelete(car.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa xe"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && <p className="text-center p-8 text-gray-500">Chưa có xe nào trong hệ thống.</p>}
      </div>
    </div>
  );
};

export default AdminFleet;