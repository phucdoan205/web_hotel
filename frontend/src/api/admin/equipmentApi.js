import axios from 'axios';

const API_BASE = 'http://localhost:5291/api';

export const equipmentApi = {
  getEquipments: (params) => axios.get(`${API_BASE}/Equipment`, { params }),
  getById: (id) => axios.get(`${API_BASE}/Equipment/${id}`),
  create: (data) => axios.post(`${API_BASE}/Equipment`, data),
  update: (id, data) => axios.put(`${API_BASE}/Equipment/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/Equipment/${id}`),
  toggleActive: (id) => axios.patch(`${API_BASE}/Equipment/${id}/toggle-active`),
};
