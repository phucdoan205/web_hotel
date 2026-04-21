import { createRole } from "../api/admin/roleApi";

export const DEFAULT_ROLE_NAME = "Vai trò mới";

export const createDefaultRole = async () => {
  const created = await createRole({ name: DEFAULT_ROLE_NAME, description: "" });
  return created;
};

export default createDefaultRole;
