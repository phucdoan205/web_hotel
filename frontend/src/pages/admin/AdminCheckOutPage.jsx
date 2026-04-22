import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileText, X } from "lucide-react";
import GuestFlowStats from "../../components/receptionist/checkinout/GuestFlowStats";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { buildBookingRoomEntries } from "../../utils/bookingRoomEntries";
import { hasPermission } from "../../utils/permissions";
import {
  getStoredCheckedOutRoomEntries,
  subscribeBookingRoomFlowState,
} from "../../utils/bookingRoomFlowState";
import { formatVietnamDate, getVietnamDateKey } from "../../utils/vietnamTime";

const AdminCheckOutPage = () => {
  const canViewBookings = hasPermission("VIEW_BOOKINGS");
  const canCheckOutBooking = hasPermission("CHECKOUT_BOOKING");
  const canCreateInvoices = hasPermission("CREATE_INVOICES");
  const [screenNotice, setScreenNotice] = useState(null);
  const [, setRoomFlowVersion] = useState(0);
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
        page: 1,
        pageSize: 500,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const arrivalsQuery = useQuery({
    queryKey: ["arrivals"],
    queryFn: () => bookingsApi.getArrivals({ date: getVietnamDateKey() }),
    staleTime: 1000 * 60 * 5,
  });

  const checkoutBookingsQuery = useQuery({
    queryKey: ["checkout-bookings"],
    queryFn: () =>
      bookingsApi.getBookings({
        page: 1,
        pageSize: 500,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const departuresQuery = useQuery({
    queryKey: ["departures"],
    queryFn: () => bookingsApi.getDepartures({ date: getVietnamDateKey() }),
    staleTime: 1000 * 60 * 5,
  });

  const arrivals = (arrivalsQuery.data?.items || []).filter((booking) =>
    (booking.bookingDetails || []).some((detail) => detail?.status === "Confirmed"),
  );
  const confirmedBookings = (confirmedBookingsQuery.data?.items || []).filter((booking) =>
    (booking.bookingDetails || []).some((detail) => detail?.status === "Confirmed"),
  );
  const checkoutBookings = (checkoutBookingsQuery.data?.items || []).filter((booking) =>
    (booking.bookingDetails || []).some((detail) => detail?.status === "CheckedOut"),
  );
  const departures = (departuresQuery.data?.items || []).filter(
    (booking) => !["Completed", "Cancelled"].includes(booking.status),
  );

  const checkoutRooms = useMemo(() => {
    const apiEntries = buildBookingRoomEntries(checkoutBookings, todayKey);
    const storedCheckedOutEntries = getStoredCheckedOutRoomEntries();
    const merged = [...apiEntries, ...storedCheckedOutEntries].reduce((map, entry) => {
      map.set(`${entry.bookingId}-${entry.detailId}`, entry);
      return map;
    }, new Map());

    return Array.from(merged.values()).filter((entry) => entry.checkedOut);
  }, [checkoutBookings, todayKey]);

  const checkedOutRooms = useMemo(
    () => checkoutRooms,
    [checkoutRooms],
  );

  const isLoading = checkoutBookingsQuery.isLoading;
  const isError = checkoutBookingsQuery.isError;

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
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Trả phòng</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Các phòng đến hạn trả hôm nay sẽ hiện ở đây, kể cả booking nhiều phòng.
          </p>
        </div>

        <GuestFlowStats
          scheduleCount={arrivals.length + departures.length}
          checkInCount={confirmedBookings.length}
          checkOutCount={checkedOutRooms.length}
        />
      </div>

      <div className="rounded-[2rem] border border-orange-100 bg-orange-50 px-5 py-4">
        <p className="text-sm font-bold text-orange-700">Ngày xử lý trả phòng</p>
        <p className="mt-1 text-lg font-black text-orange-900">
          {formatVietnamDate(`${todayKey}T00:00:00+07:00`)}
        </p>
      </div>

      {!canViewBookings ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-6 text-sm font-bold text-amber-900">
          Bạn không có quyền xem danh sách trả phòng.
        </div>
      ) : isLoading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-400">Không tải được dữ liệu trả phòng.</div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="rounded-[2rem] border border-sky-100 bg-sky-50 px-5 py-4">
              <div className="flex items-center gap-2 text-sky-700">
                <FileText size={18} />
                <p className="text-sm font-bold">Phòng đã checkout / chờ hóa đơn</p>
              </div>
              <p className="mt-1 text-2xl font-black text-sky-900">{checkedOutRooms.length}</p>
            </div>

            <GuestTable
              activeTab="out"
              data={checkedOutRooms}
              dataMode="room"
              onInvoiceCreated={(roomEntry) => {
                if (!canCreateInvoices) return;
                setScreenNotice({
                  type: "success",
                  title: "Đã tạo hóa đơn",
                  message: `Hóa đơn phòng ${roomEntry.roomNumber} hiện đã được hiển thị.`,
                });
              }}
              onActionSuccess={(result) => {
                if (result?.notice && canCheckOutBooking) {
                  setScreenNotice(result.notice);
                }
              }}
            />
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminCheckOutPage;
