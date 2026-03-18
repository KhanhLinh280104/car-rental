import axiosClient from "./axiosClient";

/**
 * Admin User Management API
 * Base path: /admin/users
 * Requires: ROLE_ADMIN
 */

// ========== CRUD Operations ==========

/**
 * Get all users with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 0)
 * @param {number} params.size - Page size (default: 10)
 * @param {string} params.sortBy - Sort field (default: "createdAt")
 * @param {string} params.sortDirection - Sort direction: "ASC" | "DESC" (default: "DESC")
 */
export const getAllUsersApi = (params = {}) => {
    const queryParams = {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || "createdAt",
        sortDirection: params.sortDirection || "DESC",
    };
    return axiosClient.get("/admin/users", { params: queryParams });
};

/**
 * Search and filter users
 * @param {Object} searchParams - Search criteria
 * @param {string} searchParams.keyword - Search keyword (optional)
 * @param {number} searchParams.roleId - Filter by role ID (optional)
 * @param {boolean} searchParams.isActive - Filter by active status (optional)
 * @param {boolean} searchParams.isDeleted - Filter by deleted status (optional)
 * @param {number} searchParams.page - Page number (default: 0)
 * @param {number} searchParams.size - Page size (default: 10)
 */
export const searchUsersApi = (searchParams = {}) => {
    const queryParams = {
        page: searchParams.page || 0,
        size: searchParams.size || 10,
    };

    // Only add optional params if they exist
    if (searchParams.keyword) queryParams.keyword = searchParams.keyword;
    if (searchParams.roleId) queryParams.roleId = searchParams.roleId;
    if (searchParams.isActive !== undefined) queryParams.isActive = searchParams.isActive;
    if (searchParams.isDeleted !== undefined) queryParams.isDeleted = searchParams.isDeleted;

    return axiosClient.get("/admin/users/search", { params: queryParams });
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 */
export const getUserByIdApi = (userId) => {
    return axiosClient.get(`/admin/users/${userId}`);
};

/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User email (required)
 * @param {string} userData.fullName - Full name (required)
 * @param {string} userData.password - Password (required, min 6 chars)
 * @param {string} userData.phone - Phone number (optional)
 * @param {string} userData.gender - Gender (optional)
 * @param {string} userData.dob - Date of birth in YYYY-MM-DD format (optional)
 * @param {number} userData.roleId - Role ID (required)
 * @param {boolean} userData.isActive - Active status (optional, default: true)
 */
export const createUserApi = (userData) => {
    return axiosClient.post("/admin/users", userData);
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @param {string} userData.email - User email (optional)
 * @param {string} userData.fullName - Full name (optional)
 * @param {string} userData.phone - Phone number (optional)
 * @param {string} userData.gender - Gender (optional)
 * @param {string} userData.dob - Date of birth in YYYY-MM-DD format (optional)
 * @param {number} userData.roleId - Role ID (optional)
 * @param {boolean} userData.isActive - Active status (optional)
 */
export const updateUserApi = (userId, userData) => {
    return axiosClient.put(`/admin/users/${userId}`, userData);
};

/**
 * Delete user (soft delete)
 * @param {string} userId - User ID
 */
export const deleteUserApi = (userId) => {
    return axiosClient.delete(`/admin/users/${userId}`);
};

// ========== Additional Operations ==========

/**
 * Activate user account
 * @param {string} userId - User ID
 */
export const activateUserApi = (userId) => {
    return axiosClient.patch(`/admin/users/${userId}/activate`);
};

/**
 * Deactivate user account
 * @param {string} userId - User ID
 */
export const deactivateUserApi = (userId) => {
    return axiosClient.patch(`/admin/users/${userId}/deactivate`);
};

/**
 * Reset user password
 * @param {string} userId - User ID
 * @param {Object} passwordData - Password reset data
 * @param {string} passwordData.newPassword - New password
 */
export const resetUserPasswordApi = (userId, passwordData) => {
    return axiosClient.post(`/admin/users/${userId}/reset-password`, passwordData);
};
