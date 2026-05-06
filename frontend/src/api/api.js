import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://teamtaskmanagerapp-production-1c74.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
