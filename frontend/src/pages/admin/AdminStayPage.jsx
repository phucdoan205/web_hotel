import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import GuestFlowStats from "../../components/receptionist/checkinout/GuestFlowStats";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { buildBookingRoomEntries } from "../../utils/bookingRoomEntries";
import { subscribeBookingRoomFlowState } from "../../utils/bookingRoomFlowState";
import { getVietnamDateKey } from "../../utils/vietnamTime";

const AdminStayPage = () => {
  const [screenNotice, setScreenNotice] = useState(null);
  const [, setRoomFlowVersion] = useState(0);
  const navigate = useNavigate();
  const todayKey = getVietnamDateKey();

  useEffect(() => {
    if (!screenNotice) return undefined;

    const timer = window.setTimeout(() => {
      setScreenNotice(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [screenNotice]);

  useEffect(() => subscribeBookingRoomFlowState(() => setRoomFlowVersion((value) => value + 1)), []);

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

  const arrivals = (arrivalsQuery.data?.items || []).filter((booking) => booking.status === "Confirmed");
  const confirmedBookings = (confirmedBookingsQuery.data?.items || []).filter(
    (booking) => booking.status === "Confirmed",
  );
  const inHouse = (inHouseQuery.data?.items || []).filter((booking) => booking.status === "CheckedIn");
  const departures = (departuresQuery.data?.items || []).filter(
    (booking) => !["Completed", "Cancelled"].includes(booking.status),
  );

  const stayRooms = useMemo(() => {
    const entries = buildBookingRoomEntries(inHouse, todayKey);
    return entries.filter((entry) => !entry.checkedOut && !entry.dueForCheckout);
  }, [inHouse, todayKey]);

  const isLoading = inHouseQuery.isLoading;
  const isError = inHouseQuery.isError;

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
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Lưu trú</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Danh sách phòng đang lưu trú. Đến ngày trả phòng sẽ tự chuyển sang mục Trả phòng.
          </p>
        </div>

        <GuestFlowStats
          scheduleCount={arrivals.length + departures.length}
          checkInCount={confirmedBookings.length}
          checkOutCount={inHouse.length}
        />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-400">Không tải được dữ liệu khách đang lưu trú.</div>
      ) : (
        <GuestTable
          activeTab="out"
          data={stayRooms}
          dataMode="room"
          onActionSuccess={(result) => {
            if (result?.notice) {
              setScreenNotice(result.notice);
            }

            if (result?.actionType === "out") {
              navigate("/admin/check-out");
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminStayPage;
