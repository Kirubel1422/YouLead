import axios from "axios";

const axiosInstance = axios.create({
  timeout: 3000,
  baseURL: "https://identitytoolkit.googleapis.com/v1/accounts",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
