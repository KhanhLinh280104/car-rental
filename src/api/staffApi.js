import axiosClient from "./axiosClient";

/**
 * Staff API
 * Base path: /api/v1
 */

// Dashboard stats cho staff
export const getStaffDashboardStatsApi = () => {
  return axiosClient.get("/staff/dashboard");
};

// ========== Booking Actions (Staff) ==========

// Xác nhận booking → CONFIRMED
export const confirmBookingApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/confirm`);
};

// Huỷ booking
export const cancelBookingApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/cancel`);
};

// Gán tài xế cho xe trong booking
export const assignDriverApi = (id, driverId) => {
  return axiosClient.patch(`/bookings/${id}/assign-driver`, { driverId });
};

// Bàn giao xe cho khách → IN_PROGRESS
export const staffHandoverStartApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/staff-handover-start`);
};

// Nhận xe lại từ khách → COMPLETED
export const staffHandoverReturnApi = (id) => {
  return axiosClient.patch(`/bookings/${id}/staff-handover-return`);
};