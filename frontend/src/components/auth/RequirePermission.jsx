import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useStoredAuth from "../../hooks/useStoredAuth";
import { hasPermission } from "../../utils/permissions";

const RequirePermission = ({ permission, children }) => {
  const location = useLocation();
  const auth = useStoredAuth();

  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasPermission(permission, auth)) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return children;
};

export default RequirePermission;
