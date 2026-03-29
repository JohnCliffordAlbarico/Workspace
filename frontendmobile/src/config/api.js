import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Session expired callback
let sessionExpiredCallback = null;

export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
};

const api = axios.create({
  baseURL: API_URL || 'https://yuukoworkspace.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Trigger session expired modal
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
