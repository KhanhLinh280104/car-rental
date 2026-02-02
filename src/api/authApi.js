import axiosClient from "./axiosClient";

export const loginApi = (data) => {
  return axiosClient.post("/auth/login", data);
};

export const registerApi = (data) => {
  return axiosClient.post("/auth/register", data);
};

export const logoutApi = (refreshToken) => {
  return axiosClient.post("/auth/logout", { refreshToken });
};

export const getMyProfileApi = () => {
  return axiosClient.get("/auth/profile");
};
