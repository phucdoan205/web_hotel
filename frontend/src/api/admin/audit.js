import apiClient from "../client";

const normalizePagedResponse = (data) => ({
  items: data?.items ?? data?.Items ?? [],
  totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
  page: data?.page ?? data?.Page ?? 1,
  pageSize: data?.pageSize ?? data?.PageSize ?? 50,
  totalPages: data?.totalPages ?? data?.TotalPages ?? 0,
});

export const fetchAuditLogs = async (page = 1, pageSize = 200) => {
  const response = await apiClient.get("/Logs", {
    params: { page, pageSize },
  });

  return normalizePagedResponse(response.data);
};

export const fetchAllAuditLogs = async () => {
  const firstPage = await fetchAuditLogs(1, 200);
  const totalPages = Math.max(firstPage.totalPages || 1, 1);

  if (totalPages === 1) {
    return firstPage.items;
  }

  const pageResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchAuditLogs(index + 2, 200)),
  );

  return [firstPage, ...pageResponses].flatMap((pageResult) => pageResult.items);
};
