import apiClient from "../client";

const buildAttractionFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

export const getAttractions = async (params) => {
  const response = await apiClient.get("/Attractions", { params });
  return response.data;
};

export const createAttraction = async (payload) => {
  const response = await apiClient.post("/Attractions", buildAttractionFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateAttraction = async (attractionId, payload) => {
  await apiClient.put(`/Attractions/${attractionId}`, buildAttractionFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteAttraction = async (attractionId) => {
  await apiClient.delete(`/Attractions/${attractionId}`);
};
