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
  delete: (id) =>
    apiClient.delete(`/notifications/${id}`),
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
  getDaily: (childId) =>
    apiClient.get(API_ENDPOINTS.SCREEN_TIME.GET_DAILY(childId)),
  getHistory: (childId, days = 7) =>
    apiClient.get(API_ENDPOINTS.SCREEN_TIME.GET_HISTORY(childId), { params: { days } }),
  logUsage: (childId, data) =>
    apiClient.post(API_ENDPOINTS.SCREEN_TIME.LOG_USAGE(childId), data),
  setLimit: (childId, limit) =>
    apiClient.post(API_ENDPOINTS.SCREEN_TIME.SET_LIMIT(childId), { limit }),
  pause: (childId, isPaused) =>
    apiClient.post(API_ENDPOINTS.SCREEN_TIME.PAUSE(childId), { isPaused }),
  // Legacy compatibility
  get: (childId) =>
    apiClient.get(API_ENDPOINTS.SCREEN_TIME.GET_DAILY(childId)),
  getUsage: (childId) =>
    apiClient.get(API_ENDPOINTS.SCREEN_TIME.GET_HISTORY(childId)),
  update: (childId, formData) =>
    apiClient.post(API_ENDPOINTS.SCREEN_TIME.SET_LIMIT(childId), { limit: formData.dailyLimit }),
};

export const alertsService = {
  getAll: (childId) =>
    apiClient.get(API_ENDPOINTS.ALERTS.GET_ALL, { params: { childId } }),
  getUnreadCount: () =>
    apiClient.get(API_ENDPOINTS.ALERTS.GET_UNREAD_COUNT),
  create: (data) =>
    apiClient.post(API_ENDPOINTS.ALERTS.CREATE, data),
  markAsRead: (id) =>
    apiClient.put(API_ENDPOINTS.ALERTS.MARK_READ(id)),
  acknowledge: (id) =>
    apiClient.put(API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id)),
  delete: (id) =>
    apiClient.delete(API_ENDPOINTS.ALERTS.DELETE(id)),
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
    apiClient.post(API_ENDPOINTS.EMERGENCY.UPDATE_LOCATION(alertId), location),
  markSafe: (alertId, data) =>
    apiClient.post(API_ENDPOINTS.EMERGENCY.MARK_SAFE(alertId), data),
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
  checkAccess: (childId, url) =>
    apiClient.get(`/website-rules/${childId}/check`, { params: { website: url } }),
  getBlockedAttempts: (childId) =>
    apiClient.get(`/website-rules/${childId}/attempts`),
  logAttempt: (childId, data) =>
    apiClient.post(`/website-rules/${childId}/log-attempt`, data),
};

export const appApprovalsService = {
  requestApproval: (childId, data) =>
    apiClient.post(`/app-approvals/${childId}/request`, data),
  getChildRequests: (childId) =>
    apiClient.get(`/app-approvals/${childId}/my-requests`),
  getRequests: (filter, childId) =>
    apiClient.get('/app-approvals', { params: { filter, childId } }),
  approve: (requestId, responseText) =>
    apiClient.post(`/app-approvals/${requestId}/approve`, { responseText }),
  deny: (requestId, responseText) =>
    apiClient.post(`/app-approvals/${requestId}/deny`, { responseText }),
};

export const riskyActivityService = {
  detect: (childId) =>
    apiClient.post(`/risky-activities/${childId}/detect`),
  getAlerts: (childId, filter = 'all') =>
    apiClient.get(`/risky-activities/${childId}`, { params: { filter } }),
  getStats: (childId, days = 7) =>
    apiClient.get(`/risky-activities/${childId}/stats`, { params: { days } }),
  acknowledge: (alertId) =>
    apiClient.put(`/risky-activities/${alertId}/acknowledge`),
};

export default apiClient;
