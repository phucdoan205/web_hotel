import { getStoredAuth } from "./authStorage";

export const getAuthPermissions = (auth = getStoredAuth()) =>
  Array.isArray(auth?.permissions) ? auth.permissions : [];

export const hasPermission = (permission, auth = getStoredAuth()) => {
  if (!permission) {
    return true;
  }

  return getAuthPermissions(auth).includes(permission);
};

export const hasAnyPermission = (permissions, auth = getStoredAuth()) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return true;
  }

  return permissions.some((permission) => hasPermission(permission, auth));
};

export const hasAllPermissions = (permissions, auth = getStoredAuth()) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return true;
  }

  return permissions.every((permission) => hasPermission(permission, auth));
};
