import React, { useState } from "react";
import { Car, MapPin, Calendar, Phone, User, MessageSquare } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

const UserBooking = () => {
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupDatetime: "",
    carType: "sedan",
    withDriver: true,
    customerName: "",
    customerPhone: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const { notifySuccess, notifyError } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDriverToggle = (withDriver) => {
    setFormData((prev) => ({
      ...prev,
      withDriver,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerPhone || !formData.customerPhone.match(/^[0-9]{10,11}$/)) {
      notifyError("Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.");
      return;
    }

    if (!formData.pickupDatetime) {
      notifyError("Vui lòng chọn thời gian đón!");
      return;
    }

    const pickupDate = new Date(formData.pickupDatetime);
    const now = new Date();

    if (pickupDate <= now) {
      notifyError("Thời gian đón phải sau thời gian hiện tại!");
      return;
    }

    if (!formData.pickupLocation.trim() || !formData.dropoffLocation.trim()) {
      notifyError("Vui lòng nhập đầy đủ địa chỉ đón và địa chỉ đến!");
      return;
    }

    if (!formData.customerName.trim()) {
      notifyError("Vui lòng nhập họ tên!");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("car_bookings").insert([
        {
          pickup_location: formData.pickupLocation.trim(),
          dropoff_location: formData.dropoffLocation.trim(),
          pickup_datetime: formData.pickupDatetime,
          car_type: formData.carType,
          with_driver: formData.withDriver,
          customer_name: formData.customerName.trim(),
          customer_phone: formData.customerPhone.trim(),
          notes: formData.notes.trim(),
          status: "pending",
        },
      ]);

      if (error) throw error;

      notifySuccess("Đặt xe thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");

      setFormData({
        pickupLocation: "",
        dropoffLocation: "",
        pickupDatetime: "",
        carType: "sedan",
        withDriver: true,
        customerName: "",
        customerPhone: "",
        notes: "",
      });
    } catch (error) {
      console.error("Booking Error:", error);
      notifyError("Không thể đặt xe. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Đặt Xe Trực Tuyến
          </h1>

          <p className="text-gray-600">
            Đặt xe nhanh chóng, tiện lợi và an toàn
          </p>
        </div> */}

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Pickup + Dropoff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Điểm đón
                </label>

                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Nhập địa chỉ đón..."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Điểm đến
                </label>

                <input
                  type="text"
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Nhập địa chỉ đến..."
                  required
                />
              </div>
            </div>

            {/* Time + Car */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Thời gian đón
                </label>

                <input
                  type="datetime-local"
                  name="pickupDatetime"
                  value={formData.pickupDatetime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Loại xe
                </label>

                <select
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="sedan">Sedan (4 chỗ)</option>
                  <option value="suv">SUV (7 chỗ)</option>
                  <option value="van">Van (16 chỗ)</option>
                  <option value="luxury">Xe sang</option>
                </select>
              </div>
            </div>

            {/* Driver */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3">
                Loại dịch vụ
              </label>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleDriverToggle(true)}
                  className={`p-4 rounded-lg border-2 ${
                    formData.withDriver
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300"
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  Có tài xế
                </button>

                <button
                  type="button"
                  onClick={() => handleDriverToggle(false)}
                  className={`p-4 rounded-lg border-2 ${
                    !formData.withDriver
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300"
                  }`}
                >
                  <Car className="w-6 h-6 mx-auto mb-2" />
                  Tự lái
                </button>
              </div>
            </div>

            {/* Customer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Họ và tên"
                className="border p-2.5 rounded-lg"
                required
              />

              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="Số điện thoại"
                className="border p-2.5 rounded-lg"
                required
              />
            </div>

            {/* Notes */}
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Ghi chú..."
              className="w-full border rounded-lg p-2.5"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex justify-center gap-2"
            >
              <Car className="w-5 h-5" />
              {loading ? "Đang xử lý..." : "Đặt xe ngay"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserBooking;