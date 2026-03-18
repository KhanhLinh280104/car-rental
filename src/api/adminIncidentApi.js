import axiosClient from "./axiosClient";

export const getAllAdminIncidentsApi = () => {
  return axiosClient.get("/admin/incidents");
};

export const processIncidentApi = (incidentId, action) => {
  // action: 'RESOLVE' | 'IGNORE'
  return axiosClient.patch(`/admin/incidents/${incidentId}/process`, { action });
};
