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
    name: "Lễ tân 01",
    role: "Receptionist",
    avatar: "https://i.pravatar.cc/150?u=alexrivera", // Ảnh đại diện mẫu
  };

  return (
    // Navbar container: Cố định trên cùng, bù chiều rộng cho Sidebar, full chiều cao
    <header className="fixed top-0 right-0 z-30 h-20 left-64 bg-white border-b border-gray-100 px-10 flex items-center justify-between">
      {/* 1. Bên trái: Breadcrumb (dựa trên ảnh) */}
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <span className="text-gray-400">Receptionist</span>
      </div>

      {/* 2. Bên phải: Các hành động và User Profile */}
      <div className="flex items-center gap-x-6">
        {/* Nhóm Icon thông báo (đã làm gọn lại dựa trên ảnh chính) */}
        <div className="flex items-center gap-x-3.5 border-r border-gray-100 pr-6">
          <button className="text-gray-400 hover:text-sky-600 transition-colors relative p-1.5 rounded-full hover:bg-sky-50">
            <Bell className="size-5" />
            {/* Chấm đỏ thông báo */}
            <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* User Profile Section (dựa trên ảnh) */}
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
    </header>
  );
};

export default Navbar;
