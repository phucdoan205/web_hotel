import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarRange, CreditCard, Hotel, LogOut, ReceiptText, XCircle } from "lucide-react";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { userServicesApi } from "../../api/user/servicesApi";
import { getBookingDetailNights, getBookingDetailTotal, getBookingTotalAmount } from "../../utils/bookingPricing";
import {
  canUserCancelBooking,
  canUserPayBooking,
  getUserBookingStatusClassName,
  getUserBookingStatusLabel,
  resolveUserBookingStatus,
} from "../../utils/userBookingStatus";

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const formatDateTime = (value) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleString("vi-VN");
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const BookingDetailPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  const bookingQuery = useQuery({
    queryKey: ["user-booking", id],
    queryFn: () => userBookingsApi.getMyBookingById(id),
    enabled: Boolean(id),
  });

  const servicesQuery = useQuery({
    queryKey: ["user-booking-services", id],
    queryFn: () => userServicesApi.getUsageHistory(),
    enabled: Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: () => userBookingsApi.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["user-booking", id] });
      setShowCancelConfirm(false);
      setShowCancelSuccess(true);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => userBookingsApi.checkOutBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["user-booking", id] });
      setShowCheckoutConfirm(false);
      setShowCheckoutSuccess(true);
    },
  });

  const booking = bookingQuery.data;
  const bookingStatus = resolveUserBookingStatus(booking);
  const roomTotalAmount = useMemo(() => getBookingTotalAmount(booking?.bookingDetails || []), [booking]);
  const serviceItems = useMemo(() => {
    const currentBookingId = Number(booking?.id || id || 0);
    return (servicesQuery.data || []).filter((item) => item.bookingId === currentBookingId);
  }, [booking?.id, id, servicesQuery.data]);
  const serviceTotalAmount = useMemo(
    () => serviceItems.reduce((sum, item) => sum + Number(item.lineTotal || item.quantity * item.unitPrice || 0), 0),
    [serviceItems],
  );
  const totalAmount = roomTotalAmount + serviceTotalAmount;
  const firstImage = booking?.bookingDetails?.[0]?.room?.imageUrls?.[0] || fallbackImage;
  const canCheckOut = useMemo(
    () => (booking?.bookingDetails || []).some((detail) => detail?.status === "CheckedIn"),
    [booking?.bookingDetails],
  );

  const handleCloseSuccess = () => {
    setShowCancelSuccess(false);
    navigate("/booking-history", {
      replace: true,
      state: {
        notice: {
          type: "success",
          message: "Đã hủy thành công.",
        },
      },
    });
  };

  if (bookingQuery.isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500">Đang tải booking...</div>;
  }

  if (bookingQuery.isError || !booking) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Không tìm thấy thông tin booking của bạn.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/booking-history")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Quay lại lịch sử
          </button>
          <h1 className="mt-4 text-3xl font-black text-slate-900">{booking.bookingCode}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${getUserBookingStatusClassName(bookingStatus)}`}
            >
              {getUserBookingStatusLabel(bookingStatus)}
            </span>
            <p className="text-sm font-medium text-slate-500">
              Tổng tiền: <span className="font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canUserPayBooking(booking) ? (
            <button
              type="button"
              onClick={() => navigate(`/booking-history/${booking.id}/payment`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <CreditCard size={16} />
              Thanh toán
            </button>
          ) : null}
          {canUserCancelBooking(booking) ? (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XCircle size={16} />
              {cancelMutation.isPending ? "Đang hủy..." : "Hủy booking"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <img src={firstImage} alt={booking.bookingCode} className="h-[340px] w-full object-cover" />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Hotel className="text-blue-600" size={20} />
              <h2 className="text-xl font-black text-slate-900">Thông tin phòng đã đặt</h2>
            </div>

            <div className="mt-6 space-y-4">
              {(booking.bookingDetails || []).map((detail) => (
                <div key={detail.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-slate-900">
                        {detail.roomTypeName || "Phòng"} - Phòng {detail.roomNumber || "--"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {formatDateTime(detail.checkInDate)} - {formatDateTime(detail.checkOutDate)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${getUserBookingStatusClassName(
                        detail.status || "Pending",
                      )}`}
                    >
                      {getUserBookingStatusLabel(detail.status || "Pending")}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Số đêm</p>
                      <p className="mt-2 text-lg font-black text-slate-900">{getBookingDetailNights(detail)}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Giá / đêm</p>
                      <p className="mt-2 text-lg font-black text-slate-900">{formatCurrency(detail.pricePerNight)}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tổng phòng</p>
                      <p className="mt-2 text-lg font-black text-slate-900">{formatCurrency(getBookingDetailTotal(detail))}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ReceiptText className="text-blue-600" size={20} />
              <h2 className="text-xl font-black text-slate-900">Chi tiết hóa đơn</h2>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                <div>Hạng mục</div>
                <div>Đơn giá</div>
                <div>Số lượng</div>
                <div className="text-right">Thành tiền</div>
              </div>

              {(booking.bookingDetails || []).map((detail) => (
                <div
                  key={`room-${detail.id}`}
                  className="grid grid-cols-[1.8fr_1fr_1fr_1fr] gap-4 border-t border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700"
                >
                  <div>
                    Tiền phòng {detail.roomTypeName || "Phòng"} - Phòng {detail.roomNumber || "--"}
                  </div>
                  <div>{formatCurrency(detail.pricePerNight)}</div>
                  <div>{getBookingDetailNights(detail)} đêm</div>
                  <div className="text-right font-black text-slate-900">{formatCurrency(getBookingDetailTotal(detail))}</div>
                </div>
              ))}

              {servicesQuery.isLoading ? (
                <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">Đang tải dịch vụ...</div>
              ) : serviceItems.length ? (
                serviceItems.map((item) => (
                  <div
                    key={`service-${item.id}`}
                    className="grid grid-cols-[1.8fr_1fr_1fr_1fr] gap-4 border-t border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700"
                  >
                    <div>{item.serviceName}</div>
                    <div>{formatCurrency(item.unitPrice)}</div>
                    <div>{item.quantity}</div>
                    <div className="text-right font-black text-slate-900">
                      {formatCurrency(item.lineTotal || item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
                  Chưa có dịch vụ nào trong booking này.
                </div>
              )}
            </div>

            <div className="mt-6 ml-auto max-w-md space-y-3 rounded-[1.5rem] bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>Tổng tiền phòng</span>
                <span className="font-black text-slate-900">{formatCurrency(roomTotalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>Tổng tiền dịch vụ</span>
                <span className="font-black text-slate-900">{formatCurrency(serviceTotalAmount)}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Tổng thành tiền</span>
                <span className="text-3xl font-black text-blue-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ReceiptText className="text-emerald-600" size={20} />
              <h2 className="text-xl font-black text-slate-900">Tóm tắt booking</h2>
            </div>

            {canCheckOut ? (
              <button
                type="button"
                onClick={() => setShowCheckoutConfirm(true)}
                disabled={checkOutMutation.isPending}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                <LogOut size={16} />
                {checkOutMutation.isPending ? "Đang trả phòng..." : "Trả phòng"}
              </button>
            ) : null}

            <div className="mt-6 space-y-4 rounded-[1.5rem] bg-slate-50 p-5 text-sm">
              <div>
                <p className="text-slate-500">Khách đặt</p>
                <p className="mt-1 font-bold text-slate-900">{booking.guestName || "Khách hàng"}</p>
              </div>
              <div>
                <p className="text-slate-500">Số điện thoại</p>
                <p className="mt-1 font-bold text-slate-900">{booking.guestPhone || "--"}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="mt-1 font-bold text-slate-900">{booking.guestEmail || "--"}</p>
              </div>
              <div className="flex items-start gap-3">
                <CalendarRange size={16} className="mt-0.5 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900">Lưu trú</p>
                  <p className="mt-1 text-slate-500">
                    {formatDateTime(booking.bookingDetails?.[0]?.checkInDate)} -{" "}
                    {formatDateTime(booking.bookingDetails?.[0]?.checkOutDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-[1.5rem] bg-blue-50 px-5 py-4">
              <div className="flex items-center justify-between text-sm text-blue-700">
                <span>Tiền phòng</span>
                <span className="font-bold">{formatCurrency(roomTotalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-blue-700">
                <span>Dịch vụ</span>
                <span className="font-bold">{formatCurrency(serviceTotalAmount)}</span>
              </div>
              <div className="h-px bg-blue-100" />
              <div>
                <p className="text-sm font-semibold text-blue-700">Tổng thanh toán</p>
                <p className="mt-2 text-3xl font-black text-blue-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>

            {canUserPayBooking(booking) ? (
              <button
                type="button"
                onClick={() => navigate(`/booking-history/${booking.id}/payment`)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <CreditCard size={16} />
                Thanh toán ngay
              </button>
            ) : null}
          </div>
        </aside>
      </div>

      {showCancelConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900">Xác nhận hủy booking</h2>
            <p className="mt-3 text-sm text-slate-600">Bạn có muốn hủy booking này không?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelMutation.isPending}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Không
              </button>
              <button
                type="button"
                onClick={() => cancelMutation.mutate()}
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
              onClick={handleCloseSuccess}
              className="mt-6 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}

      {showCheckoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900">Xác nhận trả phòng</h2>
            <p className="mt-3 text-sm text-slate-600">
              Bạn có muốn xác nhận trả phòng cho booking <span className="font-bold">{booking.bookingCode}</span> không?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutConfirm(false)}
                disabled={checkOutMutation.isPending}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Không
              </button>
              <button
                type="button"
                onClick={() => checkOutMutation.mutate()}
                disabled={checkOutMutation.isPending}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkOutMutation.isPending ? "Đang xử lý..." : "Có"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCheckoutSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-emerald-700">Đã xác nhận trả phòng</h2>
            <p className="mt-3 text-sm text-slate-600">
              Booking đã chuyển sang chờ thanh toán. Bạn có thể thanh toán ngay.
            </p>
            <button
              type="button"
              onClick={() => setShowCheckoutSuccess(false)}
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

export default BookingDetailPage;
