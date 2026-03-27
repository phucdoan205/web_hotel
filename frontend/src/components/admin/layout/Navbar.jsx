import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getStoredAuth } from "../../../utils/authStorage";
import { getAvatarPreview } from "../../../utils/avatar";

const Navbar = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = getStoredAuth();

  const user = useMemo(
    () => ({
      name: auth?.fullName || auth?.email || "Admin User",
      role: auth?.role || "Staff",
      avatarUrl: auth?.avatarUrl || "",
    }),
    [auth],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 right-0 z-30 flex h-20 left-64 items-center justify-between border-b border-gray-100 bg-white px-10">
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <span className="text-gray-400">Admin</span>
      </div>

      <div className="flex items-center gap-x-6">
        <div className="flex items-center gap-x-3.5 border-r border-gray-100 pr-6">
          <button
            type="button"
            className="relative rounded-full p-1.5 text-gray-400 transition-colors hover:bg-sky-50 hover:text-sky-600"
          >
            <Bell className="size-5" />
            <span className="absolute right-1 top-1 size-2 rounded-full border-2 border-white bg-red-500"></span>
          </button>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex items-center gap-x-4 rounded-xl p-2 pl-1 transition-colors hover:bg-gray-50"
          >
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold leading-tight text-gray-950">
                {user.name}
              </span>
              <span className="text-xs font-medium text-gray-400">
                {user.role}
              </span>
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
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-gray-950">{user.name}</p>
                <p className="text-xs text-gray-400">{user.role}</p>
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
      </div>
    </header>
  );
};

export default Navbar;
