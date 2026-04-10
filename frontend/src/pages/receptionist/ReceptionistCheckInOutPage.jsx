import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GuestFlowStats from "../../components/receptionist/checkinout/GuestFlowStats";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { getVietnamDateKey } from "../../utils/vietnamTime";

const ReceptionistCheckInOutPage = () => {
  const [activeTab, setActiveTab] = useState("schedule");

  const confirmedBookingsQuery = useQuery({
    queryKey: ["confirmed-check-ins"],
    queryFn: () =>
      bookingsApi.getBookings({
        status: "Confirmed",
        page: 1,
        pageSize: 200,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const arrivalsQuery = useQuery({
    queryKey: ["arrivals"],
    queryFn: () => bookingsApi.getArrivals({ date: getVietnamDateKey() }),
    staleTime: 1000 * 60 * 5,
  });

  const inHouseQuery = useQuery({
    queryKey: ["in-house"],
    queryFn: () => bookingsApi.getInHouse(),
    staleTime: 1000 * 60 * 5,
  });

  const departuresQuery = useQuery({
    queryKey: ["departures"],
    queryFn: () => bookingsApi.getDepartures({ date: getVietnamDateKey() }),
    staleTime: 1000 * 60 * 5,
  });

  const arrivals = (arrivalsQuery.data?.items || []).filter(
    (booking) => booking.status === "Confirmed",
  );
  const confirmedBookings = (confirmedBookingsQuery.data?.items || []).filter(
    (booking) => booking.status === "Confirmed",
  );
  const inHouse = (inHouseQuery.data?.items || []).filter(
    (booking) => booking.status === "CheckedIn",
  );
  const departures = (departuresQuery.data?.items || []).filter(
    (booking) => !["Completed", "Cancelled"].includes(booking.status),
  );

  const scheduleData = [
    ...arrivals.map((booking) => ({ ...booking, eventType: "arrival" })),
    ...departures.map((booking) => ({ ...booking, eventType: "departure" })),
  ].sort((left, right) => {
    const leftDate =
      left.eventType === "departure"
        ? left.bookingDetails?.[0]?.checkOutDate
        : left.bookingDetails?.[0]?.checkInDate;
    const rightDate =
      right.eventType === "departure"
        ? right.bookingDetails?.[0]?.checkOutDate
        : right.bookingDetails?.[0]?.checkInDate;

    return new Date(leftDate || 0).getTime() - new Date(rightDate || 0).getTime();
  });

  const tabData =
    activeTab === "schedule" ? scheduleData : activeTab === "in" ? confirmedBookings : inHouse;

  const isLoading =
    (activeTab === "schedule" &&
      (arrivalsQuery.isLoading || departuresQuery.isLoading)) ||
    (activeTab === "in" && confirmedBookingsQuery.isLoading) ||
    (activeTab === "out" && inHouseQuery.isLoading);

  const isError =
    (activeTab === "schedule" &&
      (arrivalsQuery.isError || departuresQuery.isError)) ||
    (activeTab === "in" && confirmedBookingsQuery.isError) ||
    (activeTab === "out" && inHouseQuery.isError);

  return (
    <div className="animate-in space-y-8 p-8 fade-in duration-700">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Quản lý Check in / Check out
          </h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Theo dõi lịch khách đến, danh sách chờ check in và khách đang lưu trú để check out.
          </p>
        </div>

        <GuestFlowStats
          scheduleCount={scheduleData.length}
          checkInCount={confirmedBookings.length}
          checkOutCount={inHouse.length}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`rounded-xl px-8 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "schedule"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Lịch
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("in")}
            className={`rounded-xl px-8 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "in"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Check in
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("out")}
            className={`rounded-xl px-8 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "out"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Check out
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-400">
          Không tải được dữ liệu check in / check out.
        </div>
      ) : (
        <GuestTable
          activeTab={activeTab}
          data={tabData}
          onActionSuccess={(actionType) => {
            if (actionType === "in") {
              setActiveTab("out");
              return;
            }

            setActiveTab("out");
          }}
        />
      )}
    </div>
  );
};

export default ReceptionistCheckInOutPage;
