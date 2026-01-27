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
  getDeviceStatus: (childId) =>
    apiClient.get(`/children/${childId}/status`),
};

export const screenTimeService = {
  get: (childId) =>
    apiClient.get(API_ENDPOINTS.SCREEN_TIME.GET(childId)),
  update: (childId, data) =>
    apiClient.put(API_ENDPOINTS.SCREEN_TIME.UPDATE(childId), data),
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
  updateLocation: (alertId, location) =>
    apiClient.post(`/emergency/${alertId}/update-location`, location),
  markCalled: (alertId) =>
    apiClient.post(`/emergency/${alertId}/mark-called`),
  markSafe: (alertId, data) =>
    apiClient.post(`/emergency/${alertId}/mark-safe`, data),
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

export const websiteRulesService = {
  getAll: (childId) =>
    apiClient.get(`/website-rules/${childId}`),
  create: (data) =>
    apiClient.post('/website-rules', data),
  update: (ruleId, data) =>
    apiClient.put(`/website-rules/${ruleId}`, data),
  delete: (ruleId) =>
    apiClient.delete(`/website-rules/${ruleId}`),
  checkAccess: (childId, website) =>
    apiClient.get(`/website-rules/${childId}/check?website=${encodeURIComponent(website)}`),
  getBlockedAttempts: (childId) =>
    apiClient.get(`/website-rules/${childId}/attempts`),
};

export const appApprovalsService = {
  requestApproval: (childId, data) =>
    apiClient.post(`/app-approvals/${childId}/request`, data),
  getRequests: (status = 'all') =>
    apiClient.get(`/app-approvals?status=${status}`),
  getChildRequests: (childId) =>
    apiClient.get(`/app-approvals/${childId}/my-requests`),
  approve: (requestId, parentResponse) =>
    apiClient.post(`/app-approvals/${requestId}/approve`, { parentResponse }),
  deny: (requestId, parentResponse) =>
    apiClient.post(`/app-approvals/${requestId}/deny`, { parentResponse }),
};

export const riskyActivityService = {
  detect: (childId) =>
    apiClient.post(`/risky-activity/${childId}/detect`),
  getAlerts: (childId, filters = {}) =>
    apiClient.get(`/risky-activity/${childId}`, { params: filters }),
  getStats: (childId, days = 7) =>
    apiClient.get(`/risky-activity/${childId}/stats?days=${days}`),
  acknowledge: (alertId) =>
    apiClient.put(`/risky-activity/${alertId}/acknowledge`),
};

export default apiClient;
