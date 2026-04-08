import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CalendarCheck,
  Gift,
  FileText,
  BedDouble,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  // Danh sách menu bám sát thiết kế thực tế
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/receptionist/dashboard",
    },
    {
      title: "Check-in/Out",
      icon: ArrowLeftRight,
      path: "/receptionist/check-in-out",
    },
    { title: "Bookings", icon: CalendarCheck, path: "/receptionist/bookings" },
    { title: "Vouchers", icon: Gift, path: "/receptionist/vouchers" },
    { title: "Quản lý Bài viết", icon: FileText, path: "/receptionist/posts" },
    {
      title: "Room Status",
      icon: BedDouble,
      path: "/receptionist/room-status",
    },
    { title: "POS", icon: Calculator, path: "/receptionist/pos" },
  ];

  const secondaryItems = [
    { title: "Reports", icon: BarChart3, path: "/receptionist/reports" },
    { title: "Settings", icon: Settings, path: "/receptionist/settings" },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-xl text-white">
          <BedDouble size={24} />
        </div>
        <div>
          <h1 className="font-black text-blue-500 text-lg leading-tight uppercase tracking-tight">
            Traveloka
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Hotel Admin
          </p>
        </div>
      </div>

      {/* Main Menu */}
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
          >
            <item.icon size={20} />
            {item.title}
          </NavLink>
        ))}

        <div className="my-6 border-t border-gray-50 mx-4" />

        {/* Secondary Menu (Reports, Settings) */}
        {secondaryItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all
              ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}
            `}
          >
            <item.icon size={20} />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
