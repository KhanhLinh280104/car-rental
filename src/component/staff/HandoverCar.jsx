import React, { useState } from 'react';
import { Car, User, Calendar, FileText, CheckCircle, ArrowLeft, Camera } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingById } from './mockBookings';

const HandoverCar = () => {
  const { notifySuccess, notifyConfirm } = useNotification();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const booking = getBookingById(bookingId);

  const [formData, setFormData] = useState({
    startMileage: '',
    fuelLevel: '100',
    notes: '',
    agreed: false
  });

  const handleConfirm = (e) => {
    e.preventDefault();
    notifyConfirm(
      "Xác nhận giao xe?",
      "Bạn chắc chắn các thông tin tình trạng xe đã được ghi nhận chính xác và khách hàng đã ký nhận?",
      () => {
        notifySuccess("Đã giao xe cho khách thành công!", () => {
           navigate('/staff/booking');
        });
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/staff/booking')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Biên bản Giao Xe</h2>
      </div>

      {!booking ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 font-semibold">Không tìm thấy đơn đặt.</p>
          <p className="text-gray-500 text-sm mt-1">Vui lòng quay lại danh sách Đơn đặt và chọn lại.</p>
          <div className="mt-4">
            <button onClick={() => navigate('/staff/booking')} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition">
              Về Đơn đặt
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600"/> Đơn #{booking.id}
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2"><User size={16}/> <strong>Khách:</strong> {booking.customer.name}</p>
              <p className="flex items-center gap-2"><Car size={16}/> <strong>Xe:</strong> {booking.vehicle.name}</p>
              <p className="flex items-center gap-2 text-blue-600 font-semibold border border-blue-100 bg-blue-50 w-fit px-2 py-1 rounded">
                Biển số: {booking.vehicle.plate}
              </p>
              <p className="flex items-center gap-2"><Calendar size={16}/> <strong>Thời gian:</strong> <br/>{booking.start} - {booking.end}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <form onSubmit={handleConfirm} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số KM hiện tại *</label>
                  <input type="number" value={formData.startMileage} onChange={(e) => setFormData({...formData, startMileage: e.target.value})} placeholder="VD: 15000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nhiên liệu / Pin (%) *</label>
                  <select value={formData.fuelLevel} onChange={(e) => setFormData({...formData, fuelLevel: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="100">100% (Đầy)</option>
                    <option value="75">75% (3/4)</option>
                    <option value="50">50% (1/2)</option>
                    <option value="25">25% (1/4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú tình trạng</label>
                <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="VD: Xước nhẹ cản trước bên phải..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh hiện trạng xe (4 góc)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition">
                  <Camera size={32} className="mb-2 text-gray-400" />
                  <p className="text-sm">Bấm để tải ảnh lên hoặc mở Camera</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <input type="checkbox" id="agree" checked={formData.agreed} onChange={(e) => setFormData({...formData, agreed: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" required />
                <label htmlFor="agree" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
                  Khách hàng đã kiểm tra xe, ký tên và đồng ý nhận xe.
                </label>
              </div>

              <button type="submit" disabled={!formData.agreed} className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg flex justify-center items-center gap-2 ${formData.agreed ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}>
                <CheckCircle size={20} /> Xác nhận Giao Xe
              </button>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default HandoverCar;