import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CreditCard, Eye, FileText, RotateCcw, Search, XCircle } from "lucide-react";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { getBookingDetailNights, getBookingTotalAmount } from "../../utils/bookingPricing";
import {
  canUserCancelBooking,
  canUserPayBooking,
  getUserBookingStatusClassName,
  getUserBookingStatusLabel,
  resolveUserBookingStatus,
} from "../../utils/userBookingStatus";

const PAGE_SIZE = 10;

const formatDate = (value) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("vi-VN");
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const UserBookingHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState(location.state?.notice || null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.history.replaceState({}, document.title);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const queryParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page: currentPage,
      pageSize: PAGE_SIZE,
    }),
    [currentPage, fromDate, search, toDate],
  );

  const bookingsQuery = useQuery({
    queryKey: ["user-bookings", queryParams],
    queryFn: () => userBookingsApi.getMyBookings(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => userBookingsApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      setCancelTarget(null);
      setNotice(null);
      setShowCancelSuccess(true);
    },
    onError: (error) => {
      setCancelTarget(null);
      setNotice({
        type: "error",
        message: error.response?.data?.message || error.message || "Không thể hủy booking.",
      });
    },
  });

  const bookings = bookingsQuery.data?.items ?? [];
  const totalCount = bookingsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, bookingsQuery.data?.totalPages ?? 1);
  const page = bookingsQuery.data?.page ?? currentPage;
  const fromItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toItem = totalCount === 0 ? 0 : fromItem + bookings.length - 1;

  const handleClearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleFromDateChange = (event) => {
    setFromDate(event.target.value);
    setCurrentPage(1);
  };

  const handleToDateChange = (event) => {
    setToDate(event.target.value);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    if (page <= 1) return;
    setCurrentPage(page - 1);
  };

  const goToNextPage = () => {
    if (page >= totalPages) return;
    setCurrentPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">User / Lịch sử đặt phòng</p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Lịch sử đặt phòng</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Theo dõi booking của bạn, xem chi tiết, hủy khi còn chờ trả và chuyển sang thanh toán.
        </p>
      </div>

      {notice ? (
        <div
          className={`mb-6 rounded-[1.5rem] px-5 py-4 text-sm font-bold ${
            notice.type === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1.7fr)_180px_180px_140px]">
          <label className="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm theo mã booking, loại phòng, số phòng..."
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Từ ngày</p>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="mt-1.5 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            />
          </label>

          <label className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Đến ngày</p>
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              className="mt-1.5 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            />
          </label>

          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center gap-2 self-center rounded-[1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Clear filter
          </button>
        </div>

        {bookingsQuery.isLoading ? (
          <div className="py-16 text-center text-sm font-semibold text-slate-500">Đang tải lịch sử booking...</div>
        ) : bookingsQuery.isError ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm font-semibold text-rose-600">
            Không tải được lịch sử booking. Vui lòng thử lại.
          </div>
        ) : bookings.length ? (
          <>
            <div className="space-y-4">
              {bookings.map((booking) => {
                const firstDetail = booking.bookingDetails?.[0];
                const status = resolveUserBookingStatus(booking);
                const totalAmount = getBookingTotalAmount(booking.bookingDetails || []);
                const stayNights = getBookingDetailNights(firstDetail);

                return (
                  <div
                    key={booking.id}
                    className="rounded-[1.75rem] border border-slate-100 bg-slate-50 px-5 py-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-black text-slate-900">{booking.bookingCode}</p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${getUserBookingStatusClassName(status)}`}
                          >
                            {getUserBookingStatusLabel(status)}
                          </span>
                        </div>
                        <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                          <p>
                            Phòng:{" "}
                            <span className="font-bold text-slate-900">
                              {firstDetail?.roomTypeName || "--"} - {firstDetail?.roomNumber || "--"}
                            </span>
                          </p>
                          <p>
                            Thời gian:{" "}
                            <span className="font-bold text-slate-900">
                              {formatDate(firstDetail?.checkInDate)} - {formatDate(firstDetail?.checkOutDate)}
                            </span>
                          </p>
                          <p>
                            Số đêm: <span className="font-bold text-slate-900">{stayNights}</span>
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">
                          Tổng tiền tạm tính: <span className="text-slate-900">{formatCurrency(totalAmount)}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => navigate(`/user/booking/${booking.id}`)}
                          className="inline-flex h-11 min-w-[96px] items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                        >
                          <Eye size={16} />
                          Xem
                        </button>

                        {canUserPayBooking(booking) ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/user/booking-history/${booking.id}/payment`)}
                            className="inline-flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
                          >
                            <CreditCard size={16} />
                            Thanh toán
                          </button>
                        ) : null}

                        {canUserCancelBooking(booking) ? (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(booking)}
                            disabled={cancelMutation.isPending}
                            className="inline-flex h-11 min-w-[96px] items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle size={16} />
                            Hủy
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm font-medium text-slate-500">
                Hiển thị {fromItem}-{toItem} / {totalCount} booking
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  {PAGE_SIZE} / trang
                </div>
                <p className="text-sm font-bold text-slate-700">
                  Trang {page} / {totalPages}
                </p>
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={page <= 1}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={page >= totalPages}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <FileText className="mx-auto size-10" />
            <p className="mt-4 text-sm font-semibold">Không có booking nào khớp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>

      {cancelTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900">Xác nhận hủy booking</h2>
            <p className="mt-3 text-sm text-slate-600">
              Bạn có muốn hủy booking <span className="font-bold">{cancelTarget.bookingCode}</span> không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={cancelMutation.isPending}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Không
              </button>
              <button
                type="button"
                onClick={() => cancelMutation.mutate(cancelTarget.id)}
                disabled={cancelMutation.isPending}
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelMutation.isPending ? "Đang hủy..." : "Có, hủy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCancelSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-emerald-700">Đã hủy thành công</h2>
            <p className="mt-3 text-sm text-slate-600">Booking của bạn đã được hủy.</p>
            <button
              type="button"
              onClick={() => setShowCancelSuccess(false)}
              className="mt-6 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserBookingHistoryPage;
