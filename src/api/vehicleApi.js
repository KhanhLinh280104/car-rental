import axiosClient from "./axiosClient";

/**
 * Vehicle API (via booking-service → car-management)
 * Base path: /api/v1/vehicles
 */

// Lấy danh sách xe (phân trang)
export const getAllVehiclesApi = (params = {}) => {
  return axiosClient.get("/vehicles", {
    params: {
      page:    params.page    ?? 0,
      size:    params.size    ?? 10,
      sortBy:  params.sortBy  ?? "id",
      sortDir: params.sortDir ?? "ASC",
    },
  });
};

// Lấy chi tiết một xe theo ID
export const getVehicleByIdApi = (id) => {
  return axiosClient.get(`/vehicles/${id}`);
};

// Lấy xe theo trạng thái (AVAILABLE, RENTED, CHARGING, OFFLINE...)
export const getVehiclesByStatusApi = (status) => {
  return axiosClient.get(`/vehicles/status/${status}`);
};

// Lấy danh sách xe đang AVAILABLE
export const getAvailableVehiclesApi = () => {
  return axiosClient.get("/vehicles/available");
};