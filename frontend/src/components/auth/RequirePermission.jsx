import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredAuth } from "../../utils/authStorage";
import { hasPermission } from "../../utils/permissions";

const RequirePermission = ({ permission, children }) => {
  const location = useLocation();
  const auth = getStoredAuth();

  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasPermission(permission, auth)) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return children;
};

export default RequirePermission;
