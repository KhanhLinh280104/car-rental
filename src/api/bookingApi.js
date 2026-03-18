import axiosClient from "./axiosClient";

/**
 * Booking API
 * Base path: /api/v1/bookings
 */

export const getAllBookingsApi = (params = {}) => {
  return axiosClient.get("/bookings", {
    params: {
      page:   params.page   ?? 0,
      size:   params.size   ?? 10,
      status: params.status ?? undefined,
    },
  });
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
 * [STAFF] Scan ảnh xe & phân tích AI trước bàn giao (PICKUP preview)
 * @param {number} id
 * @param {Object} scanData — { rentalUnitId, vehiclePhotos: [{corner, imageUrl}, ...] }
 * @returns AI analysis: inspectionAnalysisId, analysisStatus, inspectionAnalysis, comparison (null for PICKUP)
 */
export const staffHandoverStartPreviewApi = (id, scanData) =>
    axiosClient.post(`/bookings/${id}/staff-handover-start-preview`, scanData);

/**
 * [STAFF] Bàn giao xe cho khách (không có tài xế) → IN_PROGRESS
 * ⚠️ Không gửi ảnh — chỉ ghi biên bản (type, odoMeter, condition, inspectionAnalysisId)
 * @param {number} id
 * @param {Object} handoverData — { rentalUnitId, type:"PICKUP", odoMeter, condition, inspectionAnalysisId }
 */
export const staffHandoverStartApi = (id, handoverData) =>
    axiosClient.patch(`/bookings/${id}/staff-handover-start`, handoverData);

/**
 * [STAFF] Scan ảnh xe & phân tích AI trước nhận xe (RETURN preview)
 * @param {number} id
 * @param {Object} scanData — { rentalUnitId, vehiclePhotos: [{corner, imageUrl}, ...] }
 * @returns AI analysis: inspectionAnalysisId, analysisStatus, inspectionAnalysis, comparison (with damageChanges)
 */
export const staffHandoverReturnPreviewApi = (id, scanData) =>
    axiosClient.post(`/bookings/${id}/staff-handover-return-preview`, scanData);

/**
 * [STAFF] Nhận xe lại từ khách (không có tài xế) → COMPLETED
 * ⚠️ Không gửi ảnh — chỉ ghi biên bản (type, odoMeter, condition, inspectionAnalysisId, finalIncurredFee)
 * @param {number} id
 * @param {Object} handoverData — { rentalUnitId, type:"RETURN", odoMeter, condition, inspectionAnalysisId, finalIncurredFee }
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
export const getBookingByIdApi = (id) => {
  return axiosClient.get(`/bookings/${id}`);
};

export const getBookingByCodeApi = (bookingCode) => {
  return axiosClient.get(`/bookings/code/${bookingCode}`);
};

export const getBookingsByUserIdApi = (userId) => {
  return axiosClient.get(`/bookings/user/${userId}`);
};

export const getAvailableDriversApi = () => {
  return axiosClient.get("/bookings/available-drivers");
};

export const confirmBookingApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/confirm`);
};

export const cancelBookingApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/cancel`);
};

export const assignDriverApi = (id, driverId) => {
  return axiosClient.patch(`/bookings/${id}/assign-driver`, { driverId });
};

export const staffHandoverStartApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/staff-handover-start`);
};

export const staffHandoverReturnApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/staff-handover-return`);
};