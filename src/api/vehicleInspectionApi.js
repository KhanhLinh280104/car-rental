import axiosClient from './axiosClient';

/**
 * [STAFF] Lấy chi tiết một bản ghi giám định theo analysisId.
 * GET /vehicle-inspections/{analysisId}
 */
export const getVehicleInspectionByAnalysisIdApi = (analysisId) =>
  axiosClient.get(`/vehicle-inspections/${analysisId}`);

/**
 * [STAFF] Lấy lịch sử giám định theo rentalUnitId (có thể filter stage).
 * GET /vehicle-inspections/rental-unit/{rentalUnitId}?stage=PICKUP|RETURN
 */
export const getVehicleInspectionHistoryByRentalUnitApi = (rentalUnitId, stage = null) => {
  const params = {};
  if (stage) params.stage = stage;

  return axiosClient.get(`/vehicle-inspections/rental-unit/${rentalUnitId}`, { params });
};
