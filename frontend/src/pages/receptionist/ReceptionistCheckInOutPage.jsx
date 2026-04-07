import React, { useState } from "react";
import GuestFlowStats from "../../components/receptionist/checkinout/GuestFlowStats";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../../api/admin/bookingsApi";

const ReceptionistCheckInOutPage = () => {
  // Mặc định là 'in' (Check-in Tab)
  const [activeTab, setActiveTab] = useState("in");
  const [guestTableData, setGuestTableData] = useState([]);

  // === API Calls cho 3 tab ===
  const arrivalsQuery = useQuery({
    queryKey: ["arrivals"],
    queryFn: () => bookingsApi.getArrivals({ date: new Date() }),
    enabled: activeTab === "in",
  });

  const inHouseQuery = useQuery({
    queryKey: ["in-house"],
    queryFn: () => bookingsApi.getInHouse(),
    enabled: activeTab === "stay",
  });

  const departuresQuery = useQuery({
    queryKey: ["departures"],
    queryFn: () => bookingsApi.getDepartures({ date: new Date() }),
    enabled: activeTab === "out",
  });

  console.log("Arrivals Data:", arrivalsQuery.data);
  console.log("In-House Data:", inHouseQuery.data);
  console.log("Departures Data:", departuresQuery.data);

  const isLoading =
    (activeTab === "in" && arrivalsQuery.isLoading) ||
    (activeTab === "stay" && inHouseQuery.isLoading) ||
    (activeTab === "out" && departuresQuery.isLoading);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "in":
        if (arrivalsQuery.data) setGuestTableData(arrivalsQuery.data.items);
        break;
      case "stay":
        if (inHouseQuery.data) setGuestTableData(inHouseQuery.data.items);
        break;
      case "out":
        if (departuresQuery.data) setGuestTableData(departuresQuery.data.items);
        break;
    }
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Daily Guest Flow
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Efficiently manage guest arrivals and departures.
          </p>
        </div>
        <GuestFlowStats />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => handleTabSwitch("in")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "in" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Check-in
          </button>
          <button
            onClick={() => handleTabSwitch("stay")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "stay" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Lưu trú
          </button>
          <button
            onClick={() => handleTabSwitch("out")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "out" ? "bg-rose-500 text-white shadow-lg shadow-rose-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Check-out
          </button>
        </div>
      </div>

      {/* Dynamic Table Content */}
      <GuestTable
        activeTab={activeTab}
        data={guestTableData}
      />
    </div>
  );
};

export default ReceptionistCheckInOutPage;
