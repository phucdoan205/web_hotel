import apiClient from "../client";

export const roomAmenitiesApi = {
  getAmenities: async () => {
    const response = await apiClient.get("/Amenities");
    return response.data;
  },
  createAmenity: async (payload) => {
    const response = await apiClient.post("/Amenities", payload);
    return response.data;
  },
  updateAmenity: async (id, payload) => {
    const response = await apiClient.put(`/Amenities/${id}`, payload);
    return response.data;
  },
  deleteAmenity: async (id) => {
    const response = await apiClient.delete(`/Amenities/${id}`);
    return response.data;
  },
  toggleAmenityStatus: async (id) => {
    const response = await apiClient.patch(`/Amenities/${id}/toggle`);
    return response.data;
  },
  getRoomTypeAmenities: async (roomTypeId) => {
    const response = await apiClient.get(`/RoomTypes/${roomTypeId}/Amenities`);
    return response.data;
  },
  addAmenityToRoomType: async (roomTypeId, amenityId) => {
    const response = await apiClient.post(
      `/RoomTypes/${roomTypeId}/Amenities/${amenityId}`,
    );
    return response.data;
  },
  removeAmenityFromRoomType: async (roomTypeId, amenityId) => {
    const response = await apiClient.delete(
      `/RoomTypes/${roomTypeId}/Amenities/${amenityId}`,
    );
    return response.data;
  },
};
