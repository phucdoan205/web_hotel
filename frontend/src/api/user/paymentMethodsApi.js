import apiClient from "../client";

const paymentMethodsApi = {
  getMyMethods: async () => {
    const response = await apiClient.get("/user-payment-methods");
    return response.data;
  },

  createMethod: async (data) => {
    const response = await apiClient.post("/user-payment-methods", data);
    return response.data;
  },

  deleteMethod: async (id) => {
    const response = await apiClient.delete(`/user-payment-methods/${id}`);
    return response.data;
  },
};

export default paymentMethodsApi;
