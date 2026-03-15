import axiosClient from "./axiosClient";

/**
 * Booking Service API
 * Base path: /bookings, /drivers
 * Communicates with booking-service via API Gateway
 */

// ============================================================
// BOOKING — QUERY
// ============================================================

/**
 * Lấy tất cả bookings (phân trang, filter theo status)
 * @param {string|null} status - PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | null
 * @param {number} page
 * @param {number} size
 */
export const getAllBookingsApi = (status = null, page = 0, size = 20) => {
    const params = { page, size };
    if (status) params.status = status;
    return axiosClient.get("/bookings", { params });
};

/**
 * Lấy chi tiết booking theo ID
 * @param {number} id
 */
export const getBookingByIdApi = (id) => axiosClient.get(`/bookings/${id}`);

/**
 * Lấy chi tiết booking theo mã booking
 * @param {string} bookingCode
 */
export const getBookingByCodeApi = (bookingCode) =>
    axiosClient.get(`/bookings/code/${bookingCode}`);

/**
 * Lấy danh sách booking của một user
 * @param {string} userId
 * @param {number} page
 * @param {number} size
 */
export const getBookingsByUserApi = (userId, page = 0, size = 20) =>
    axiosClient.get(`/bookings/user/${userId}`, { params: { page, size } });

// ============================================================
// BOOKING — CUSTOMER
// ============================================================

/**
 * [CUSTOMER] Tạo booking mới
 * @param {Object} payload
 * @param {string} payload.userId
 * @param {"SELF_PICKUP"|"DELIVERY"} payload.deliveryMode
 * @param {string} [payload.deliveryAddress] — bắt buộc nếu deliveryMode = DELIVERY
 * @param {Array} payload.rentalUnits — mảng CreateRentalUnitRequest
 *   rentalUnit: { vehicleId, isWithDriver, startTime, endTime, unitPrice }
 */
export const createBookingApi = (payload) =>
    axiosClient.post("/bookings", payload);

/**
 * [CUSTOMER / STAFF] Huỷ booking
 * @param {number} id
 * @param {string} reason
 */
export const cancelBookingApi = (id, reason = "") =>
    axiosClient.patch(`/bookings/${id}/cancel`, null, { params: { reason } });

// ============================================================
// BOOKING — STAFF
// ============================================================

/**
 * [STAFF] Gán tài xế cho RentalUnit trong booking
 * @param {number} bookingId
 * @param {number} rentalUnitId
 * @param {number} driverId
 */
export const assignDriverApi = (bookingId, rentalUnitId, driverId) =>
    axiosClient.patch(`/bookings/${bookingId}/assign-driver`, {
        rentalUnitId,
        driverId,
    });

/**
 * [STAFF] Xác nhận booking → CONFIRMED
 * @param {number} id
 */
export const confirmBookingApi = (id) =>
    axiosClient.patch(`/bookings/${id}/confirm`);

/**
 * [STAFF] Bàn giao xe cho khách (không có tài xế) → IN_PROGRESS
 * @param {number} id
 * @param {Object} handoverData — { rentalUnitId, type:"PICKUP", odoMeter, condition, photos }
 */
export const staffHandoverStartApi = (id, handoverData) =>
    axiosClient.patch(`/bookings/${id}/staff-handover-start`, handoverData);

/**
 * [STAFF] Nhận xe lại từ khách (không có tài xế) → COMPLETED
 * @param {number} id
 * @param {Object} handoverData — { rentalUnitId, type:"RETURN", odoMeter, condition, photos }
 */
export const staffHandoverReturnApi = (id, handoverData) =>
    axiosClient.patch(`/bookings/${id}/staff-handover-return`, handoverData);

/**
 * [STAFF] Lấy danh sách tài xế đang rảnh (ACTIVE + không có booking PENDING/ACTIVE)
 */
export const getAvailableDriversApi = () =>
    axiosClient.get("/bookings/available-drivers");

// ============================================================
// BOOKING — DRIVER
// ============================================================

/**
 * [DRIVER] Xác nhận đã đón khách → IN_PROGRESS
 * @param {number} id - bookingId
 * @param {Object} handoverData — { rentalUnitId, type:"PICKUP", odoMeter, condition }
 */
export const driverPickupConfirmedApi = (id, handoverData) =>
    axiosClient.patch(`/bookings/${id}/driver-pickup-confirmed`, handoverData);

/**
 * [DRIVER] Hoàn thành chuyến đi → COMPLETED
 * @param {number} id - bookingId
 * @param {Object} handoverData — { rentalUnitId, type:"RETURN", odoMeter, condition }
 */
export const driverCompleteTripApi = (id, handoverData) =>
    axiosClient.patch(`/bookings/${id}/driver-complete-trip`, handoverData);

// ============================================================
// DRIVER PROFILE
// ============================================================

/**
 * Lấy danh sách tất cả tài xế (merge IAM + local profile)
 */
export const getAllDriversApi = () => axiosClient.get("/drivers");

/**
 * Lấy thông tin tài xế theo profile ID (local)
 * @param {number} id
 */
export const getDriverByIdApi = (id) => axiosClient.get(`/drivers/${id}`);

/**
 * Lấy thông tin tài xế theo userId (IAM UUID)
 * @param {string} userId
 */
export const getDriverByUserIdApi = (userId) =>
    axiosClient.get(`/drivers/by-user/${userId}`);

/**
 * Cập nhật trạng thái tài xế
 * @param {number} id - profile ID
 * @param {"ACTIVE"|"INACTIVE"|"BLOCKED"} status
 */
export const updateDriverStatusApi = (id, status) =>
    axiosClient.patch(`/drivers/${id}/status`, null, { params: { status } });

/**
 * Đăng ký hồ sơ tài xế cho user IAM đã có role DRIVER
 * @param {string} userId - UUID từ IAM
 * @param {string} licenseNumber 
 * @param {string} currentLocation 
 */
export const createDriverProfileApi = (userId, licenseNumber, currentLocation) =>
    axiosClient.post("/drivers", null, { params: { userId, licenseNumber, currentLocation } });

/**
 * Cập nhật hồ sơ nghề nghiệp tài xế (bằng lái, vị trí)
 * @param {number} id - profile ID
 * @param {string} licenseNumber 
 * @param {string} currentLocation 
 */
export const updateDriverProfileApi = (id, licenseNumber, currentLocation) =>
    axiosClient.put(`/drivers/${id}`, null, { params: { licenseNumber, currentLocation } });

/**
 * Lấy danh sách booking của tài xế theo profile ID (local)
 * Thay thế cho pattern getAllBookingsApi + filter client-side
 * @param {number} driverId - DriverProfile.id (local ID, không phải userId IAM)
 * @param {string|null} status - PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | null (tất cả)
 * @param {number} page
 * @param {number} size
 */
export const getDriverBookingsApi = (driverId, status = null, page = 0, size = 20) => {
    const params = { page, size };
    if (status) params.status = status;
    return axiosClient.get(`/drivers/${driverId}/bookings`, { params });
};
