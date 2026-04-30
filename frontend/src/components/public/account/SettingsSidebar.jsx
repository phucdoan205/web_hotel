import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Lock,
  CreditCard,
  Settings as SettingsIcon,
  Pencil
} from "lucide-react";

const SettingsSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Kiểm tra theme từ document class
  const isDark = document.documentElement.classList.contains('dark-theme');

  const sidebarItems = [
    { label: "Thông tin cá nhân", icon: User, path: "/profile/personal-info" },
    { label: "Cài đặt bảo mật", icon: Lock, path: "/profile/security" },
    { 
      label: "Cài đặt chung", 
      icon: SettingsIcon, 
      path: "/profile/settings" 
    },
    { label: "Phương thức thanh toán", icon: CreditCard, path: "#" },
  ];

  return (
    <div className="w-full lg:w-72 shrink-0">
      <div className={`border rounded-lg overflow-hidden shadow-sm ${
        isDark ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-200 bg-white'
      }`}>
        {sidebarItems.map((item, idx) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 transition-all border-b last:border-0 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              } ${
                isActive 
                  ? "text-[#006ce4] font-bold bg-sky-50/10" 
                  : (isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50")
              }`}
            >
              <Icon className={`size-5 transition-transform duration-300 ${isActive ? "text-[#006ce4] scale-110" : "text-slate-500"}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsSidebar;
