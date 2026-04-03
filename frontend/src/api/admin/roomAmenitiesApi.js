import apiClient from "../client";

export const roomAmenitiesApi = {
  getAmenities: async () => {
    const response = await apiClient.get("/Amenities");
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
