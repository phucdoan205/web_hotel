import React from "react";
import { Bell } from "lucide-react";
import UserMenu from "../../shared/UserMenu";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between h-full px-6">
      <div className="text-lg font-semibold text-gray-800">Guest</div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-x-3.5 border-r border-gray-100 pr-6">
          <button className="text-gray-400 hover:text-sky-600 transition-colors relative p-1.5 rounded-full hover:bg-sky-50">
            <Bell className="size-5" />
            <span className="absolute top-1 right-1 size-2 rounded-full border-2 border-white bg-red-500"></span>
          </button>
        </div>

        <UserMenu logoutRedirect="/" />
      </div>
    </div>
  );
};

export default Navbar;
