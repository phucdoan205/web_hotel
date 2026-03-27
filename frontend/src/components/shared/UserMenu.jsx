import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AUTH_CHANGED_EVENT,
  clearAuth,
  getStoredAuth,
} from "../../utils/authStorage";
import { getAvatarPreview } from "../../utils/avatar";

const UserMenu = ({
  logoutRedirect = "/",
  showRole = true,
  variant = "light",
}) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    const syncAuth = () => {
      setAuth(getStoredAuth());
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const user = useMemo(
    () => ({
      name: auth?.fullName || auth?.email || "Guest User",
      email: auth?.email || "",
      role: auth?.role || "",
      avatarUrl: auth?.avatarUrl || "",
    }),
    [auth],
  );

  const handleLogout = () => {
    clearAuth();
    setIsOpen(false);
    navigate(logoutRedirect);
  };

  const buttonClassName =
    variant === "dark"
      ? "flex items-center gap-x-4 rounded-xl p-2 pl-1 transition-colors hover:bg-slate-100"
      : "flex items-center gap-x-4 rounded-xl p-2 pl-1 transition-colors hover:bg-gray-50";

  const nameClassName =
    variant === "dark"
      ? "text-sm font-semibold leading-tight text-slate-900"
      : "text-sm font-semibold leading-tight text-gray-950";

  const secondaryClassName =
    variant === "dark"
      ? "text-xs font-medium text-slate-500"
      : "text-xs font-medium text-gray-400";

  if (!auth) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={buttonClassName}
      >
        <div className="flex flex-col text-right">
          <span className={nameClassName}>{user.name}</span>
          {showRole ? (
            <span className={secondaryClassName}>{user.role}</span>
          ) : user.email ? (
            <span className={secondaryClassName}>{user.email}</span>
          ) : null}
        </div>

        <div className="relative">
          <img
            src={getAvatarPreview({
              fullName: user.name,
              avatarUrl: user.avatarUrl,
            })}
            alt={user.name}
            className="size-11 rounded-full border-4 border-sky-100 object-cover shadow-sm"
          />
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500"></span>
        </div>

        <ChevronDown
          className={`size-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-gray-950">{user.name}</p>
            <p className="text-xs text-gray-400">
              {user.email || user.role || "Signed in"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="size-4" />
            <span>Log out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UserMenu;
