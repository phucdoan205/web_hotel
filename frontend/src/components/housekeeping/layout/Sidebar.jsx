import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  CheckSquare,
  LayoutDashboard,
  List,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";

const menuItems = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/housekeeping",
  },
  {
    id: "room-list",
    label: "Theo dõi phòng",
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
    id: "equipment",
    label: "Quản lý vật tư",
    icon: Boxes,
    path: "/housekeeping/equipment",
  },
  {
    id: "inventory",
    label: "Thất thoát & đền bù",
    icon: ShieldAlert,
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

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-100 bg-white">
      <div className="mb-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#0085FF] shadow-lg shadow-blue-100">
            <div className="size-5 rounded-sm bg-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase leading-none tracking-tighter text-gray-900">
              QUẢN LÝ KHÁCH SẠN
            </h2>
            <p className="mt-1 text-[9px] font-bold uppercase text-[#0085FF]">Housekeeping MS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}

        {secondaryItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
