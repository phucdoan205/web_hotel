import React, { useState } from "react";
import ProfileSection from "../../components/user/settings/ProfileSection";
import NotificationConfig from "../../components/user/settings/NotificationConfig";
import SecuritySection from "../../components/user/settings/SecuritySection";

const UserSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Hồ sơ cá nhân" },
    { id: "notifications", label: "Thông báo" },
    { id: "security", label: "Bảo mật" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Trang chủ</span>
            <span>/</span>
            <span className="text-[#0085FF]">Cài đặt</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Cài đặt tài khoản</h1>
          <p className="mt-1 text-[10px] font-bold uppercase text-gray-400">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>
      </header>

      <div className="mb-8 flex gap-8 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-4 text-[11px] font-black uppercase tracking-tight transition-all ${
              activeTab === tab.id
                ? "text-[#0085FF]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#0085FF] duration-300 animate-in slide-in-from-left" />
            )}
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "notifications" && <NotificationConfig />}
        {activeTab === "security" && <SecuritySection />}
      </div>
    </div>
  );
};

export default UserSettingsPage;
