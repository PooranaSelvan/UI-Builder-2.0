import axios from "axios";

const api = axios.create({
     baseURL: import.meta.env.VITE_SITE_TYPE === "development" ? import.meta.env.VITE_BACKEND_LOCAL : import.meta.env.VITE_BACKEND_PROD
});

api.interceptors.request.use((config) => {
     const token = localStorage.getItem("sirpam-token");

     if (token) {
          config.headers.Authorization = `Bearer ${token}`;
     }

     return config;
});

export default api;