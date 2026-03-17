import axiosClient from "./axiosClient";

export const getAllDriversApi = () => {
  return axiosClient.get("/drivers"); // bỏ /api/v1 vì baseURL đã có rồi
};

export const getDriverByIdApi = (id) => {
  return axiosClient.get(`/drivers/${id}`);
};

export const getDriverByUserIdApi = (userId) => {
  return axiosClient.get(`/drivers/by-user/${userId}`);
};

export const updateDriverStatusApi = (id, status) => {
  return axiosClient.patch(`/drivers/${id}/status`, { status });
};