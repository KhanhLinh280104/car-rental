import axiosClient from "./axiosClient";

export const getAllAdminBookingsApi = () => {
  return axiosClient.get("/bookings");
};
