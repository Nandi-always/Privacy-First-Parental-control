import axios from 'axios';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password, role) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password, role }),
  register: (data) =>
    apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data),
  logout: () =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  verifyToken: () =>
    apiClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN),
};

export const notificationsService = {
  getAll: () =>
    apiClient.get('/notifications'),
  send: (data) =>
    apiClient.post('/notifications/send', data),
  markAsRead: (id) =>
    apiClient.put(`/notifications/${id}/read`),
};

export const childrenService = {
  getAll: () =>
    apiClient.get(API_ENDPOINTS.CHILDREN.GET_ALL),
  getOne: (id) =>
    apiClient.get(API_ENDPOINTS.CHILDREN.GET_ONE(id)),
  create: (data) =>
    apiClient.post(API_ENDPOINTS.CHILDREN.CREATE, data),
  update: (id, data) =>
    apiClient.put(API_ENDPOINTS.CHILDREN.UPDATE(id), data),
  delete: (id) =>
    apiClient.delete(API_ENDPOINTS.CHILDREN.DELETE(id)),
};

export const screenTimeService = {
  get: (childId) =>
    apiClient.get(API_ENDPOINTS.SCREEN_TIME.GET(childId)),
  setLimit: (childId, limit) =>
    apiClient.post(API_ENDPOINTS.SCREEN_TIME.SET_LIMIT, { childId, limit }),
  getUsage: (childId) =>
    apiClient.get(API_ENDPOINTS.SCREEN_TIME.GET_USAGE(childId)),
};

export const rulesService = {
  getAll: (childId) =>
    apiClient.get(API_ENDPOINTS.RULES.GET_ALL(childId)),
  create: (data) =>
    apiClient.post(API_ENDPOINTS.RULES.CREATE, data),
  update: (id, data) =>
    apiClient.put(API_ENDPOINTS.RULES.UPDATE(id), data),
  delete: (id) =>
    apiClient.delete(API_ENDPOINTS.RULES.DELETE(id)),
};

export const locationService = {
  getCurrent: (childId) =>
    apiClient.get(API_ENDPOINTS.LOCATION.GET_CURRENT(childId)),
  getHistory: (childId) =>
    apiClient.get(API_ENDPOINTS.LOCATION.GET_HISTORY(childId)),
  updateLocation: (childId, data) =>
    apiClient.post(API_ENDPOINTS.LOCATION.UPDATE(childId), data),
  updateGeofence: (data) =>
    apiClient.post(API_ENDPOINTS.LOCATION.UPDATE_GEOFENCE, data),
};

export const emergencyService = {
  sendSOS: (childId, location) =>
    apiClient.post(API_ENDPOINTS.EMERGENCY.SEND_SOS(childId), location),
  getAlerts: (childId) =>
    apiClient.get(API_ENDPOINTS.EMERGENCY.GET_ALERTS(childId)),
  acknowledge: (id) =>
    apiClient.post(API_ENDPOINTS.EMERGENCY.ACKNOWLEDGE(id)),
};

export const reportsService = {
  getActivity: (childId) =>
    apiClient.get(API_ENDPOINTS.REPORTS.GET_ACTIVITY(childId)),
  getSummary: (childId) =>
    apiClient.get(API_ENDPOINTS.REPORTS.GET_SUMMARY(childId)),
};

export const downloadsService = {
  getAlerts: (childId) =>
    apiClient.get(API_ENDPOINTS.DOWNLOADS.GET_ALERTS(childId)),
  approve: (id) =>
    apiClient.post(`/downloads/${id}/approve`),
  block: (id) =>
    apiClient.post(`/downloads/${id}/block`),
};

export default apiClient;
