import React, { useState } from "react";
import ProfileSection from "../../components/guest/settings/ProfileSection";
import NotificationConfig from "../../components/guest/settings/NotificationConfig";
import SecuritySection from "../../components/guest/settings/SecuritySection";

const GuestSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Hồ sơ cá nhân" },
    { id: "notifications", label: "Thông báo" },
    { id: "security", label: "Bảo mật" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <header className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            <span>Trang chủ</span>
            <span>/</span>
            <span className="text-[#0085FF]">Cài đặt</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Cài đặt hệ thống
          </h1>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
            Quản lý định danh và bảo mật tài khoản
          </p>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-8 border-b border-gray-100 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-[11px] font-black uppercase tracking-tight transition-all relative ${
              activeTab === tab.id
                ? "text-[#0085FF]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0085FF] rounded-full animate-in slide-in-from-left duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Render nội dung dựa trên Tab */}
      <div className="transition-all duration-300">
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "notifications" && <NotificationConfig />}
        {activeTab === "security" && <SecuritySection />}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-8 right-8 flex gap-3">
        <button className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-[11px] font-black text-gray-400 uppercase hover:bg-gray-50 shadow-xl transition-all">
          Hủy bỏ
        </button>
        <button className="px-10 py-3 bg-[#0085FF] text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-blue-200 hover:scale-105 transition-all">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default GuestSettingsPage;
