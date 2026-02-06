import axiosClient from "./axiosClient";

/**
 * Vehicle Management API
 * Base path: /vehicles
 * Communicates with car-management service via API Gateway
 */

// ========== Vehicle CRUD Operations ==========

/**
 * Get all vehicles with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 0)
 * @param {number} params.size - Page size (default: 10)
 * @param {string} params.sortBy - Sort field (default: "id")
 * @param {string} params.sortDir - Sort direction: "ASC" | "DESC" (default: "ASC")
 */
export const getAllVehiclesApi = (params = {}) => {
    const queryParams = {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || "id",
        sortDir: params.sortDir || "ASC",
    };
    return axiosClient.get("/vehicles", { params: queryParams });
};

/**
 * Get vehicle by ID
 * @param {number} id - Vehicle ID
 */
export const getVehicleByIdApi = (id) => {
    return axiosClient.get(`/vehicles/${id}`);
};

/**
 * Create new vehicle
 * @param {Object} vehicleData - Vehicle data
 * @param {string} vehicleData.plateNumber - License plate number (required)
 * @param {string} vehicleData.vin - Vehicle Identification Number (required)
 * @param {number} vehicleData.modelId - Vehicle model ID (required)
 * @param {string} vehicleData.color - Vehicle color (required)
 * @param {number} vehicleData.manufactureYear - Year of manufacture (required)
 * @param {string} vehicleData.status - Vehicle status: AVAILABLE | IN_USE | MAINTENANCE | CHARGING (required)
 * @param {number} vehicleData.odometerKm - Odometer reading in km (optional)
 * @param {number} vehicleData.fleetHubId - Fleet hub ID (required)
 * @param {boolean} vehicleData.isVirtual - Is virtual vehicle (optional, default: false)
 */
export const createVehicleApi = (vehicleData) => {
    return axiosClient.post("/vehicles", vehicleData);
};

/**
 * Update vehicle
 * @param {number} id - Vehicle ID
 * @param {Object} vehicleData - Vehicle data to update
 * @param {string} vehicleData.plateNumber - License plate number (optional)
 * @param {string} vehicleData.color - Vehicle color (optional)
 * @param {string} vehicleData.status - Vehicle status (optional)
 * @param {number} vehicleData.odometerKm - Odometer reading (optional)
 * @param {number} vehicleData.fleetHubId - Fleet hub ID (optional)
 * @param {string} vehicleData.currentBookingId - Current booking ID (optional)
 * @param {string} vehicleData.currentDriverId - Current driver ID (optional)
 */
export const updateVehicleApi = (id, vehicleData) => {
    return axiosClient.put(`/vehicles/${id}`, vehicleData);
};

/**
 * Delete vehicle
 * @param {number} id - Vehicle ID
 */
export const deleteVehicleApi = (id) => {
    return axiosClient.delete(`/vehicles/${id}`);
};

// ========== Vehicle Filtering ==========

/**
 * Get vehicles by status
 * @param {string} status - Vehicle status: AVAILABLE | IN_USE | MAINTENANCE | CHARGING
 */
export const getVehiclesByStatusApi = (status) => {
    return axiosClient.get(`/vehicles/status/${status}`);
};

/**
 * Get vehicles by fleet hub
 * @param {number} hubId - Fleet hub ID
 */
export const getVehiclesByHubApi = (hubId) => {
    return axiosClient.get(`/vehicles/hub/${hubId}`);
};

// ========== Vehicle State Management ==========

/**
 * Get vehicle state (GPS, battery, speed)
 * @param {number} vehicleId - Vehicle ID
 */
export const getVehicleStateApi = (vehicleId) => {
    return axiosClient.get(`/vehicles/${vehicleId}/state`);
};

/**
 * Update vehicle state
 * @param {number} vehicleId - Vehicle ID
 * @param {Object} stateData - State data to update
 * @param {number} stateData.latitude - GPS latitude (optional)
 * @param {number} stateData.longitude - GPS longitude (optional)
 * @param {number} stateData.batteryLevel - Battery level 0-100 (optional)
 * @param {number} stateData.speedKmh - Current speed in km/h (optional)
 * @param {boolean} stateData.isCharging - Is charging status (optional)
 * @param {number} stateData.odometerKm - Odometer reading (optional)
 */
export const updateVehicleStateApi = (vehicleId, stateData) => {
    return axiosClient.put(`/vehicles/${vehicleId}/state`, stateData);
};

/**
 * Update only GPS location
 * @param {number} vehicleId - Vehicle ID
 * @param {number} latitude - GPS latitude
 * @param {number} longitude - GPS longitude
 */
export const updateVehicleLocationApi = (vehicleId, latitude, longitude) => {
    return axiosClient.put(`/vehicles/${vehicleId}/state/location`, null, {
        params: { latitude, longitude }
    });
};

/**
 * Update only battery level
 * @param {number} vehicleId - Vehicle ID
 * @param {number} batteryLevel - Battery level 0-100
 * @param {boolean} isCharging - Is charging status (optional)
 */
export const updateVehicleBatteryApi = (vehicleId, batteryLevel, isCharging) => {
    const params = { batteryLevel };
    if (isCharging !== undefined) {
        params.isCharging = isCharging;
    }
    return axiosClient.put(`/vehicles/${vehicleId}/state/battery`, null, { params });
};
