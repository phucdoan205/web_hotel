import React from "react";
import { Bell } from "lucide-react";
import UserMenu from "../../shared/UserMenu";

const Navbar = () => {
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

        <UserMenu logoutRedirect="/" />
      </div>
    </header>
  );
};

export default Navbar;
