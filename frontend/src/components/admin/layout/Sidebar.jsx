import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Building,
  BarChart3,
  History,
  Settings,
  Hotel,
} from "lucide-react";

const Sidebar = () => {
  // Danh sách các item menu chính (dựa trên ảnh)
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Bookings", icon: CalendarCheck2, path: "/admin/bookings" },
    { name: "Staff", icon: Users, path: "/admin/staff" },
    {
      name: "Hotel Management",
      icon: Building,
      path: "/admin/hotel-management",
    },
    { name: "Reports", icon: BarChart3, path: "/admin/reports" },
    { name: "Audit Log", icon: History, path: "/admin/audit-log" },
  ];

  // Component phụ cho Menu Item để code gọn hơn
  const SidebarItem = ({ item, isBottom = false }) => {
    // Class mặc định và class khi được active (Navlink xử lý)
    const baseClasses = `flex items-center gap-x-3 py-2.5 px-4 rounded-xl transition-all duration-200`;
    const activeClasses = `bg-sky-100 text-sky-600 font-medium`;
    const inactiveClasses = `text-gray-600 hover:bg-sky-50 hover:text-sky-700`;

    // Tính toán class cuối cùng dựa trên isActive của NavLink
    const getClasses = ({ isActive }) =>
      `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isBottom ? "mt-auto" : ""}`;

    return (
      <NavLink to={item.path} className={getClasses}>
        <item.icon className="size-5" />
        <span>{item.name}</span>
      </NavLink>
    );
  };

  return (
    // Sidebar container: Cố định bên trái, độ rộng cố định, full chiều cao
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-100 bg-white p-6 flex flex-col">
      {/* 1. Logo Section (dựa trên ảnh) */}
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-sky-500 text-white p-2.5 rounded-xl shadow-inner">
          <Hotel className="size-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-gray-900 leading-tight">
            Traveloka
          </span>
          <span className="text-xs font-medium text-gray-400">PREMIUM ERP</span>
        </div>
      </div>

      {/* 2. Main Navigation Area */}
      <nav className="flex-1 flex flex-col gap-y-1.5">
        {menuItems.map((item, index) => (
          <SidebarItem key={index} item={item} />
        ))}

        {/* 3. Bottom Navigation Area (Settings - dựa trên ảnh) */}
        <div className="mt-auto border-t border-gray-100 pt-6">
          <SidebarItem
            item={{ name: "Settings", icon: Settings, path: "/admin/settings" }}
            isBottom={true}
          />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
