import React, { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  CalendarRange,
  CheckCircle,
  CircleDollarSign,
  FileText,
  QrCode,
  Search,
  SlidersHorizontal,
  SquareArrowRightExit,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import {
  getBookingPaymentState,
  isBookingDetailPaid,
} from "../../../utils/bookingPaymentState";
import {
  isBookingDetailCheckedIn,
  saveBookingDetailCheckedInSnapshot,
  saveBookingDetailCheckedOutSnapshot,
  subscribeBookingRoomFlowState,
} from "../../../utils/bookingRoomFlowState";
import {
  getRoomEntryGuestName,
  getRoomEntryName,
  getRoomEntryNumber,
  getRoomEntryPrice,
} from "../../../utils/bookingRoomEntries";
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
  Pending: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Confirmed: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  CheckedOut: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
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

const getGuestName = (booking) => getRoomEntryGuestName(booking);

const getRoomNumber = (detail) => getRoomEntryNumber(detail);

const getRoomName = (booking, detail) => getRoomEntryName(booking, detail);

const getBasePrice = (booking, detail) => getRoomEntryPrice(booking, detail);

const getRoomEntryPaidState = (roomEntry) => isBookingDetailPaid(roomEntry.booking, roomEntry.detailId);

const getBookingStateLabel = (booking, activeTab) => {
  if (activeTab === "schedule") {
    return booking.eventType === "departure" ? "Lịch check out" : "Lịch check in";
  }

  if (activeTab === "out") return "Booking: CheckedOut";
  if (booking.status === "CheckedOut") return "Booking: CheckedOut";
  if (booking.status === "CheckedIn") return "Booking: CheckedIn";
  if (booking.status === "Pending") return "Booking: Pending";
  return "Booking: Confirmed";
};

const getVisibleDetails = (booking, activeTab) => {
  const details = booking.bookingDetails || [];

  if (details.length === 0) return [];
  if (activeTab !== "in") return details;

  const paidDetails = details.filter((detail) => isBookingDetailPaid(booking, detail.id));
  return paidDetails.length > 0 ? paidDetails : details;
};

const updateItems = (oldData, updater) => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    items: updater(oldData.items || []),
  };
};

