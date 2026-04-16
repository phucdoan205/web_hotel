import React from "react";
import { Hotel, Lock, Settings2, User, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProfileTab from "../../components/admin/settings/ProfileTab";
import HotelInfoTab from "../../components/admin/settings/HotelInfoTab";
import TeamManagementTab from "../../components/admin/settings/TeamManagementTab";
import SecurityTab from "../../components/admin/settings/SecurityTab";
import { hasPermission } from "../../utils/permissions";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "hotel-info", label: "Hotel Info", icon: Hotel },
  { id: "team-management", label: "Team Management", icon: Users, permission: "VIEW_ROLES" },
  { id: "security", label: "Security", icon: Lock },
];

const AdminSettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const availableTabs = tabs.filter((tab) => hasPermission(tab.permission));
  const requestedTab = searchParams.get("settingsTab") ?? "profile";
  const activeTab = availableTabs.some((tab) => tab.id === requestedTab)
    ? requestedTab
    : "profile";

  const setActiveTab = (tabId) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      nextParams.set("settingsTab", tabId);

      if (tabId !== "team-management") {
        nextParams.delete("teamRoleId");
        nextParams.delete("teamSection");
      }

      return nextParams;
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "hotel-info":
        return <HotelInfoTab />;
      case "team-management":
        return <TeamManagementTab />;
      case "security":
        return <SecurityTab />;
      case "profile":
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="mx-auto max-w-[1680px] space-y-8 pb-20">
      <div className="flex flex-col gap-5 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 px-6 py-7 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-[1.4rem] bg-slate-950 p-3 text-white shadow-lg shadow-slate-200">
            <Settings2 className="size-6" />
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">Settings</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              Quản lý hồ sơ, thông tin khách sạn, bảo mật và phân quyền vai trò trong cùng
              một khu vực cài đặt.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-[1.6rem] border border-white/80 bg-white/80 p-2 backdrop-blur">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-[1.1rem] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AdminSettingsPage;
