import React from "react";
import Sidebar from "../components/housekeeping/layout/Sidebar";
import Navbar from "../components/housekeeping/layout/Navbar";
import { Outlet, useLocation } from "react-router-dom";

const HousekeepingLayout = () => {
  const { pathname } = useLocation();
  const isRoomMonitoringPage = pathname === "/housekeeping/rooms";
  const isWideContentPage = [
    "/housekeeping/inventory",
    "/housekeeping/equipment",
    "/housekeeping/loss-damage",
    "/housekeeping/tasks",
  ].includes(pathname);
  // XÓA DÒNG NÀY: const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        {/* KHÔNG TRUYỀN PROPS activeTab NỮA */}
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 ml-64">
        <header className="h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <Navbar />
        </header>

        <main className={isRoomMonitoringPage ? "mt-4 p-10 flex-1" : "p-8 flex-1"}>
          <div className={isRoomMonitoringPage ? "" : isWideContentPage ? "mx-auto w-full max-w-[96rem]" : "max-w-7xl mx-auto"}>
            {/* Outlet sẽ tự động đổi nội dung khi URL thay đổi */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HousekeepingLayout;
