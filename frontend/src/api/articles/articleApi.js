import apiClient from "../client";

const buildArticleFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }

      formData.append(key, value.join("\n"));
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

export const getArticles = async (params) => {
  const response = await apiClient.get("/Articles", { params });
  return response.data ?? [];
};

export const getArticleDetail = async (idOrSlug, params) => {
  const response = await apiClient.get(`/Articles/${idOrSlug}`, { params });
  return response.data;
};

export const createArticle = async (payload) => {
  const response = await apiClient.post("/Articles", buildArticleFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateArticle = async (articleId, payload) => {
  const response = await apiClient.put(`/Articles/${articleId}`, buildArticleFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadArticleImages = async (files, articleTitle = "") => {
  const payload = new FormData();

  files.forEach((file) => {
    payload.append("files", file);
  });

  if (articleTitle) {
    payload.append("articleTitle", articleTitle);
  }

  const response = await apiClient.post("/Articles/upload-images", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.urls ?? [];
};

export const approveArticle = async (articleId) => {
  await apiClient.put(`/Articles/${articleId}/approve`);
};

export const deleteArticle = async (articleId) => {
  await apiClient.delete(`/Articles/${articleId}`);
};

export const restoreArticle = async (articleId) => {
  await apiClient.post(`/Articles/${articleId}/restore`);
};

export const getArticleComments = async (articleId) => {
  const response = await apiClient.get(`/Articles/${articleId}/comments`);
  return response.data ?? [];
};

export const createArticleComment = async (articleId, payload) => {
  const response = await apiClient.post(`/Articles/${articleId}/comments`, payload);
  return response.data ?? [];
};
