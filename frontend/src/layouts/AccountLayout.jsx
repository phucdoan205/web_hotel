import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SettingsSidebar from "../components/public/account/SettingsSidebar";

const AccountLayout = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark-theme'));

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains('dark-theme'));
    };

    // Watch for theme changes (custom event or just re-check on navigation)
    handleThemeChange();
    
    // Add an observer if theme can change without navigation
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [location.pathname]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/profile/personal-info": return "Thông tin cá nhân";
      case "/profile/security": return "Cài đặt bảo mật";
      case "/profile/settings": return "Cài đặt chung";
      default: return "Tài khoản";
    }
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] transition-colors duration-500 ${isDark ? 'bg-[#0f172a] text-white' : 'bg-white'}`}>
      {/* Breadcrumb */}
      <div className={`py-6 border-b transition-colors duration-500 ${isDark ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-100'}`}>
        <div className="mx-auto max-w-7xl px-4 flex items-center gap-2 text-[#006ce4] text-sm font-medium">
          <Link to="/profile" className="hover:underline transition-all">Tài khoản</Link>
          <ChevronRight className="size-3 text-slate-400" />
          <span className={`font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>{getPageTitle()}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Shared component that stays mounted */}
          <SettingsSidebar />
          
          {/* Main Content Area - Only this part changes during navigation */}
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
