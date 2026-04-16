import React from "react";
import { getStoredAuth } from "../../utils/authStorage";
import { hasPermission } from "../../utils/permissions";

const PermissionGate = ({ permission, fallback = null, children }) => {
  const auth = getStoredAuth();

  if (!hasPermission(permission, auth)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
