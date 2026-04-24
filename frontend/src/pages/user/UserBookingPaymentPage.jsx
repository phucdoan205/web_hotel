import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  RefreshCw,
  Smartphone,
  Star,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { userReviewsApi } from "../../api/user/reviewsApi";
import { getBookingDetailDeposit } from "../../utils/bookingPricing";
import { resolveUserBookingStatus } from "../../utils/userBookingStatus";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const buildQuickChartQrUrl = (value) => {
  if (!value) return "";
  return `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(value)}`;
};

const UserBookingPaymentPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rawDetailId = searchParams.get("detailId");
  const detailId = rawDetailId ? Number(rawDetailId) : null;
  const [paymentMethod, setPaymentMethod] = useState("qrpay");
  const [momoView, setMomoView] = useState("hosted");
  const [copied, setCopied] = useState(false);
  const [showReviewOverlay, setShowReviewOverlay] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const completedRef = useRef(false);

  const resultCode = searchParams.get("resultCode");
  const momoMessage = searchParams.get("message");
  const momoOrderId = searchParams.get("orderId");
  const isReturnedFromMomo = searchParams.has("resultCode");
  const paymentSucceeded = resultCode === "0";

  const bookingQuery = useQuery({
    queryKey: ["user-booking", id],
    queryFn: () => userBookingsApi.getMyBookingById(id),
    enabled: Boolean(id),
  });

  const booking = bookingQuery.data;
  const bookingStatus = resolveUserBookingStatus(booking);
  const isCheckoutPayment = bookingStatus === "Paying";

  const selectedDetail = useMemo(() => {
    if (!booking?.bookingDetails?.length) return null;
    if (detailId) {
      return booking.bookingDetails.find((detail) => detail.id === detailId) || null;
    }

    if (isCheckoutPayment) {
      return (
        booking.bookingDetails.find((detail) => ["Paying", "CheckedOut"].includes(detail.status)) ||
        booking.bookingDetails[0]
      );
    }

    return booking.bookingDetails.find((detail) => detail.status === "Pending") || booking.bookingDetails[0];
  }, [booking, detailId, isCheckoutPayment]);

  const paymentSummaryQuery = useQuery({
    queryKey: ["user-booking-payment-summary", id, detailId || "all"],
    queryFn: () => userBookingsApi.getPaymentSummary(id, detailId ? { bookingDetailId: detailId } : {}),
    enabled: Boolean(id) && isCheckoutPayment,
  });

  const paymentSummary = paymentSummaryQuery.data;
  const amount = isCheckoutPayment
    ? Number(paymentSummary?.totalAmount || 0)
    : getBookingDetailDeposit(selectedDetail);
  const transferContent = isCheckoutPayment
    ? `HOTEL CHECKOUT ${booking?.bookingCode || id} ${formatCurrency(amount)}`
    : `HOTEL BOOKING ${booking?.bookingCode || id} ${formatCurrency(amount)}`;

  const momoPaymentQuery = useQuery({
    queryKey: ["user-booking-momo-payment", id, selectedDetail?.id || "all", amount, isCheckoutPayment],
    queryFn: () =>
      isCheckoutPayment
        ? userBookingsApi.createCheckoutMomoPayment(id, detailId ? { bookingDetailId: detailId } : {})
        : userBookingsApi.createMomoPayment(id, {
            bookingDetailId: selectedDetail?.id || null,
            amount,
          }),
    enabled:
      paymentMethod === "momo" &&
      Boolean(id) &&
      amount >= 1000 &&
      (!isCheckoutPayment ? Boolean(selectedDetail?.id) : true) &&
      !isReturnedFromMomo &&
      (isCheckoutPayment || bookingStatus === "Pending"),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: () =>
      isCheckoutPayment
        ? userBookingsApi.completePayment(id, {
            bookingDetailId: detailId || null,
            transactionCode: momoOrderId || undefined,
          })
        : userBookingsApi.confirmPayment(id, {
            bookingDetailId: selectedDetail?.id || null,
            transactionCode: momoOrderId || undefined,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["user-booking", id] });
      queryClient.invalidateQueries({ queryKey: ["user-booking-payment-summary", id] });

      if (isCheckoutPayment) {
        setShowReviewOverlay(true);
        return;
      }

      navigate("/user/booking-history", {
        replace: true,
        state: {
          notice: {
            type: "success",
            message: "Đã đặt phòng thành công.",
          },
        },
      });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: () =>
      userReviewsApi.createReview({
        roomTypeId: selectedDetail?.roomTypeId || null,
        rating,
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      navigate("/user/reviews", { replace: true });
    },
  });

  useEffect(() => {
    if (!isReturnedFromMomo || !paymentSucceeded) return;
    if (!selectedDetail && !isCheckoutPayment) return;
    if (completedRef.current) return;
    if (!isCheckoutPayment && selectedDetail?.status === "Confirmed") return;
    if (isCheckoutPayment && bookingStatus === "Completed") return;

    completedRef.current = true;
    confirmPaymentMutation.mutate();
  }, [bookingStatus, confirmPaymentMutation, isCheckoutPayment, isReturnedFromMomo, paymentSucceeded, selectedDetail]);

  const momoPayment = momoPaymentQuery.data;
  const momoQrImageUrl = useMemo(
    () => buildQuickChartQrUrl(momoPayment?.qrCodeUrl),
    [momoPayment?.qrCodeUrl],
  );

  const failureMessage = useMemo(() => {
    if (!isReturnedFromMomo || paymentSucceeded) return null;
    return momoMessage || "Thanh toán MoMo chưa thành công.";
  }, [isReturnedFromMomo, momoMessage, paymentSucceeded]);

  const isAlreadyPaid = isCheckoutPayment ? bookingStatus === "Completed" : selectedDetail?.status === "Confirmed";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transferContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const openExternalLink = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openCurrentWindow = (url) => {
    if (!url) return;
    window.location.href = url;
  };

  if (bookingQuery.isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500">Đang tải thanh toán...</div>;
  }

  if (!booking || !selectedDetail) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Không tìm thấy booking cần thanh toán.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/user/booking/${id}`)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Quay lại booking
        </button>
        <h1 className="mt-4 text-3xl font-black text-slate-900">Thanh toán booking</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {isCheckoutPayment
            ? "Chọn MoMo hoặc QR Pay để hoàn tất thanh toán sau khi trả phòng."
            : "Chọn MoMo hoặc QR Pay. Sau khi thanh toán xong, booking sẽ chuyển sang Confirmed."}
        </p>
      </div>

      {isAlreadyPaid ? (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />
            <div>
              <p className="font-black">{isCheckoutPayment ? "Đã thanh toán hoàn tất" : "Đã đặt phòng thành công"}</p>
              <p className="mt-2 text-sm">
                {isCheckoutPayment
                  ? "Booking này đã chuyển sang Completed."
                  : "Phòng này đã được thanh toán thành công."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {confirmPaymentMutation.isPending ? (
        <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50 p-6 text-sky-900">
          Đang cập nhật trạng thái sau thanh toán...
        </div>
      ) : null}

      {failureMessage ? (
        <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 text-rose-600" size={22} />
            <div>
              <p className="font-black">Thanh toán chưa thành công</p>
              <p className="mt-2 text-sm">{failureMessage}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm">
            <p className="text-slate-500">Booking</p>
            <p className="mt-1 text-lg font-black text-slate-900">{booking.bookingCode}</p>
            <p className="mt-4 text-slate-500">Phòng</p>
            <p className="mt-1 font-bold text-slate-900">
              {selectedDetail.roomTypeName} - Phòng {selectedDetail.roomNumber}
            </p>
            <p className="mt-4 text-slate-500">Lưu trú</p>
            <p className="mt-1 font-bold text-slate-900">
              {new Date(selectedDetail.checkInDate).toLocaleDateString("vi-VN")} -{" "}
              {new Date(selectedDetail.checkOutDate).toLocaleDateString("vi-VN")}
            </p>
            {isCheckoutPayment && paymentSummary?.items?.length ? (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-slate-500">Khoản cần thanh toán</p>
                <div className="mt-2 space-y-2">
                  {paymentSummary.items.map((item) => (
                    <div key={item.invoiceId} className="rounded-2xl bg-white px-3 py-2">
                      <p className="font-bold text-slate-900">
                        {item.roomName} - Phòng {item.roomNumber}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{formatCurrency(item.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Hình thức thanh toán</p>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("momo")}
              className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                paymentMethod === "momo"
                  ? "border-pink-300 bg-pink-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-pink-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">MoMo</p>
                  <p className="text-sm text-slate-500">Mở cổng thanh toán hoặc quét QR MoMo</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("qrpay")}
              className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                paymentMethod === "qrpay"
                  ? "border-sky-300 bg-sky-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                  <WalletCards size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">QR Pay</p>
                  <p className="text-sm text-slate-500">Chuyển khoản và xác nhận đã thanh toán</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {paymentMethod === "momo" ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">MoMo</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {isCheckoutPayment ? "Thanh toán checkout qua MoMo" : "Thanh toán qua MoMo"}
                  </p>
                </div>
                <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
                  <Smartphone size={24} />
                </div>
              </div>

              <div className="mt-6 inline-flex rounded-2xl bg-pink-50 p-1">
                <button
                  type="button"
                  onClick={() => setMomoView("hosted")}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    momoView === "hosted" ? "bg-pink-600 text-white shadow-sm" : "text-pink-700 hover:bg-pink-100"
                  }`}
                >
                  Trang MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setMomoView("qr")}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    momoView === "qr" ? "bg-pink-600 text-white shadow-sm" : "text-pink-700 hover:bg-pink-100"
                  }`}
                >
                  QR MoMo
                </button>
              </div>

              {momoPaymentQuery.isLoading || (isCheckoutPayment && paymentSummaryQuery.isLoading) ? (
                <div className="mt-6 rounded-[1.75rem] border border-pink-100 bg-pink-50 p-6 text-pink-700">
                  Đang tạo giao dịch MoMo...
                </div>
              ) : momoPaymentQuery.isError || paymentSummaryQuery.isError ? (
                <div className="mt-6 space-y-4 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-900">
                  <p className="font-black">
                    {momoPaymentQuery.error?.response?.data?.message ||
                      paymentSummaryQuery.error?.response?.data?.message ||
                      momoPaymentQuery.error?.message ||
                      paymentSummaryQuery.error?.message ||
                      "Không thể tạo thanh toán MoMo cho booking."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (isCheckoutPayment) paymentSummaryQuery.refetch();
                      momoPaymentQuery.refetch();
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
                  >
                    <RefreshCw size={16} />
                    Thử lại
                  </button>
                </div>
              ) : momoPayment ? (
                <>
                  {momoView === "hosted" ? (
                    <div className="mt-6 rounded-[30px] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-rose-50 p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">Cổng thanh toán test</p>
                      <p className="mt-3 text-3xl font-black text-slate-900">Mở trang thanh toán MoMo</p>
                      <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Số tiền</p>
                        <p className="mt-1 text-3xl font-black text-pink-600">{formatCurrency(momoPayment.amount)}</p>
                        <p className="mt-4 text-sm text-slate-500">Order ID</p>
                        <p className="mt-1 break-all font-bold text-slate-900">{momoPayment.orderId}</p>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => openCurrentWindow(momoPayment.payUrl)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-700"
                        >
                          <ExternalLink size={16} />
                          Mở cùng tab
                        </button>
                        <button
                          type="button"
                          onClick={() => openExternalLink(momoPayment.payUrl)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-black"
                        >
                          <ExternalLink size={16} />
                          Mở tab mới
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 flex justify-center">
                        <div className="flex min-h-72 min-w-72 items-center justify-center rounded-[28px] border-[10px] border-pink-100 bg-white p-3 shadow-inner">
                          {momoQrImageUrl ? (
                            <img
                              src={momoQrImageUrl}
                              alt="Mã QR thanh toán MoMo"
                              className="h-72 w-72 rounded-2xl object-contain"
                            />
                          ) : (
                            <div className="flex h-72 w-72 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                              <QrCode size={60} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 rounded-3xl bg-pink-50 px-5 py-4 text-center">
                        <p className="text-sm text-pink-700">Quét mã bằng ứng dụng MoMo để thanh toán</p>
                        <p className="mt-2 text-3xl font-black text-pink-600">{formatCurrency(momoPayment.amount)}</p>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-[34px] border border-sky-100 bg-white p-5 shadow-xl">
              <div className="rounded-[28px] bg-gradient-to-r from-white to-sky-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl font-black uppercase tracking-tight text-slate-900">QR THANH TOÁN</p>
                    <p className="mt-1 text-2xl text-slate-700">HOTEL QR PAY</p>
                  </div>
                  <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                    <QrCode size={22} />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-[28px] bg-slate-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Số tiền</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Nội dung chuyển khoản</p>
                  <p className="mt-2 break-words text-sm font-bold text-slate-700">{transferContent}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-black"
                >
                  <Copy size={16} />
                  {copied ? "Đã sao chép" : "Sao chép nội dung"}
                </button>
                <button
                  type="button"
                  onClick={() => confirmPaymentMutation.mutate()}
                  disabled={isAlreadyPaid || confirmPaymentMutation.isPending}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isAlreadyPaid
                    ? "Đã thanh toán"
                    : confirmPaymentMutation.isPending
                      ? "Đang xác nhận..."
                      : "Xác nhận đã thanh toán"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReviewOverlay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900">Đánh giá kỳ nghỉ của bạn</h2>
            <p className="mt-2 text-sm text-slate-500">
              Cho chúng tôi biết cảm nhận về {selectedDetail.roomTypeName} - Phòng {selectedDetail.roomNumber}.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded-2xl p-2 transition hover:bg-amber-50"
                >
                  <Star
                    size={28}
                    className={value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="Chia sẻ cảm nhận của bạn..."
              className="mt-5 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReviewOverlay(false);
                  navigate(`/user/booking/${id}`, { replace: true });
                }}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => createReviewMutation.mutate()}
                disabled={createReviewMutation.isPending}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {createReviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserBookingPaymentPage;
