import React, { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  Gift,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareText,
  ReceiptText,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const bookingChildren = [
  { icon: CalendarDays, label: "Booking", path: "/user/bookings" },
  { icon: Heart, label: "Yêu thích", path: "/user/favorites" },
  { icon: ClipboardList, label: "Lịch sử đặt phòng", path: "/user/booking-history" },
  { icon: ReceiptText, label: "Hóa đơn", path: "/user/invoices" },
];

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/user/dashboard" },
  {
    icon: CalendarDays,
    label: "Đặt phòng",
    children: bookingChildren,
    matchPaths: bookingChildren.map((item) => item.path),
  },
  { icon: ShoppingBag, label: "Dịch vụ", path: "/user/services" },
  { icon: FileText, label: "Bài viết", path: "/user/articles" },
  { icon: MessageSquareText, label: "Review", path: "/user/reviews" },
  { icon: Gift, label: "Voucher", path: "/user/vouchers" },
  { icon: LifeBuoy, label: "Hỗ trợ khách hàng", path: "/user/support" },
  { icon: Settings, label: "Setting", path: "/user/settings" },
];

const isPathMatched = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

const SidebarLink = ({ item, iconSize = 20, className = "" }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) => `
      flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200
      ${
        isActive
          ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
          : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
      }
      ${className}
    `}
    end
  >
    <item.icon size={iconSize} />
    {item.label}
  </NavLink>
);

const Sidebar = () => {
  const location = useLocation();
  const bookingMenuActive = bookingChildren.some((item) => isPathMatched(location.pathname, item.path));
  const [isBookingOpen, setIsBookingOpen] = useState(bookingMenuActive);
  const isBookingExpanded = isBookingOpen || bookingMenuActive;

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-100 bg-white py-8 shadow-sm">
      <div className="mb-10 flex items-center gap-3 px-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#0085FF] shadow-lg shadow-blue-100">
          <span className="text-xl text-white">H</span>
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#0085FF]">TravelEase</h1>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen((value) => !value)}
                  className={`
                    flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200
                    ${
                      bookingMenuActive
                        ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      isBookingExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isBookingExpanded ? (
                  <div className="space-y-1 pl-4">
                    {item.children.map((child) => (
                      <SidebarLink
                        key={child.path}
                        item={child}
                        iconSize={18}
                        className="text-[13px]"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }

          return <SidebarLink key={item.path} item={item} />;
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
