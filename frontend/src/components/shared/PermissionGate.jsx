import React from "react";
import useStoredAuth from "../../hooks/useStoredAuth";
import { hasPermission } from "../../utils/permissions";

const PermissionGate = ({ permission, fallback = null, children }) => {
  const auth = useStoredAuth();

  if (!hasPermission(permission, auth)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
