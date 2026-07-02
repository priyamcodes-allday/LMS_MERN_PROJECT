import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// intercept response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh-token") {
      originalRequest._retry = true;
      try {
        //refresh token
        await api.post("/auth/refresh-token");

        //original request
        return api(originalRequest);
      } catch (refreshError) {
        //refresh token expired
        localStorage.removeItem("learnable_has_session");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


export default api;