import axiosClient from "./axiosClient";

/**
 * Simulator Configuration API
 * Controls the virtual car simulator settings
 */

// Get current simulator configuration
export const getSimulatorConfigApi = () => {
    return axiosClient.get("/simulator/config");
};

// Enable simulator
export const enableSimulatorApi = () => {
    return axiosClient.post("/simulator/enable");
};

// Disable simulator
export const disableSimulatorApi = () => {
    return axiosClient.post("/simulator/disable");
};

// Set vehicle whitelist (replace all)
export const setSimulatorVehiclesApi = (vehicleIds) => {
    return axiosClient.put("/simulator/vehicles", vehicleIds);
};

// Add a vehicle to simulation
export const addSimulatorVehicleApi = (vehicleId) => {
    return axiosClient.post(`/simulator/vehicles/${vehicleId}`);
};

// Remove a vehicle from simulation
export const removeSimulatorVehicleApi = (vehicleId) => {
    return axiosClient.delete(`/simulator/vehicles/${vehicleId}`);
};
