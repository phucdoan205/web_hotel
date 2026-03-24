import React, { useState } from "react";
import SettingsTabs from "../components/receptionist/settings/SettingsTabs";
import HotelProfileForm from "../components/receptionist/settings/HotelProfileForm";
import PersonalAccountForm from "../components/receptionist/settings/PersonalAccountForm";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("hotel");

  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Cài đặt hệ thống
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">
          Quản lý thông tin khách sạn và tài khoản cá nhân của bạn.
        </p>
      </header>

      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hiển thị nội dung tương ứng với Tab được chọn */}
      <div className="mt-8">
        {activeTab === "hotel" && <HotelProfileForm />}
        {activeTab === "personal" && <PersonalAccountForm />}
        {activeTab === "system" && (
          <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
              Tính năng đang phát triển
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
