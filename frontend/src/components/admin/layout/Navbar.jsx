import React from "react";
import AdminNotificationBell from "./AdminNotificationBell";
import UserMenu from "../../shared/UserMenu";

const Navbar = () => {
  return (
    <header className="fixed top-0 right-0 z-30 flex h-20 left-64 items-center justify-between border-b border-gray-100 bg-white px-10">
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <span className="text-gray-400">Admin</span>
      </div>

      <div className="flex items-center gap-x-6">
        <div className="flex items-center gap-x-3.5 border-r border-gray-100 pr-6">
          <AdminNotificationBell />
        </div>

        <UserMenu logoutRedirect="/" />
      </div>
    </header>
  );
};

export default Navbar;
