// src/api/roomApi.js
import axios from 'axios';

const API_BASE = 'http://localhost:5291/api';   // thay đổi nếu deploy

export const roomApi = {
  // ==================== ROOM TYPES ====================
  getRoomTypes: (params = {}) => axios.get(`${API_BASE}/RoomTypes`, { params }),
  getRoomTypeById: (id) => axios.get(`${API_BASE}/RoomTypes/${id}`),
  createRoomType: (data) => axios.post(`${API_BASE}/RoomTypes`, data),
  updateRoomType: (id, data) => axios.put(`${API_BASE}/RoomTypes/${id}`, data),
  deleteRoomType: (id) => axios.delete(`${API_BASE}/RoomTypes/${id}`),
  restoreRoomType: (id) => axios.post(`${API_BASE}/RoomTypes/${id}/restore`),

  // ==================== ROOMS ====================
  getRooms: (params = {}) => axios.get(`${API_BASE}/Rooms`, { params }),
  getRoomById: (id) => axios.get(`${API_BASE}/Rooms/${id}`),
  createRoom: (data) => axios.post(`${API_BASE}/Rooms`, data),
  bulkCreateRooms: (data) => axios.post(`${API_BASE}/Rooms/bulk-create`, data),
  updateRoom: (id, data) => axios.put(`${API_BASE}/Rooms/${id}`, data),
  deleteRoom: (id) => axios.delete(`${API_BASE}/Rooms/${id}`),
  restoreRoom: (id) => axios.post(`${API_BASE}/Rooms/${id}/restore`),

  updateRoomStatus: (id, status) =>
    axios.patch(`${API_BASE}/Rooms/${id}/status`, { status }),

  updateCleaningStatus: (id, cleaningStatus) =>
    axios.patch(`${API_BASE}/Rooms/${id}/cleaning-status`, { cleaningStatus }),

  // ==================== ROOM INVENTORY ====================
  getInventoryByRoom: (roomId) =>
    axios.get(`${API_BASE}/RoomInventories/room/${roomId}`),

  createInventory: (data) => axios.post(`${API_BASE}/RoomInventories`, data),
  updateInventory: (id, data) => axios.put(`${API_BASE}/RoomInventories/${id}`, data),
  deleteInventory: (id) => axios.delete(`${API_BASE}/RoomInventories/${id}`),

  cloneInventory: (data) => axios.post(`${API_BASE}/RoomInventories/clone`, data),
  // ==================== ROOM TYPE AMENITIES ====================
  getAmenities: () => axios.get(`${API_BASE}/Amenities`),

  getRoomTypeAmenities: (roomTypeId) =>
    axios.get(`${API_BASE}/RoomTypes/${roomTypeId}/amenities`),

  addAmenityToRoomType: (roomTypeId, amenityId) =>
    axios.post(`${API_BASE}/RoomTypes/${roomTypeId}/amenities/${amenityId}`),

  removeAmenityFromRoomType: (roomTypeId, amenityId) =>
    axios.delete(`${API_BASE}/RoomTypes/${roomTypeId}/amenities/${amenityId}`),
};