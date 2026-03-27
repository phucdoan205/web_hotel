const AUTH_STORAGE_KEY = "hotel_auth";

export const getStoredAuth = () => {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const saveAuth = (authData) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export { AUTH_STORAGE_KEY };
