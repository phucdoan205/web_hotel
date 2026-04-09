import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  Building,
  CalendarCheck2,
  FileText,
  History,
  Hotel,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Bookings", icon: CalendarCheck2, path: "/admin/bookings" },
  { name: "Nhân viên", icon: Users, path: "/admin/staff" },
  { name: "Bài viết", icon: FileText, path: "/admin/articles" },
  { name: "Quản lý phòng", icon: Building, path: "/admin/rooms" },
  { name: "Vật tư", icon: Boxes, path: "/admin/equipment" },
  { name: "Thất thoát & đền bù", icon: ShieldAlert, path: "/admin/loss-damage" },
  { name: "Báo cáo", icon: BarChart3, path: "/admin/reports" },
  { name: "Audit Log", icon: History, path: "/admin/audit-log" },
];

function SidebarItem({ item, isBottom = false }) {
  const baseClasses =
    "flex items-center gap-x-3 rounded-xl px-4 py-2.5 transition-all duration-200";
  const activeClasses = "bg-sky-100 text-sky-600 font-medium";
  const inactiveClasses = "text-gray-600 hover:bg-sky-50 hover:text-sky-700";

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isBottom ? "mt-auto" : ""}`
      }
    >
      <item.icon className="size-5" />
      <span>{item.name}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-100 bg-white p-6">
      <div className="mb-12 flex items-center gap-3">
        <div className="rounded-xl bg-sky-500 p-2.5 text-white shadow-inner">
          <Hotel className="size-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold leading-tight text-gray-900">
            Traveloka
          </span>
          <span className="text-xs font-medium text-gray-400">PREMIUM ERP</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-y-1.5">
        {menuItems.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}

        <div className="mt-auto border-t border-gray-100 pt-6">
          <SidebarItem
            item={{ name: "Settings", icon: Settings, path: "/admin/settings" }}
            isBottom
          />
        </div>
      </nav>
    </aside>
  );
}
