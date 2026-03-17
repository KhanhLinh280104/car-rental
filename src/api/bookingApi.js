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