import React, { useState } from "react";
import GuestFlowStats from "../../components/receptionist/checkinout/GuestFlowStats";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import {
  RecentCheckIns,
  PendingCleanups,
  WalkInAction,
} from "../../components/receptionist/checkinout/QuickWidgets";

const ReceptionistCheckInOutPage = () => {
  // Mặc định là 'in' (Check-in Tab)
  const [activeTab, setActiveTab] = useState("in");

  const checkInData = [
    {
      name: "Aria Walker",
      id: "#BK-90210",
      room: "Deluxe Ocean View",
      date: "May 12, 2024",
      payment: "Paid",
    },
    {
      name: "Julian Martinez",
      id: "#BK-90211",
      room: "Suite Executive",
      date: "May 12, 2024",
      payment: "Partial",
    },
  ];

  const checkOutData = [
    {
      name: "Robert Sterling",
      id: "#BK-90218",
      room: "Twin Standard",
      date: "May 13, 2024",
      payment: "Paid",
    },
    {
      name: "Elena Lopez",
      id: "#BK-90215",
      room: "Superior King",
      date: "May 12, 2024",
      payment: "Unpaid",
    },
  ];

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
            onClick={() => setActiveTab("in")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "in" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Check-in
          </button>
          <button
            onClick={() => setActiveTab("out")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "out" ? "bg-rose-500 text-white shadow-lg shadow-rose-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Check-out
          </button>
        </div>
      </div>

      {/* Dynamic Table Content */}
      <GuestTable
        activeTab={activeTab}
        data={activeTab === "in" ? checkInData : checkOutData}
      />

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <RecentCheckIns />
        <PendingCleanups />
        <WalkInAction />
      </div>
    </div>
  );
};

export default ReceptionistCheckInOutPage;
