import axios from "axios";
import { isTokenExpired } from "./token";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      try {
        const response = await refreshToken();
        const { accessToken } = response.data;
        localStorage.setItem("token", accessToken);
        token = accessToken;
      } catch (error) {
        console.error("Token refresh failed in request interceptor", error);
        localStorage.clear();
      }
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await refreshToken();
        const { accessToken } = response.data;
        localStorage.setItem("token", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        localStorage.clear();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

const refreshToken = async () => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/auth/refresh-token`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
