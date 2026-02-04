import axiosClient from "./axiosClient";

/**
 * Role API
 * Base path: /roles
 */

/**
 * Get all roles
 */
export const getAllRolesApi = () => {
    return axiosClient.get("/roles");
};

/**
 * Get active roles only
 */
export const getActiveRolesApi = () => {
    return axiosClient.get("/roles/active");
};

/**
 * Get role by ID
 * @param {number} roleId - Role ID
 */
export const getRoleByIdApi = (roleId) => {
    return axiosClient.get(`/roles/${roleId}`);
};

/**
 * Get role by name
 * @param {string} roleName - Role name (ADMIN, CUSTOMER, STAFF)
 */
export const getRoleByNameApi = (roleName) => {
    return axiosClient.get(`/roles/name/${roleName}`);
};
