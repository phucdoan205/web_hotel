import React from "react";
import { Bell } from "lucide-react";
import UserMenu from "../../shared/UserMenu";

const Navbar = () => {
  return (
    <div className="flex h-full items-center justify-between px-6">
      <div className="text-lg font-semibold text-gray-800">Receptionist</div>

      <div className="flex items-center space-x-6">
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
    </div>
  );
};

export default Navbar;
