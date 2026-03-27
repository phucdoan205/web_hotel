import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Utensils,
  Ticket,
  Star,
  Heart,
  CreditCard,
  LifeBuoy,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/guest/dashboard" },
    { icon: CalendarDays, label: "My Bookings", path: "/guest/bookings" },
    { icon: Utensils, label: "In-room Dining", path: "/guest/dining" },
    { icon: Ticket, label: "Vouchers", path: "/guest/vouchers" },
    { icon: Star, label: "Reviews", path: "/guest/reviews" },
    { icon: Heart, label: "Favorites", path: "/guest/favorites" },
  ];
  const secondaryItems = [
    { icon: CreditCard, label: "Payment Methods", path: "/guest/payments" },
    { icon: LifeBuoy, label: "Customer Support", path: "/guest/support" },
    { icon: Settings, label: "Account Settings", path: "/guest/settings" },
  ];

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col py-8 shadow-sm">
      {/* Brand Logo */}
      <div className="px-8 mb-10 flex items-center gap-3">
        <div className="size-10 bg-[#0085FF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
          <span className="text-white text-xl">🏨</span>
        </div>
        <h1 className="text-xl font-black text-[#0085FF] tracking-tight">
          TravelEase
        </h1>
      </div>

      {/* Navigation Menu */}
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
            end
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
            end
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
