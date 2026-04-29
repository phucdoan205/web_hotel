import apiClient from "../client";

const normalizeReview = (item = {}) => ({
  id: item.id,
  roomTypeId: item.roomTypeId,
  hotelName: item.roomTypeName || "Phong",
  image: item.roomImageUrl || "https://placehold.co/160x160/e2e8f0/64748b?text=Room",
  rating: Number(item.rating || 0),
  stayDate: item.stayDate || null,
  isVerified: Boolean(item.status),
  content: item.comment || "",
  createdAt: item.createdAt || null,
});

export const userReviewsApi = {
  async getMyReviews() {
    const response = await apiClient.get("/user-reviews");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeReview);
  },

  async createReview(payload) {
    const response = await apiClient.post("/user-reviews", payload);
    return normalizeReview(response.data);
  },

  async getRoomTypeReviews(roomTypeId) {
    const response = await apiClient.get(`/user-reviews/room-type/${roomTypeId}`);
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(item => ({
      id: item.id,
      roomTypeId: item.roomTypeId,
      user: item.userName || "Khách",
      rating: Number(item.rating || 0),
      comment: item.comment || "",
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Gần đây",
    }));
  },
};

export default userReviewsApi;
