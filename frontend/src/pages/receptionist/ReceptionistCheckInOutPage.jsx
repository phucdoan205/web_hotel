import React, { useState } from "react";
import GuestFlowStats from "../../components/receptionist/checkinout/GuestFlowStats";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { getVietnamDateKey } from "../../utils/vietnamTime";

const ReceptionistCheckInOutPage = () => {
  const [activeTab, setActiveTab] = useState("in");

  // ✅ Arrivals (Check-in)
  const arrivalsQuery = useQuery({
    queryKey: ["arrivals"],
    queryFn: () => bookingsApi.getArrivals({ date: getVietnamDateKey() }),
    enabled: activeTab === "in",
    staleTime: 1000 * 60 * 5, // cache 5 phút
  });

  // ✅ In-house (đang ở)
  const inHouseQuery = useQuery({
    queryKey: ["in-house"],
    queryFn: () => bookingsApi.getInHouse(),
    enabled: activeTab === "stay",
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Departures (Check-out)
  const departuresQuery = useQuery({
    queryKey: ["departures"],
    queryFn: () => bookingsApi.getDepartures({ date: getVietnamDateKey() }),
    enabled: activeTab === "out",
    staleTime: 1000 * 60 * 5,
  });

  // 🎯 Lấy data theo tab (KHÔNG cần useState)
  const data =
    activeTab === "in"
      ? arrivalsQuery.data?.items || []
      : activeTab === "stay"
      ? inHouseQuery.data?.items || []
      : departuresQuery.data?.items || [];

  const isLoading =
    (activeTab === "in" && arrivalsQuery.isLoading) ||
    (activeTab === "stay" && inHouseQuery.isLoading) ||
    (activeTab === "out" && departuresQuery.isLoading);

  const isError =
    (activeTab === "in" && arrivalsQuery.isError) ||
    (activeTab === "stay" && inHouseQuery.isError) ||
    (activeTab === "out" && departuresQuery.isError);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab("in")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "in"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Check-in
          </button>

          <button
            onClick={() => setActiveTab("stay")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "stay"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Lưu trú
          </button>

          <button
            onClick={() => setActiveTab("out")}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "out"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Check-out
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="text-center py-10 text-red-400">
          Error loading data 😢
        </div>
      ) : (
        <GuestTable activeTab={activeTab} data={data} />
      )}
    </div>
  );
};

export default ReceptionistCheckInOutPage;
