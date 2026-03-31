const AUTH_STORAGE_KEY = "hotel_auth";
const AUTH_CHANGED_EVENT = "hotel-auth-changed";

const emitAuthChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
};

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
  emitAuthChanged();
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  emitAuthChanged();
};

export { AUTH_STORAGE_KEY, AUTH_CHANGED_EVENT };
