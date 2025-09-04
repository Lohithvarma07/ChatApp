import axios from 'axios';
import { loadToken } from '../utils/auth';

// 👇 Your machine’s LAN IPv4 + backend port
export const API_BASE = 'http://10.114.76.119:5000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await loadToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
