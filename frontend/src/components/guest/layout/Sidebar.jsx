import React from "react";
import {
  CalendarDays,
  CreditCard,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Star,
  Ticket,
  Utensils,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/guest/dashboard" },
    { icon: CalendarDays, label: "My Bookings", path: "/guest/bookings" },
    { icon: Utensils, label: "In-room Dining", path: "/guest/dining" },
    { icon: Ticket, label: "Vouchers", path: "/guest/vouchers" },
    { icon: Star, label: "Bài viết & Review", path: "/guest/reviews" },
    { icon: Heart, label: "Favorites", path: "/guest/favorites" },
  ];

  const secondaryItems = [
    { icon: CreditCard, label: "Payment Methods", path: "/guest/payments" },
    { icon: LifeBuoy, label: "Customer Support", path: "/guest/support" },
    { icon: Settings, label: "Account Settings", path: "/guest/settings" },
  ];

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-100 bg-white py-8 shadow-sm">
      <div className="mb-10 flex items-center gap-3 px-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#0085FF] shadow-lg shadow-blue-100">
          <span className="text-xl text-white">H</span>
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#0085FF]">
          TravelEase
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200
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

        {secondaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all
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
