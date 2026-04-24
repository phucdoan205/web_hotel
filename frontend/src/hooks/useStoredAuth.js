import { useEffect, useState } from "react";
import { AUTH_CHANGED_EVENT, getStoredAuth } from "../utils/authStorage";

export const useStoredAuth = () => {
  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    const syncAuth = () => {
      setAuth(getStoredAuth());
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return auth;
};

export default useStoredAuth;
