import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarRange, CreditCard, Hotel, LogOut, ReceiptText, XCircle } from "lucide-react";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { userServicesApi } from "../../api/user/servicesApi";
import { invoicesApi } from "../../api/admin/invoicesApi";
import apiClient from "../../api/client";
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

  const lossDamagesQuery = useQuery({
    queryKey: ["user-booking-loss-damages", id],
    queryFn: () => userBookingsApi.getLossDamages(id),
    enabled: Boolean(id),
  });

  const lossDamages = useMemo(() => lossDamagesQuery.data || [], [lossDamagesQuery.data]);

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

  const checkoutInvoiceQuery = useQuery({
    queryKey: ["user-booking-checkout-invoice", id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/user-bookings/${id}/invoice`);
        const invoice = response.data;
        if (!invoice) return null;
        return {
          id: invoice.id,
          bookingId: invoice.bookingId,
          detailId: invoice.bookingDetailId,
          voucherId: invoice.voucherId,
          code: invoice.code || "",
          bookingCode: invoice.bookingCode || "",
          guestName: invoice.guestName || "",
          roomNumber: invoice.roomNumber || "",
          roomName: invoice.roomName || "",
          roomRate: Number(invoice.roomRate || 0),
          checkInDate: invoice.checkInDate || null,
          checkOutDate: invoice.checkOutDate || null,
          stayedDays: Number(invoice.stayedDays || 0),
          subtotal: Number(invoice.totalRoomAmount || 0),
          totalRoomAmount: Number(invoice.totalRoomAmount || 0),
          totalServiceAmount: Number(invoice.totalServiceAmount || 0),
          totalLossDamageAmount: Number(invoice.totalLossDamageAmount || 0),
          discountAmount: Number(invoice.discountAmount || 0),
          membershipTierName: invoice.membershipTierName || "",
          membershipDiscountPercent: Number(invoice.membershipDiscountPercent || 0),
          membershipDiscountAmount: Number(invoice.membershipDiscountAmount || 0),
          taxAmount: Number(invoice.taxAmount || 0),
          finalTotal: Number(invoice.finalTotal || 0),
          status: invoice.status || "Completed",
          notes: invoice.notes || "",
          createdAt: invoice.createdAt || null,
          updatedAt: invoice.updatedAt || null,
          paidAt: invoice.paidAt || null,
          depositAmount: Number(invoice.depositAmount || 0)
        };
      } catch (err) {
        console.error("Failed to fetch booking invoice for guest:", err);
        return null;
      }
    },
    enabled: Boolean(id && (bookingStatus === "Completed" || bookingStatus === "Paying")),
  });
  const checkoutInvoice = checkoutInvoiceQuery.data;

  const roomTotalAmount = useMemo(() => getBookingTotalAmount(booking?.bookingDetails || []), [booking]);
  const serviceItems = useMemo(() => {
    const currentBookingId = Number(booking?.id || id || 0);
    return (servicesQuery.data || []).filter((item) => item.bookingId === currentBookingId);
  }, [booking?.id, id, servicesQuery.data]);

  const processedServiceItems = useMemo(() => {
    if (!checkoutInvoice) {
      return serviceItems.map(item => ({ ...item, isPaidBeforeCheckout: false }));
    }

    const targetAmount = Number(checkoutInvoice.totalServiceAmount || 0);
    const sortedItems = [...serviceItems].sort((a, b) => new Date(b.usedAt || b.orderDate).getTime() - new Date(a.usedAt || a.orderDate).getTime());

    const checkoutItemIds = new Set();
    let currentSum = 0;

    for (const item of sortedItems) {
      if (currentSum + item.lineTotal <= targetAmount) {
        checkoutItemIds.add(item.id);
        currentSum += item.lineTotal;
      }
      if (currentSum === targetAmount) break;
    }

    const exactMatch = currentSum === targetAmount;
    return serviceItems.map(item => ({
      ...item,
      isPaidBeforeCheckout: exactMatch ? !checkoutItemIds.has(item.id) : false
    }));
  }, [serviceItems, checkoutInvoice]);

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
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
          </div>

          <div className="flex flex-wrap gap-3">
            {canCheckOut ? (
              <button
                type="button"
                onClick={() => setShowCheckoutConfirm(true)}
                disabled={checkOutMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                <LogOut size={16} />
                {checkOutMutation.isPending ? "Đang trả phòng..." : "Trả phòng"}
              </button>
            ) : null}
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

        <div className="space-y-6">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <img src={firstImage} alt="Phòng đã đặt" className="h-[340px] w-full object-cover" />
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
                ) : processedServiceItems.length ? (
                  processedServiceItems.map((item) => {
                    const isPaidBefore = item.isPaidBeforeCheckout;
                    return (
                      <div
                        key={`service-${item.id}`}
                        className={`grid grid-cols-[1.8fr_1fr_1fr_1fr] gap-4 border-t border-slate-100 px-5 py-4 text-sm font-semibold transition hover:bg-slate-50 ${isPaidBefore ? "opacity-60 bg-slate-50/50" : "text-slate-700"}`}
                      >
                        <div className="flex flex-col">
                          <span className={`font-semibold ${isPaidBefore ? "text-slate-400 line-through" : "text-slate-800"}`}>
                            {item.serviceName}
                          </span>
                          {isPaidBefore && (
                            <span className="w-fit mt-1 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              Đã trả trước
                            </span>
                          )}
                        </div>
                        <div className={`font-medium ${isPaidBefore ? "text-slate-400 line-through" : "text-slate-600"}`}>{formatCurrency(item.unitPrice)}</div>
                        <div className={`font-medium ${isPaidBefore ? "text-slate-400" : "text-slate-600"}`}>{item.quantity}</div>
                        <div className={`text-right font-black ${isPaidBefore ? "text-slate-400 line-through" : "text-slate-900"}`}>
                          {formatCurrency(item.lineTotal || item.quantity * item.unitPrice)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
                    Chưa có dịch vụ nào trong booking này.
                  </div>
                )}

                {lossDamagesQuery.isLoading ? (
                  <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">Đang tải thất thoát hư hỏng...</div>
                ) : lossDamages.length ? (
                  lossDamages.map((item) => (
                    <div
                      key={`loss-damage-${item.id}`}
                      className="grid grid-cols-[1.8fr_1fr_1fr_1fr] gap-4 border-t border-slate-100 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-55"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-rose-600">
                          {item.equipmentName} (Thất thoát/Hư hỏng)
                        </span>
                      </div>
                      <div className="font-medium text-slate-600">{formatCurrency(item.unitPenalty)}</div>
                      <div className="font-medium text-slate-600">{item.quantity}</div>
                      <div className="text-right font-black text-rose-700">
                        {formatCurrency(item.penaltyAmount)}
                      </div>
                    </div>
                  ))
                ) : null}
              </div>

              {checkoutInvoice ? (
                <div className="mt-6 ml-auto max-w-md space-y-3 rounded-[1.5rem] bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-500 p-5 text-white shadow-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Tổng tiền phòng</span>
                    <span className="font-bold">{formatCurrency(checkoutInvoice.totalRoomAmount || checkoutInvoice.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Tổng tiền dịch vụ</span>
                    <span className="font-bold">{formatCurrency(checkoutInvoice.totalServiceAmount)}</span>
                  </div>
                  {Number(checkoutInvoice.totalLossDamageAmount || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Thất thoát hư hỏng</span>
                      <span className="font-bold">{formatCurrency(checkoutInvoice.totalLossDamageAmount)}</span>
                    </div>
                  )}
                  {Number(checkoutInvoice.discountAmount || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Voucher {checkoutInvoice.voucherCode ? `(${checkoutInvoice.voucherCode})` : ""}</span>
                      <span className="font-bold">- {formatCurrency(checkoutInvoice.discountAmount)}</span>
                    </div>
                  )}
                  {Number(checkoutInvoice.membershipDiscountAmount || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Giảm giá Membership ({checkoutInvoice.membershipTierName || `${checkoutInvoice.membershipDiscountPercent}%`})</span>
                      <span className="font-bold">- {formatCurrency(checkoutInvoice.membershipDiscountAmount)}</span>
                    </div>
                  )}
                  {(() => {
                    const calculatedTotal = Number(checkoutInvoice.totalRoomAmount || 0) + Number(checkoutInvoice.totalServiceAmount || 0) + Number(checkoutInvoice.totalLossDamageAmount || 0) - Number(checkoutInvoice.discountAmount || 0) - Number(checkoutInvoice.membershipDiscountAmount || 0);
                    const depositDeducted = Math.max(0, calculatedTotal - Number(checkoutInvoice.finalTotal || 0));
                    if (depositDeducted > 0) {
                      const roomTotalAfterDiscount = Math.max(0, Number(checkoutInvoice.totalRoomAmount || 0) + Number(checkoutInvoice.totalLossDamageAmount || 0) - Number(checkoutInvoice.discountAmount || 0) - Number(checkoutInvoice.membershipDiscountAmount || 0));
                      const rawDepositPct = roomTotalAfterDiscount > 0 ? (depositDeducted / roomTotalAfterDiscount) * 100 : 0;
                      const depositPct = rawDepositPct <= 0 ? 0 : [30, 40, 50, 100].reduce((prev, curr) => Math.abs(curr - rawDepositPct) < Math.abs(prev - rawDepositPct) ? curr : prev);
                      return (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Trừ tiền cọc {depositPct > 0 ? `(${depositPct}%)` : ""}</span>
                          <span className="font-bold">- {formatCurrency(depositDeducted)}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="h-px bg-white/20" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/95">Thực thu (Đã thanh toán)</span>
                    <span className="text-3xl font-black text-white">{formatCurrency(checkoutInvoice.finalTotal)}</span>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </section>

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
                Bạn có muốn xác nhận trả phòng không?
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
    </div>
  );
};

export default BookingDetailPage;
