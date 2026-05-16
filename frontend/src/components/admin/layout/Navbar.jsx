import React from "react";
import { Menu } from "lucide-react";
import AdminNotificationBell from "./AdminNotificationBell";
import UserMenu from "../../shared/UserMenu";

const Navbar = ({ onToggle, isSidebarOpen }) => {
  return (
    <header 
      className={`fixed top-0 right-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white px-10 transition-all duration-300 ${
        isSidebarOpen ? "left-64" : "left-0"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="size-6" />
        </button>
        <div className="flex items-center gap-2.5 text-sm font-medium">
        </div>
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
