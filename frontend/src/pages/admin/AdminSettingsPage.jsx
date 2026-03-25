import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  Hotel,
  Users,
  Lock,
  ChevronRight,
} from "lucide-react";

// Import các Tab Components
import ProfileTab from "../../components/admin/settings/ProfileTab";
import HotelInfoTab from "../../components/admin/settings/HotelInfoTab";
import TeamManagementTab from "../../components/admin/settings/TeamManagementTab";
import SecurityTab from "../../components/admin/settings/SecurityTab";

const AdminSettingsPage = () => {
  // Mặc định tab sẽ là 'Profile'
  const [activeTab, setActiveTab] = useState("Profile");

  const tabs = [
    { id: "Profile", label: "Profile", icon: User },
    { id: "Hotel Info", label: "Hotel Info", icon: Hotel },
    { id: "Team Management", label: "Team Management", icon: Users },
    { id: "Security", label: "Security", icon: Lock },
  ];

  // Hàm render nội dung tab dựa trên state
  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return <ProfileTab />;
      case "Hotel Info":
        return <HotelInfoTab />;
      case "Team Management":
        return <TeamManagementTab />;
      case "Security":
        return <SecurityTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-400 mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">
          Admin
        </span>
        <ChevronRight className="size-3" />
        <span className="text-gray-900">Settings</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-2">
            Configure your account preferences, property details, and system
            security.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-3xl border border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-wider transition-all
                ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm shadow-blue-100/50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                }`}
            >
              <Icon
                className={`size-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="mt-8 relative min-h-150">
        {/* Render Tab Content với Animation nhẹ */}
        <div
          key={activeTab}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {renderTabContent()}
        </div>
      </div>

      {/* Global Footer (Tùy chọn) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-4 flex items-center justify-between z-10 lg:ml-64">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
          All changes are auto-saved
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[10px] font-black text-gray-400 uppercase hover:text-gray-600 transition-colors">
            Discard
          </button>
          <button className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
