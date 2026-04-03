import React from "react";
import { NavLink } from "react-router-dom"; // Thay đổi ở đây
import {
  LayoutDashboard,
  List,
  CheckSquare,
  Search,
  Box,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: LayoutDashboard,
      path: "/housekeeping",
    },
    {
      id: "room-list",
      label: "Danh sách phòng",
      icon: List,
      path: "/housekeeping/rooms",
    },
    {
      id: "tasks",
      label: "Nhiệm vụ dọn dẹp",
      icon: CheckSquare,
      path: "/housekeeping/tasks",
    },
    {
      id: "inspections",
      label: "Kiểm tra phòng",
      icon: Search,
      path: "/housekeeping/inspections",
    },
    {
      id: "inventory",
      label: "Quản lý vật tư",
      icon: Box,
      path: "/housekeeping/inventory",
    },
    {
      id: "staff",
      label: "Nhân sự & Ca làm",
      icon: Users,
      path: "/housekeeping/staff",
    },
  ];
  const secondaryItems = [
    {
      id: "reports",
      label: "Báo cáo & Thống kê",
      icon: BarChart3,
      path: "/housekeeping/reports",
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: Settings,
      path: "/housekeeping/settings",
    },
  ];
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#0085FF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <div className="size-5 bg-white rounded-sm" />
          </div>
          <div>
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-tighter leading-none">
              QUẢN LÝ KHÁCH SẠN
            </h2>
            <p className="text-[9px] font-bold text-[#0085FF] uppercase mt-1">
              Housekeeping MS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200
              ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }
            `}
            end // Thêm thuộc tính "end" để chỉ kích hoạt khi đường dẫn khớp chính xác
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
        {/* Secondary Menu (Reports, Settings) */}
        {secondaryItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all
                ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}
              `}
            end // Thêm thuộc tính "end" để chỉ kích hoạt khi đường dẫn khớp chính xác
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
