const BASE_URL = "http://localhost:5291/api/Logs"; // sửa nếu khác port

export const fetchAuditLogs = async (page = 1, pageSize = 50) => {
  const res = await fetch(`${BASE_URL}?page=${page}&pageSize=${pageSize}`);

  if (!res.ok) {
    throw new Error("Không lấy được audit logs");
  }

  return res.json();
};