import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Reports API
export const reportsApi = {
  getAll: (params?: any) => api.get('/reports', { params }),
  getById: (id: string) => api.get(`/reports/${id}`),
  create: (data: any) => api.post('/reports', data),
  updateStatus: (id: string, status: string) => api.patch(`/reports/${id}`, { status })
};

// Traffic API
export const trafficApi = {
  getLive: () => api.get('/traffic/live'),
  createSnapshot: (data: any) => api.post('/traffic/snapshot', data)
};

// Analytics API
export const analyticsApi = {
  getHistorical: (params?: any) => api.get('/analytics/historical', { params }),
  getReportsSummary: () => api.get('/analytics/reports-summary')
};

// Alerts API
export const alertsApi = {
  getAll: () => api.get('/alerts'),
  create: (data: any) => api.post('/alerts', data),
  deactivate: (id: string) => api.patch(`/alerts/${id}/deactivate`)
};

// Congestion API
export const congestionApi = {
  detect: (params: any) => api.get('/congestion/detect', { params }),
  getHeatmap: (params?: any) => api.get('/congestion/heatmap', { params })
};

// Routes API
export const routesApi = {
  suggest: (data: any) => api.post('/routes/suggest', data)
};
