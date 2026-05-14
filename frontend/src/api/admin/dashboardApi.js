import apiClient from "../client";

export const dashboardApi = {
  getCurrentDashboard: async (roleName = null, periodType = "MONTHLY") => {
    const params = new URLSearchParams();
    if (roleName) params.append("roleName", roleName);
    params.append("periodType", periodType);

    const response = await apiClient.get(`/dashboard-periods/current?${params.toString()}`);
    return response.data;
  },

  getDashboardHistory: async (roleName, periodType, page = 1, pageSize = 10) => {
    const response = await apiClient.get(`/dashboard-periods/${roleName}/${periodType}/history`, {
      params: { page, pageSize }
    });
    return response.data;
  },

  rebuildDashboard: async (roleName, periodType, isCurrent, reason) => {
    const response = await apiClient.post('/dashboard-periods/rebuild', {
      roleName,
      periodType,
      isCurrent,
      reason
    });
    return response.data;
  }
};
