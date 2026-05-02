import React, { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  BadgePlus,
  Boxes,
  Building,
  CalendarCheck2,
  ChevronDown,
  ClipboardList,
  FileText,
  Gift,
  History,
  Hotel,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Receipt,
  Settings,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import useStoredAuth from "../../../hooks/useStoredAuth";
import { hasPermission } from "../../../utils/permissions";

const bookingChildren = [
  {
    name: "Tạo booking",
    icon: BadgePlus,
    path: "/admin/bookings",
    matchPaths: ["/admin/bookings"],
    exactMatch: true,
    permission: "VIEW_BOOKINGS",
  },
  {
    name: "Nhận phòng",
    icon: ArrowLeftRight,
    path: "/admin/check-in",
    matchPaths: ["/admin/check-in"],
    permission: "CHECKIN_BOOKING",
  },
  {
    name: "Lưu trú",
    icon: Boxes,
    path: "/admin/stay",
    matchPaths: ["/admin/stay"],
    permission: "VIEW_BOOKINGS",
  },
  {
    name: "Trả phòng",
    icon: ArrowLeftRight,
    path: "/admin/check-out",
    matchPaths: ["/admin/check-out"],
    permission: "CHECKOUT_BOOKING",
  },
];

const contentChildren = [
  {
    name: "Danh mục",
    icon: LayoutGrid,
    path: "/admin/article-categories",
    matchPaths: ["/admin/article-categories"],
    permission: "VIEW_CONTENT",
  },
  {
    name: "Bài viết",
    icon: FileText,
    path: "/admin/articles",
    matchPaths: ["/admin/articles"],
    permission: "VIEW_CONTENT",
  },
  {
    name: "Địa điểm",
    icon: MapPin,
    path: "/admin/attractions",
    matchPaths: ["/admin/attractions"],
    permission: "VIEW_ATTRACTIONS",
  },
];


const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", permission: "VIEW_DASHBOARD" },
  { name: "Theo dõi phòng", icon: CalendarCheck2, path: "/admin/room-status", permission: "VIEW_ROOM_TRACKING" },
  { name: "Nhân viên", icon: Users, path: "/admin/staff", permission: "VIEW_USERS" },
  {
    name: "Nội dung",
    icon: FileText,
    children: contentChildren,
    matchPaths: ["/admin/article-categories", "/admin/articles", "/admin/attractions"],
    permission: "VIEW_CONTENT",
  },
  {
    name: "Quản lý phòng",
    icon: Building,
    path: "/admin/rooms",
    matchPaths: ["/admin/rooms", "/admin/room-types", "/admin/amenities"],
    permission: "VIEW_ROOMS"
  },
  { name: "Nhiệm vụ dọn phòng", icon: ClipboardList, path: "/admin/housekeeping/tasks", permission: "VIEW_HOUSEKEEPING" },
  { name: "Vật tư", icon: Boxes, path: "/admin/equipment", permission: "VIEW_INVENTORY" },
  { name: "Thất thoát đền bù", icon: ShieldAlert, path: "/admin/loss-damage", permission: "VIEW_COMPENSATION" },
  {
    name: "Booking",
    icon: CalendarCheck2,
    children: bookingChildren,
    matchPaths: ["/admin/bookings", "/admin/check-in", "/admin/stay", "/admin/check-out"],
    permission: "VIEW_BOOKINGS",
  },
  {
    name: "Hóa đơn",
    icon: Receipt,
    path: "/admin/invoices",
    matchPaths: ["/admin/invoices"],
    permission: "VIEW_INVOICES",
  },
  { name: "Voucher", icon: Gift, path: "/admin/vouchers", permission: "VIEW_VOUCHERS" },
  { name: "Thành viên", icon: Users, path: "/admin/memberships", permission: "VIEW_SERVICES" },
  { name: "Dịch vụ", icon: Wrench, path: "/admin/pos", permission: "VIEW_SERVICES" },
  { name: "Nhật ký hệ thống", icon: History, path: "/admin/audit-log", permission: "VIEW_LOG" },
];

const isPathMatched = (pathname, matchPaths = [], options = {}) => {
  const { exactMatch = false, excludePaths = [] } = options;

  if (excludePaths.some((path) => pathname === path)) {
    return false;
  }

  return matchPaths.some((path) =>
    exactMatch ? pathname === path : pathname === path || pathname.startsWith(`${path}/`),
  );
};

function SidebarLink({ item, pathname, className = "" }) {
  const isActive = isPathMatched(pathname, item.matchPaths ?? [item.path], {
    exactMatch: item.exactMatch,
    excludePaths: item.excludePaths,
  });

  return (
    <NavLink 
      to={item.path} 
      className={({ isActive: linkActive }) => 
        `relative flex items-center gap-x-3 rounded-xl px-4 py-2.5 text-sm transition-colors duration-300 ${
          isActive 
            ? "text-white font-bold" 
            : "text-blue-50 hover:text-white"
        } ${className}`
      }
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 z-0 rounded-xl bg-white/10"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35
          }}
        />
      )}
      <item.icon className="relative z-10 size-5 shrink-0" />
      <span className="relative z-10 whitespace-nowrap leading-none">{item.name}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const auth = useStoredAuth();
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (name) => {
    setOpenGroups((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };


  const visibleMenuItems = useMemo(
    () =>
      menuItems
        .map((item) => {
          if (item.children) {
            const visibleChildren = item.children.filter((child) =>
              hasPermission(child.permission, auth),
            );

            if (visibleChildren.length === 0 || !hasPermission(item.permission, auth)) {
              return null;
            }

            return {
              ...item,
              children: visibleChildren,
            };
          }

          if (!hasPermission(item.permission, auth)) {
            return null;
          }

          return item;
        })
        .filter(Boolean),
    [auth],
  );

  return (
    <aside className="fixed left-0 top-0 z-[9999] flex h-screen w-64 flex-col border-r border-white/10 bg-[#1F649C] p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-white p-2.5 text-[#1F649C] shadow-inner">
          <Hotel className="size-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold leading-tight tracking-tight text-white">HPT</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Premium ERP</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pr-1 sidebar-hide-scrollbar">
        <div className="flex flex-col gap-y-1.5">
          {visibleMenuItems.map((item) => {
            if (item.children) {
              const groupActive = isPathMatched(location.pathname, item.matchPaths, {
                exactMatch: item.exactMatch,
                excludePaths: item.excludePaths,
              });
              const isExpanded = !!openGroups[item.name] || groupActive;

              return (
                <div key={item.name} className="rounded-2xl">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.name)}
                    className={`flex w-full items-center gap-x-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${groupActive
                      ? "bg-white/10 font-bold text-white"
                      : "text-blue-50 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <item.icon className="size-5 shrink-0" />
                    <span className="flex-1 text-left leading-none">{item.name}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mt-1 flex flex-col gap-y-1 overflow-hidden pl-4"
                      >
                        {item.children.map((child) => (
                          <SidebarLink
                            key={child.name}
                            item={child}
                            pathname={location.pathname}
                            className="pl-4 text-[13px]"
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            }

            return <SidebarLink key={item.name} item={item} pathname={location.pathname} />;
          })}
        </div>
      </nav>

      <div className="mt-6 border-t border-white/10 pt-6">
        <SidebarLink
          item={{
            name: "Settings",
            icon: Settings,
            path: "/admin/settings",
            matchPaths: ["/admin/settings", "/admin/settings/roles"],
          }}
          pathname={location.pathname}
        />
      </div>
    </aside>
  );
}
