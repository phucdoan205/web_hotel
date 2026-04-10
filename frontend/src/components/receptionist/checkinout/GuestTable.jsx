import React, { useMemo, useState } from "react";
import {
  BedDouble,
  CalendarRange,
  CheckCircle,
  CircleDollarSign,
  Search,
  SlidersHorizontal,
  SquareArrowRightExit,
  UserRound,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import { formatVietnamDate } from "../../../utils/vietnamTime";

const priceFormatter = new Intl.NumberFormat("vi-VN");

const eventBadgeStyles = {
  arrival: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  departure: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  stay: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
};

const roomStatusStyles = {
  Available: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Occupied: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  Maintenance: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  Cleaning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  OutOfOrder: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

const cleaningStatusStyles = {
  Dirty: "bg-white text-slate-600 ring-1 ring-slate-200",
  InProgress: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Clean: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Inspected: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  Pickup: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};

const actionConfig = {
  in: {
    label: "Check in",
    idleClassName: "bg-emerald-600 text-white hover:bg-emerald-700",
    loadingClassName: "bg-emerald-300 text-white",
    icon: CheckCircle,
  },
  out: {
    label: "Check out",
    idleClassName: "bg-rose-600 text-white hover:bg-rose-700",
    loadingClassName: "bg-rose-300 text-white",
    icon: SquareArrowRightExit,
  },
};

const getGuestName = (booking) => booking.guestName || booking.guest?.name || "Khách chưa rõ tên";

const getRoomName = (booking, detail) =>
  detail?.roomTypeName || detail?.roomType?.name || booking.roomTypeName || "Phòng";

const getBookingStateLabel = (booking, activeTab) => {
  if (activeTab === "schedule") {
    return booking.eventType === "departure" ? "Lịch check out" : "Lịch check in";
  }

  return activeTab === "out" ? "Booking: CheckedIn" : "Booking: Confirmed";
};

const GuestTable = ({ activeTab, data, onActionSuccess }) => {
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const queryClient = useQueryClient();

  const filteredData = useMemo(() => {
    return data.filter((booking) => {
      const guestName = getGuestName(booking).toLowerCase();
      const bookingCode = String(booking.bookingCode || "").toLowerCase();
      const normalizedSearch = search.toLowerCase();

      const matchSearch =
        guestName.includes(normalizedSearch) || bookingCode.includes(normalizedSearch);

      const matchRoom = roomFilter
        ? (booking.bookingDetails || []).some((detail) =>
            String(detail.room?.roomNumber || detail.roomNumber || "")
              .toLowerCase()
              .includes(roomFilter.toLowerCase()),
          )
        : true;

      return matchSearch && matchRoom;
    });
  }, [data, roomFilter, search]);

  const checkInMutation = useMutation({
    mutationFn: (bookingId) => bookingsApi.checkIn(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData(["confirmed-check-ins"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter((booking) => booking.id !== bookingId),
        };
      });

      queryClient.setQueryData(["arrivals"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter((booking) => booking.id !== bookingId),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["departures"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onActionSuccess?.({
        actionType: "in",
        bookingId,
        notice: {
          type: "success",
          title: "Check in thành công",
          message: "Khách đã được nhận phòng và chuyển sang danh sách check out.",
        },
      });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Check-in failed";

      alert(message);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingId) => bookingsApi.checkOut(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData(["in-house"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter((booking) => booking.id !== bookingId),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["departures"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onActionSuccess?.({
        actionType: "out",
        bookingId,
        notice: {
          type: "success",
          title: "Check out thành công",
          message: "Booking đã hoàn tất và khách đã được trả phòng.",
        },
      });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Check-out failed";

      alert(message);
    },
  });

  const handleCheckIn = async (bookingId) => {
    await checkInMutation.mutateAsync(bookingId);
  };

  const handleCheckOut = async (bookingId) => {
    await checkOutMutation.mutateAsync(bookingId);
  };

  const renderActionButton = (booking) => {
    if (activeTab === "schedule") return null;

    const config = actionConfig[activeTab];
    const isLoading =
      activeTab === "in"
        ? checkInMutation.isPending && checkInMutation.variables === booking.id
        : checkOutMutation.isPending && checkOutMutation.variables === booking.id;
    const Icon = config.icon;

    return (
      <button
        type="button"
        onClick={() => (activeTab === "in" ? handleCheckIn(booking.id) : handleCheckOut(booking.id))}
        disabled={isLoading}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all disabled:cursor-not-allowed ${
          isLoading ? config.loadingClassName : config.idleClassName
        }`}
      >
        <Icon size={18} />
        {isLoading ? "Đang xử lý..." : config.label}
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-gray-50 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Tìm khách hoặc mã booking..."
              className="w-64 rounded-xl bg-gray-50 py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              value={roomFilter}
              onChange={(event) => setRoomFilter(event.target.value)}
              placeholder="Lọc số phòng..."
              className="w-40 rounded-xl bg-gray-50 py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setRoomFilter("");
          }}
          className="text-xs font-bold text-gray-400 hover:text-gray-600"
        >
          Đặt lại
        </button>
      </div>

      <div className="p-6">
        {filteredData.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredData.map((booking) => {
              const bookingDetails = booking.bookingDetails || [];
              const primaryDetail = bookingDetails[0] || {};
              const roomNumber = primaryDetail.room?.roomNumber || primaryDetail.roomNumber || "--";
              const roomName = getRoomName(booking, primaryDetail);
              const roomStatus = primaryDetail.room?.status || booking.roomStatus || "Occupied";
              const cleaningStatus =
                primaryDetail.room?.cleaningStatus ||
                booking.cleaningStatus ||
                primaryDetail.cleaningStatus;
              const basePrice =
                primaryDetail.pricePerNight ||
                primaryDetail.room?.basePrice ||
                primaryDetail.roomType?.basePrice ||
                primaryDetail.basePrice ||
                booking.basePrice ||
                booking.totalAmount ||
                0;
              const guestName = getGuestName(booking);
              const checkInDate = primaryDetail.checkInDate;
              const checkOutDate = primaryDetail.checkOutDate;
              const dateLabel =
                checkInDate || checkOutDate
                  ? `${formatVietnamDate(checkInDate)} - ${formatVietnamDate(checkOutDate)}`
                  : "--";

              return (
                <article
                  key={`${activeTab}-${booking.id}`}
                  className="rounded-[30px] border border-slate-200 bg-slate-50/70 p-5 transition-all hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        Phòng {roomNumber}
                      </p>
                      <h3 className="mt-1 text-2xl font-black text-slate-900">{roomName}</h3>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        roomStatusStyles[roomStatus] ?? roomStatusStyles.OutOfOrder
                      }`}
                    >
                      {roomStatus}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CircleDollarSign className="size-4 text-orange-500" />
                      {priceFormatter.format(basePrice)} đ / đêm
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <BedDouble className="size-4 text-sky-500" />
                      {roomName}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <UserRound className="size-4 text-emerald-500" />
                      {guestName}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        eventBadgeStyles[booking.eventType || "stay"] ?? eventBadgeStyles.stay
                      }`}
                    >
                      {activeTab === "schedule"
                        ? booking.eventType === "departure"
                          ? "Check out hôm nay"
                          : "Check in hôm nay"
                        : getBookingStateLabel(booking, activeTab)}
                    </span>

                    {cleaningStatus ? (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                          cleaningStatusStyles[cleaningStatus] ?? cleaningStatusStyles.Dirty
                        }`}
                      >
                        Trạng thái dọn phòng: {cleaningStatus}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    <div className="space-y-1 text-sm">
                      <p className="font-black text-slate-900">Mã booking: {booking.bookingCode}</p>
                      <p className="font-semibold text-slate-600">
                        {getBookingStateLabel(booking, activeTab)}
                      </p>
                      <div className="flex items-center gap-2 font-medium text-slate-500">
                        <CalendarRange className="size-4 text-slate-400" />
                        <span>{dateLabel}</span>
                      </div>
                    </div>
                  </div>

                  {renderActionButton(booking)}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <p className="text-lg font-black text-slate-900">Không có dữ liệu phù hợp</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Thử đổi từ khóa tìm kiếm hoặc bộ lọc số phòng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestTable;
