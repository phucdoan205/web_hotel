import apiClient from "../client";

export const getPublicReviews = async (limit = 100) => {
  const response = await apiClient.get("/user-reviews/public", {
    params: { limit },
  });
  return response.data ?? [];
};