const GuestTable = ({
  activeTab,
  data,
  dataMode = "booking",
  onActionSuccess,
  onInvoiceCreated,
}) => {
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [confirmingBooking, setConfirmingBooking] = useState(null);
  const [confirmingRoom, setConfirmingRoom] = useState(null);
  const [, setRoomFlowVersion] = useState(0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => subscribeBookingRoomFlowState(() => setRoomFlowVersion((value) => value + 1)), []);

  const filteredData = useMemo(() => {
    if (dataMode === "room") {
      return data.filter((entry) => {
        const normalizedSearch = search.toLowerCase();
        const guestName = String(entry.guestName || "").toLowerCase();
        const bookingCode = String(entry.bookingCode || "").toLowerCase();
        const roomNumber = String(entry.roomNumber || "").toLowerCase();
        const matchSearch =
          guestName.includes(normalizedSearch) ||
          bookingCode.includes(normalizedSearch) ||
          roomNumber.includes(normalizedSearch);

        const matchRoom = roomFilter
          ? roomNumber.includes(roomFilter.toLowerCase())
          : true;

        return matchSearch && matchRoom;
      });
    }

    return data.filter((booking) => {
      const guestName = getGuestName(booking).toLowerCase();
      const bookingCode = String(booking.bookingCode || "").toLowerCase();
      const normalizedSearch = search.toLowerCase();

      const matchSearch =
        guestName.includes(normalizedSearch) || bookingCode.includes(normalizedSearch);

      const matchRoom = roomFilter
        ? (booking.bookingDetails || []).some((detail) =>
            String(getRoomNumber(detail)).toLowerCase().includes(roomFilter.toLowerCase()),
          )
        : true;

      return matchSearch && matchRoom;
    });
  }, [data, dataMode, roomFilter, search]);

  const checkInMutation = useMutation({
    mutationFn: async (subject) => {
      if (!subject?.detailId) {
        const updatedBooking = await bookingsApi.checkIn(subject.id);
        return { mode: "booking", booking: updatedBooking || subject };
      }

      // Per-room check-in: call backend endpoint to mark this booking detail as CheckedIn
      await bookingsApi.checkInBookingDetail(subject.bookingId, subject.detailId);

      // Save a local snapshot for immediate UI responsiveness
      saveBookingDetailCheckedInSnapshot(subject.bookingId, subject.detailId, {
        ...subject,
        checkedIn: true,
        roomStatus: "Occupied",
        detail: {
          ...subject.detail,
          status: "CheckedIn",
        },
        booking: {
          ...subject.booking,
          status: "CheckedIn",
        },
      });

      return { mode: "room", roomEntry: subject };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["departures"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["arrivals"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setConfirmingBooking(null);
      onActionSuccess?.({
        actionType: "in",
        bookingId: result?.mode === "room" ? result.roomEntry.bookingId : result?.booking?.id,
        detailId: result?.mode === "room" ? result.roomEntry.detailId : undefined,
        notice: {
          type: "success",
          title: "Check in thành công",
          message: "Khách đã được nhận phòng.",
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
    mutationFn: async (roomEntry) => {
      await bookingsApi.checkOutBookingDetail(roomEntry.bookingId, roomEntry.detailId);
      saveBookingDetailCheckedOutSnapshot(roomEntry.bookingId, roomEntry.detailId, {
        ...roomEntry,
        checkedIn: false,
        checkedOut: true,
        roomStatus: "CheckedOut",
        detail: {
          ...roomEntry.detail,
          status: "CheckedOut",
        },
        booking: {
          ...roomEntry.booking,
          status: "CheckedOut",
        },
      });

      return { roomEntry, bookingCompleted: false };
    },
    onSuccess: ({ roomEntry, bookingCompleted }) => {
      if (bookingCompleted) {
        queryClient.setQueryData(["in-house"], (oldData) =>
          updateItems(oldData, (items) => items.filter((booking) => booking.id !== roomEntry.bookingId)),
        );
      }

      queryClient.invalidateQueries({ queryKey: ["departures"] });
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setConfirmingRoom(null);
      onActionSuccess?.({
        actionType: "out",
        bookingId: roomEntry.bookingId,
        detailId: roomEntry.detailId,
        notice: {
          type: "success",
          title: "Check out thành công",
          message: bookingCompleted
            ? `Booking ${roomEntry.bookingCode} đã trả hết tất cả phòng.`
            : `Phòng ${roomEntry.roomNumber} đã được check out.`,
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

  const handleCheckIn = async (roomEntry) => {
    await checkInMutation.mutateAsync(roomEntry);
  };

  const handleCheckOutRoom = async (roomEntry) => {
    await checkOutMutation.mutateAsync(roomEntry);
  };

  const handleCreateInvoice = (roomEntry) => {
    navigate(`/admin/invoices/create?bookingId=${roomEntry.bookingId}&detailId=${roomEntry.detailId}`);
    onInvoiceCreated?.(roomEntry);
  };

  const handleOpenPayment = (bookingId, detailId) => {
    const search = detailId ? `?detailId=${detailId}` : "";
    navigate(`/admin/bookings/${bookingId}/payment-qr${search}`);
  };

  const renderRoomMode = () => {
    if (filteredData.length === 0) {
      return (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <p className="text-lg font-black text-slate-900">Không có dữ liệu phù hợp</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Thử đổi từ khóa tìm kiếm hoặc bộ lọc số phòng.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {filteredData.map((entry) => {
          const isCheckOutLoading =
            checkOutMutation.isPending &&
            checkOutMutation.variables?.bookingId === entry.bookingId &&
            checkOutMutation.variables?.detailId === entry.detailId;
          const isCheckInLoading =
            checkInMutation.isPending &&
            checkInMutation.variables?.bookingId === entry.bookingId &&
            checkInMutation.variables?.detailId === entry.detailId;
          const roomPaid = getRoomEntryPaidState(entry);
          const roomCheckedIn = entry.checkedIn || isBookingDetailCheckedIn(entry.bookingId, entry.detailId);
          const canCheckIn = roomPaid && !roomCheckedIn;

          return (
            <article
              key={entry.id}
              className="rounded-[30px] border border-slate-200 bg-slate-50/70 p-5 transition-all hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Phòng {entry.roomNumber}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">{entry.roomName}</h3>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {activeTab === "in" ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                      {
                        // Show per-room label: if this detail is paid or explicitly Confirmed => ready to receive,
                        // otherwise show 'Chờ xác nhận' so receptionist can pay the room.
                      }
                      {entry.detail?.status === "Confirmed" || getRoomEntryPaidState(entry) || entry.booking?.status === "Confirmed"
                        ? "Cho nhan phong"
                        : "Cho xac nhan"}
                    </span>
                  ) : entry.checkedOut ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                      Đã checkout
                    </span>
                  ) : entry.dueForCheckout ? (
                    <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700 ring-1 ring-orange-200">
                      Chờ trả phòng
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-200">
                      Đang lưu trú
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <UserRound className="size-4 text-emerald-500" />
                {entry.guestName}
              </div>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <div className="space-y-1 text-sm">
                  <p className="font-black text-slate-900">Mã booking: {entry.bookingCode}</p>
                  <div className="flex items-center gap-2 font-medium text-slate-500">
                    <CalendarRange className="size-4 text-slate-400" />
                    <span>
                      {formatVietnamDate(entry.checkInDate)} - {formatVietnamDate(entry.checkOutDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CircleDollarSign className="size-4 text-orange-500" />
                    {priceFormatter.format(entry.basePrice)} đ / đêm
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <BedDouble className="size-4 text-sky-500" />
                    {entry.roomName}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        roomStatusStyles[entry.roomStatus] ?? roomStatusStyles.OutOfOrder
                      }`}
                    >
                      {entry.roomStatus}
                    </span>
                  </div>
                </div>

                {entry.cleaningStatus ? (
                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        cleaningStatusStyles[entry.cleaningStatus] ?? cleaningStatusStyles.Dirty
                      }`}
                    >
                      Trạng thái dọn phòng: {entry.cleaningStatus}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 space-y-3">
                {activeTab === "in" ? (
                  <>
                    {roomCheckedIn ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        Phong nay da check in.
                      </div>
                    ) : roomPaid ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        Phong nay da thanh toan 1 dem.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(entry.bookingId, entry.detailId)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-700"
                      >
                        <QrCode size={18} />
                        Thanh toan QR phong {entry.roomNumber}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmingBooking(entry)}
                      disabled={isCheckInLoading || !canCheckIn}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all disabled:cursor-not-allowed ${
                        isCheckInLoading || !canCheckIn
                          ? actionConfig.in.loadingClassName
                          : actionConfig.in.idleClassName
                      }`}
                    >
                      <CheckCircle size={18} />
                      {isCheckInLoading ? "Đang xử lý..." : "Check-in phòng này"}
                    </button>
                  </>
                ) : !entry.checkedOut ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingRoom(entry)}
                    disabled={isCheckOutLoading}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all disabled:cursor-not-allowed ${
                      isCheckOutLoading
                        ? actionConfig.out.loadingClassName
                        : actionConfig.out.idleClassName
                    }`}
                  >
                    <SquareArrowRightExit size={18} />
                    {isCheckOutLoading ? "Đang xử lý..." : "Check-out phòng này"}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                      Phòng này đã check out.
                    </div>
                    {entry.invoiced ? (
                      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">
                        Hóa đơn đã được tạo.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCreateInvoice(entry)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-black"
                      >
                        <FileText size={18} />
                        Tạo hóa đơn
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderBookingMode = () => {
    const renderRoomList = (booking) => {
      const visibleDetails = getVisibleDetails(booking, activeTab);

      if (visibleDetails.length === 0) return null;

      return (
        <div className="mt-4 space-y-3">
          {visibleDetails.map((detail, index) => {
            const roomNumber = getRoomNumber(detail);
            const roomName = getRoomName(booking, detail);
            // Determine room status for display: prefer per-detail status, then room entity, then booking status.
            let roomStatus = "Pending";
            if (detail?.status) {
              if (detail.status === "CheckedIn") roomStatus = "Occupied";
              else if (detail.status === "CheckedOut") roomStatus = "CheckedOut";
              else roomStatus = detail.status; // Pending or Confirmed
            } else if (detail.room?.status) {
              roomStatus = detail.room.status;
            } else if (booking?.status) {
              roomStatus = booking.status === "Confirmed" ? "Confirmed" : "Pending";
            }

            const cleaningStatus =
              detail.room?.cleaningStatus || booking.cleaningStatus || detail.cleaningStatus;
            const basePrice = getBasePrice(booking, detail);
            const dateLabel =
              detail.checkInDate || detail.checkOutDate
                ? `${formatVietnamDate(detail.checkInDate)} - ${formatVietnamDate(detail.checkOutDate)}`
                : "--";

            return (
              <div
                key={detail.id || `${booking.id}-detail-${index}`}
                className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Phòng {roomNumber}
                    </p>
                    <h4 className="mt-1 text-lg font-black text-slate-900">{roomName}</h4>
                  </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        roomStatusStyles[roomStatus] ?? roomStatusStyles.OutOfOrder
                      }`}
                    >
                      {roomStatus}
                    </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CircleDollarSign className="size-4 text-orange-500" />
                    {priceFormatter.format(basePrice)} đ / đêm
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <BedDouble className="size-4 text-sky-500" />
                    {roomName}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <CalendarRange className="size-4 text-slate-400" />
                    <span>{dateLabel}</span>
                  </div>
                </div>

                {cleaningStatus ? (
                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        cleaningStatusStyles[cleaningStatus] ?? cleaningStatusStyles.Dirty
                      }`}
                    >
                      Trạng thái dọn phòng: {cleaningStatus}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      );
    };

    const renderActionButton = (booking) => {
      if (activeTab === "schedule") return null;

      const config = actionConfig[activeTab];
      const paymentState = getBookingPaymentState(booking);
      const unpaidDetails =
        activeTab === "in"
          ? (booking.bookingDetails || []).filter((detail) => !isBookingDetailPaid(booking, detail.id))
          : [];
      // Only allow bulk check-in for a booking when deposit is complete for all rooms
      const canCheckIn = activeTab !== "in" || paymentState.depositComplete;
      const isLoading =
        activeTab === "in"
          ? checkInMutation.isPending && checkInMutation.variables === booking.id
          : false;
      const Icon = config.icon;

      return (
        <div className="mt-5 space-y-3">
          {activeTab === "in" ? (
            paymentState.depositComplete ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                Booking đã thanh toán đủ 1 đêm cho tất cả phòng.
              </div>
            ) : (
              <div className="space-y-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-black text-sky-900">
                  <QrCode size={16} />
                  Thanh toán QR 1 đêm
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenPayment(booking.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-700"
                >
                  <CircleDollarSign size={18} />
                  Thanh toán QR tất cả phòng
                </button>
                {unpaidDetails.map((detail, index) => {
                  const roomNumber = getRoomNumber(detail) || index + 1;

                  return (
                    <button
                      key={detail.id || `${booking.id}-payment-${index}`}
                      type="button"
                      onClick={() => handleOpenPayment(booking.id, detail.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-100"
                    >
                      <QrCode size={16} />
                      Thanh toán QR phòng {roomNumber}
                    </button>
                  );
                })}
              </div>
            )
          ) : null}
          <button
            type="button"
            onClick={() => setConfirmingBooking(booking)}
            disabled={isLoading || (activeTab === "in" && !canCheckIn)}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all disabled:cursor-not-allowed ${
              isLoading || (activeTab === "in" && !canCheckIn)
                ? config.loadingClassName
                : config.idleClassName
            }`}
          >
            <Icon size={18} />
            {isLoading ? "Đang xử lý..." : config.label}
          </button>
        </div>
      );
    };

    if (filteredData.length === 0) {
      return (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <p className="text-lg font-black text-slate-900">Không có dữ liệu phù hợp</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Thử đổi từ khóa tìm kiếm hoặc bộ lọc số phòng.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {filteredData.map((booking) => {
          const visibleDetails = getVisibleDetails(booking, activeTab);
          const roomLabel =
            visibleDetails.length <= 1
              ? `Phòng ${getRoomNumber(visibleDetails[0])}`
              : `${visibleDetails.length} phòng`;

          return (
            <article
              key={`${activeTab}-${booking.id}`}
              className="rounded-[30px] border border-slate-200 bg-slate-50/70 p-5 transition-all hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {roomLabel}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    {visibleDetails.length > 1 ? "Danh sách phòng đã đặt" : getRoomName(booking, visibleDetails[0])}
                  </h3>
                </div>
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
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <UserRound className="size-4 text-emerald-500" />
                {getGuestName(booking)}
              </div>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                <div className="space-y-1 text-sm">
                  <p className="font-black text-slate-900">Mã booking: {booking.bookingCode}</p>
                  <p className="font-semibold text-slate-600">{getBookingStateLabel(booking, activeTab)}</p>
                  {visibleDetails.length > 1 ? (
                    <p className="text-xs font-medium text-slate-500">
                      Phòng hiển thị: {visibleDetails.map((detail) => getRoomNumber(detail)).join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>

              {renderRoomList(booking)}
              {renderActionButton(booking)}
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <>
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

        <div className="p-6">{dataMode === "room" ? renderRoomMode() : renderBookingMode()}</div>
      </div>

      {confirmingBooking ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                <TriangleAlert size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Xác nhận check in</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Bạn có chắc muốn check in booking{" "}
                  <span className="font-bold">{confirmingBooking.bookingCode}</span> cho khách{" "}
                  <span className="font-bold">{getGuestName(confirmingBooking)}</span> không?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingBooking(null)}
                className="rounded-2xl bg-slate-100 px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Không
              </button>
              <button
                type="button"
                onClick={() => handleCheckIn(confirmingBooking)}
                disabled={checkInMutation.isPending}
                className="rounded-2xl bg-emerald-600 px-4 py-2 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {checkInMutation.isPending ? "Đang xử lý..." : "Có, check in"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmingRoom ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                <TriangleAlert size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Xác nhận check out</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Check out phòng <span className="font-bold">{confirmingRoom.roomNumber}</span> của
                  booking <span className="font-bold">{confirmingRoom.bookingCode}</span> cho khách{" "}
                  <span className="font-bold">{confirmingRoom.guestName}</span>?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingRoom(null)}
                className="rounded-2xl bg-slate-100 px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Không
              </button>
              <button
                type="button"
                onClick={() => handleCheckOutRoom(confirmingRoom)}
                disabled={checkOutMutation.isPending}
                className="rounded-2xl bg-rose-600 px-4 py-2 font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {checkOutMutation.isPending ? "Đang xử lý..." : "Có, check out"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default GuestTable;

