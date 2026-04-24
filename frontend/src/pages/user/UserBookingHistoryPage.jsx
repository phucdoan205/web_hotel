import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Eye, FileText, XCircle } from "lucide-react";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { getBookingDetailNights, getBookingTotalAmount } from "../../utils/bookingPricing";
import {
  canUserCancelBooking,
  canUserPayBooking,
  getUserBookingStatusClassName,
  getUserBookingStatusLabel,
  resolveUserBookingStatus,
} from "../../utils/userBookingStatus";

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

  useEffect(() => {
    window.history.replaceState({}, document.title);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const bookingsQuery = useQuery({
    queryKey: ["user-bookings"],
    queryFn: () => userBookingsApi.getMyBookings({ page: 1, pageSize: 100 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => userBookingsApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      setNotice({
        type: "success",
        message: "Booking đã được hủy thành công.",
      });
    },
    onError: (error) => {
      setNotice({
        type: "error",
        message: error.response?.data?.message || error.message || "Không thể hủy booking.",
      });
    },
  });

  const bookings = bookingsQuery.data?.items ?? [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          User / Lịch sử đặt phòng
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Lịch sử đặt phòng</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Theo dõi booking của bạn, xem chi tiết, hủy khi còn Pending và chuyển sang thanh toán.
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
        {bookingsQuery.isLoading ? (
          <div className="py-16 text-center text-sm font-semibold text-slate-500">
            Đang tải lịch sử booking...
          </div>
        ) : bookingsQuery.isError ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm font-semibold text-rose-600">
            Không tải được lịch sử booking. Vui lòng thử lại.
          </div>
        ) : bookings.length ? (
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
                          Phòng: <span className="font-bold text-slate-900">{firstDetail?.roomTypeName || "--"}</span>
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

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/user/booking/${booking.id}`)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                      >
                        <Eye size={16} />
                        Xem
                      </button>

                      {canUserPayBooking(booking) ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/user/booking-history/${booking.id}/payment`)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          <CreditCard size={16} />
                          Thanh toán
                        </button>
                      ) : null}

                      {canUserCancelBooking(booking) ? (
                        <button
                          type="button"
                          onClick={() => cancelMutation.mutate(booking.id)}
                          disabled={cancelMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
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
        ) : (
          <div className="py-16 text-center text-slate-400">
            <FileText className="mx-auto size-10" />
            <p className="mt-4 text-sm font-semibold">Bạn chưa có lịch sử đặt phòng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingHistoryPage;
