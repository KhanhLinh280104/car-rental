import axiosClient from './axiosClient';

/**
 * Dữ liệu tổng quan dashboard (doanh thu, chuyến xe, % thay đổi).
 * @param {string} period - "7d" hoặc "30d"
 */
export const getDashboardOverviewApi = (period = '7d') =>
  axiosClient.get('/dashboard/overview', { params: { period } });

/**
 * Dữ liệu biểu đồ doanh thu & đặt xe.
 * @param {string} period - "7d" → 7 ngày | "30d" → 4 tuần
 */
export const getDashboardChartApi = (period = '7d') =>
  axiosClient.get('/dashboard/chart', { params: { period } });

/**
 * 10 hoạt động (booking) mới nhất.
 */
export const getDashboardRecentApi = () =>
  axiosClient.get('/dashboard/recent');

/**
 * Thống kê đội xe từ car-management.
 * Trả về: total, available, inUse, maintenance, charging, damaged, lowBatteryAlerts
 */
export const getFleetStatsApi = () =>
  axiosClient.get('/vehicles/stats');

/**
 * Thống kê user từ iam-service.
 * @param {number} days - khoảng thời gian tính "khách mới" (mặc định 7)
 */
export const getUserStatsApi = (days = 7) =>
  axiosClient.get('/admin/users/stats', { params: { days } });
