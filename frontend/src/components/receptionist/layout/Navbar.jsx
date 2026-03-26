import React from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Clock,
  MessageSquare,
  Plus,
} from "lucide-react";

const Navbar = () => {
  // Thông tin User mẫu (dựa trên ảnh)
  const user = {
    name: "lễ tân 1",
    role: "Lễ tân",
    avatar: "https://i.pravatar.cc/150?u=alexrivera", // Ảnh đại diện mẫu
  };

  return (
    <div className="flex items-center justify-between h-full px-6">
      {/* Left Section: Title or Logo */}
      <div className="text-lg font-semibold text-gray-800">Lễ tân</div>

      {/* Right Section: Notification Icon and User Info */}
      <div className="flex items-center space-x-6">
        {/* Notification Icon */}
        <div className="flex items-center gap-x-3.5 border-r border-gray-100 pr-6">
          <button className="text-gray-400 hover:text-sky-600 transition-colors relative p-1.5 rounded-full hover:bg-sky-50">
            <Bell className="size-5" />
            {/* Chấm đỏ thông báo */}
            <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* User Info */}
        <button className="flex items-center gap-x-4 pl-1 rounded-xl hover:bg-gray-50 p-2 transition-colors">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-950 leading-tight">
              {user.name}
            </span>
            <span className="text-xs font-medium text-gray-400">
              {user.role}
            </span>
          </div>

          {/* Avatar với viền */}
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="size-11 rounded-full border-4 border-sky-100 shadow-sm"
            />
            {/* Chấm xanh trạng thái online */}
            <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
