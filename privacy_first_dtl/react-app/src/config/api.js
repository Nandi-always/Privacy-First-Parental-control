// API Configuration for Backend Integration
const API_BASE_URL = window.API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
  },

  // Children Management
  CHILDREN: {
    GET_ALL: `${API_BASE_URL}/child`,
    GET_ONE: (id) => `${API_BASE_URL}/child/${id}`,
    CREATE: `${API_BASE_URL}/child`,
    UPDATE: (id) => `${API_BASE_URL}/child/${id}`,
    DELETE: (id) => `${API_BASE_URL}/child/${id}`,
  },

  // Screen Time
  SCREEN_TIME: {
    GET: (childId) => `${API_BASE_URL}/screentime/${childId}/settings`,
    UPDATE: (childId) => `${API_BASE_URL}/screentime/${childId}/settings`,
    SET_LIMIT: `${API_BASE_URL}/screentime/limit`,
    GET_USAGE: (childId) => `${API_BASE_URL}/screentime/${childId}/usage`,
  },

  // Rules & Agreements
  RULES: {
    GET_ALL: (childId) => `${API_BASE_URL}/rules/${childId}`,
    CREATE: `${API_BASE_URL}/rules`,
    UPDATE: (id) => `${API_BASE_URL}/rules/${id}`,
    DELETE: (id) => `${API_BASE_URL}/rules/${id}`,
  },

  // Location
  LOCATION: {
    GET_CURRENT: (childId) => `${API_BASE_URL}/location/${childId}/live`,
    GET_HISTORY: (childId) => `${API_BASE_URL}/location/${childId}/history`,
    UPDATE: (childId) => `${API_BASE_URL}/location/${childId}/update`,
    UPDATE_GEOFENCE: `${API_BASE_URL}/location/geofence`,
  },

  // Emergency
  EMERGENCY: {
    SEND_SOS: (childId) => `${API_BASE_URL}/emergency/${childId}/sos`,
    GET_ALERTS: (childId) => `${API_BASE_URL}/emergency/${childId}/alerts`,
    ACKNOWLEDGE: (id) => `${API_BASE_URL}/emergency/${id}/acknowledge`,
  },

  // Reports
  REPORTS: {
    GET_ACTIVITY: (childId) => `${API_BASE_URL}/reports/${childId}/activity`,
    GET_SUMMARY: (childId) => `${API_BASE_URL}/reports/${childId}/summary`,
  },

  // Downloads
  DOWNLOADS: {
    GET_ALERTS: (childId) => `${API_BASE_URL}/downloads/${childId}/alerts`,
  },
};

export default API_BASE_URL;
