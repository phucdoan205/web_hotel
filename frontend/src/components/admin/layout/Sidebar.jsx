import React, { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  MapPin,
  Receipt,
  Settings,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import { getStoredAuth } from "../../../utils/authStorage";
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

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", permission: "VIEW_DASHBOARD" },
  { name: "Theo dõi phòng", icon: CalendarCheck2, path: "/admin/room-status", permission: "VIEW_ROOM_TRACKING" },
  { name: "Nhân viên", icon: Users, path: "/admin/staff", permission: "VIEW_USERS" },
  { name: "Bài viết", icon: FileText, path: "/admin/articles", permission: "VIEW_CONTENT" },
  { name: "Quản lý phòng", icon: Building, path: "/admin/rooms", permission: "VIEW_ROOMS" },
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
  { name: "Địa điểm", icon: MapPin, path: "/admin/attractions", permission: "VIEW_ATTRACTIONS" },
  { name: "Voucher", icon: Gift, path: "/admin/vouchers", permission: "VIEW_VOUCHERS" },
  { name: "Dịch vụ", icon: Wrench, path: "/admin/pos", permission: "VIEW_SERVICES" },
  { name: "Audit log", icon: History, path: "/admin/audit-log", permission: "VIEW_LOG" },
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
  const baseClasses =
    "flex items-center gap-x-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200";
  const isActive = isPathMatched(pathname, item.matchPaths ?? [item.path], {
    exactMatch: item.exactMatch,
    excludePaths: item.excludePaths,
  });
  const stateClasses = isActive
    ? "bg-sky-100 text-sky-600 font-medium"
    : "text-gray-600 hover:bg-sky-50 hover:text-sky-700";

  return (
    <NavLink to={item.path} className={`${baseClasses} ${stateClasses} ${className}`}>
      <item.icon className="size-5 shrink-0" />
      <span className="whitespace-nowrap leading-none">{item.name}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const auth = getStoredAuth();
  const bookingMenuActive = isPathMatched(location.pathname, [
    "/admin/bookings",
    "/admin/check-in",
    "/admin/stay",
    "/admin/check-out",
  ]);
  const [isBookingOpen, setIsBookingOpen] = useState(bookingMenuActive);
  const isBookingExpanded = isBookingOpen || bookingMenuActive;

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
    <aside className="fixed left-0 top-0 z-[9999] flex h-screen w-64 flex-col border-r border-gray-100 bg-white p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-sky-500 p-2.5 text-white shadow-inner">
          <Hotel className="size-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold leading-tight text-gray-900">Traveloka</span>
          <span className="text-xs font-medium text-gray-400">PREMIUM ERP</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto pr-1 sidebar-hide-scrollbar">
        <div className="flex flex-col gap-y-1.5">
          {visibleMenuItems.map((item) => {
            if (item.children) {
              const groupActive = isPathMatched(location.pathname, item.matchPaths, {
                exactMatch: item.exactMatch,
                excludePaths: item.excludePaths,
              });

              return (
                <div key={item.name} className="rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen((value) => !value)}
                    className={`flex w-full items-center gap-x-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${
                      groupActive
                        ? "bg-sky-100 font-medium text-sky-600"
                        : "text-gray-600 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    <item.icon className="size-5 shrink-0" />
                    <span className="flex-1 text-left leading-none">{item.name}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 transition-transform duration-200 ${
                        isBookingExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isBookingExpanded ? (
                    <div className="mt-1 flex flex-col gap-y-1 pl-4">
                      {item.children.map((child) => (
                        <SidebarLink
                          key={child.name}
                          item={child}
                          pathname={location.pathname}
                          className="pl-4 text-[13px]"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return <SidebarLink key={item.path} item={item} pathname={location.pathname} />;
          })}
        </div>

        <div className="mt-auto border-t border-gray-100 pt-6">
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
      </nav>
    </aside>
  );
}
