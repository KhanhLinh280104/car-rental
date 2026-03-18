import axiosClient from "./axiosClient";

export const getAdminDashboardStatsApi = (range = "7d") => {
  // range: "7d", "30d", "this_year"
  return axiosClient.get(`/admin/dashboard?range=${range}`);
};

export const getAdminFleetStatusApi = () => {
  return axiosClient.get("/vehicles/status");
};

export const getAdminRecentActivitiesApi = () => {
  return axiosClient.get("/admin/recent-activities");
};
