import apiClient from "../client";

const buildEquipmentFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

export const getEquipmentList = async (params) => {
  const response = await apiClient.get("/Equipments", { params });
  return response.data;
};

export const getEquipmentById = async (equipmentId) => {
  const response = await apiClient.get(`/Equipments/${equipmentId}`);
  return response.data;
};

export const createEquipment = async (payload) => {
  const response = await apiClient.post(
    "/Equipments",
    buildEquipmentFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const updateEquipment = async (equipmentId, payload) => {
  const response = await apiClient.put(
    `/Equipments/${equipmentId}`,
    buildEquipmentFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
