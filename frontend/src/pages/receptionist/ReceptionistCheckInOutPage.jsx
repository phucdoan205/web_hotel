import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import GuestFlowStats from "../../components/receptionist/checkinout/GuestFlowStats";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { buildBookingRoomEntries } from "../../utils/bookingRoomEntries";
import { getVietnamDateKey } from "../../utils/vietnamTime";

const normalizeTab = (value) => (["schedule", "in", "out"].includes(value) ? value : "schedule");

const ReceptionistCheckInOutPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [screenNotice, setScreenNotice] = useState(null);
  const activeTab = normalizeTab(searchParams.get("tab"));
  const todayKey = getVietnamDateKey();

  useEffect(() => {
    if (!screenNotice) return undefined;

    const timer = window.setTimeout(() => {
      setScreenNotice(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [screenNotice]);

  const changeTab = (nextTab) => {
    const normalizedTab = normalizeTab(nextTab);
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("tab", normalizedTab);
      return nextParams;
    });
  };

  const confirmedBookingsQuery = useQuery({
    queryKey: ["confirmed-check-ins"],
    queryFn: () =>
      bookingsApi.getBookings({
        page: 1,
        pageSize: 500,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const arrivalsQuery = useQuery({
    queryKey: ["arrivals"],
    queryFn: () => bookingsApi.getArrivals({ date: todayKey }),
    staleTime: 1000 * 60 * 5,
  });

  const inHouseQuery = useQuery({
    queryKey: ["in-house"],
    queryFn: () => bookingsApi.getInHouse(),
    staleTime: 1000 * 60 * 5,
  });

  const departuresQuery = useQuery({
    queryKey: ["departures"],
    queryFn: () => bookingsApi.getDepartures({ date: todayKey }),
    staleTime: 1000 * 60 * 5,
  });

  const arrivals = (arrivalsQuery.data?.items || []).filter((booking) =>
    (booking.bookingDetails || []).some((detail) => detail?.status === "Confirmed"),
  );
  const confirmedBookings = (confirmedBookingsQuery.data?.items || []).filter((booking) =>
    (booking.bookingDetails || []).some((detail) => detail?.status === "Confirmed"),
  );
  const inHouse = (inHouseQuery.data?.items || []).filter((booking) =>
    (booking.bookingDetails || []).some((detail) => detail?.status === "CheckedIn"),
  );
  const departures = (departuresQuery.data?.items || []).filter(
    (booking) => !["Completed", "Cancelled"].includes(booking.status),
  );

  const arrivalRooms = useMemo(
    () =>
      buildBookingRoomEntries(arrivals, todayKey, {
        dateKey: todayKey,
        detailStatuses: ["Pending", "Confirmed"],
      }).filter((entry) => !entry.checkedIn),
    [arrivals, todayKey],
  );

  const stayRooms = useMemo(
    () => buildBookingRoomEntries(inHouse, todayKey).filter((entry) => entry.checkedIn && !entry.checkedOut),
    [inHouse, todayKey],
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
    activeTab === "schedule" ? scheduleData : activeTab === "in" ? arrivalRooms : stayRooms;

  const isLoading =
    (activeTab === "schedule" && (arrivalsQuery.isLoading || departuresQuery.isLoading)) ||
    (activeTab === "in" && arrivalsQuery.isLoading) ||
    (activeTab === "out" && inHouseQuery.isLoading);

  const isError =
    (activeTab === "schedule" && (arrivalsQuery.isError || departuresQuery.isError)) ||
    (activeTab === "in" && arrivalsQuery.isError) ||
    (activeTab === "out" && inHouseQuery.isError);

  return (
    <div className="animate-in space-y-8 p-8 fade-in duration-700">
      {screenNotice ? (
        <div className="sticky top-20 z-30">
          <div
            className={`mx-auto flex max-w-3xl items-start justify-between gap-4 rounded-3xl border px-5 py-4 shadow-lg ${
              screenNotice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {screenNotice.type === "success" ? (
                <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />
              ) : (
                <AlertTriangle className="mt-0.5 text-amber-600" size={22} />
              )}
              <div>
                <p className="font-bold">{screenNotice.title}</p>
                <p className="text-sm">{screenNotice.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScreenNotice(null)}
              className="rounded-xl p-2 transition hover:bg-white/70"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

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
            onClick={() => changeTab("schedule")}
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
            onClick={() => changeTab("in")}
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
            onClick={() => changeTab("out")}
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

      {activeTab === "schedule" ? (
        <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-black text-slate-900">Tab lịch đang tạm ẩn</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Phần hiển thị lịch sẽ được bổ sung sau.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-400">
          Không tải được dữ liệu check in / check out.
        </div>
      ) : (
        <GuestTable
          activeTab={activeTab}
          data={tabData}
          dataMode={activeTab === "schedule" ? "booking" : "room"}
          onActionSuccess={(result) => {
            if (result?.notice) {
              setScreenNotice(result.notice);
            }

            changeTab("out");
          }}
        />
      )}
    </div>
  );
};

export default ReceptionistCheckInOutPage;
