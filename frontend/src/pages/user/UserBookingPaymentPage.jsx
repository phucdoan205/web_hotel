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
  WalletCards,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { userBookingsApi } from "../../api/user/bookingsApi";
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
  const selectedDetail = useMemo(() => {
    if (!booking?.bookingDetails?.length) return null;
    if (detailId) {
      return booking.bookingDetails.find((detail) => detail.id === detailId) || null;
    }
    return booking.bookingDetails[0];
  }, [booking, detailId]);

  const amount = getBookingDetailDeposit(selectedDetail);
  const bookingStatus = resolveUserBookingStatus(booking);
  const transferContent = `HOTEL BOOKING ${booking?.bookingCode || id} ${formatCurrency(amount)}`;

  const momoPaymentQuery = useQuery({
    queryKey: ["user-booking-momo-payment", id, selectedDetail?.id, amount],
    queryFn: () =>
      userBookingsApi.createMomoPayment(id, {
        bookingDetailId: selectedDetail?.id || null,
        amount,
      }),
    enabled:
      paymentMethod === "momo" &&
      Boolean(id) &&
      Boolean(selectedDetail?.id) &&
      amount >= 1000 &&
      bookingStatus === "Pending" &&
      !isReturnedFromMomo,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: () =>
      userBookingsApi.confirmPayment(id, {
        bookingDetailId: selectedDetail?.id || null,
        transactionCode: momoOrderId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["user-booking", id] });
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

  useEffect(() => {
    if (!isReturnedFromMomo || !paymentSucceeded || !selectedDetail?.id) return;
    if (completedRef.current) return;
    if (selectedDetail.status === "Confirmed") return;

    completedRef.current = true;
    confirmPaymentMutation.mutate();
  }, [confirmPaymentMutation, isReturnedFromMomo, paymentSucceeded, selectedDetail]);

  const momoPayment = momoPaymentQuery.data;
  const momoQrImageUrl = useMemo(
    () => buildQuickChartQrUrl(momoPayment?.qrCodeUrl),
    [momoPayment?.qrCodeUrl],
  );

  const failureMessage = useMemo(() => {
    if (!isReturnedFromMomo || paymentSucceeded) return null;
    return momoMessage || "Thanh toán MoMo chưa thành công.";
  }, [isReturnedFromMomo, momoMessage, paymentSucceeded]);

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
      <div className="flex flex-wrap items-start justify-between gap-4">
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
            Chọn MoMo hoặc QR Pay. Sau khi thanh toán xong, booking sẽ chuyển sang Confirmed.
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-blue-50 px-5 py-4 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Cần thanh toán</p>
          <p className="mt-2 text-3xl font-black text-blue-700">{formatCurrency(amount)}</p>
        </div>
      </div>

      {selectedDetail.status === "Confirmed" ? (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />
            <div>
              <p className="font-black">Đã đặt phòng thành công</p>
              <p className="mt-2 text-sm">Phòng này đã được thanh toán thành công.</p>
            </div>
          </div>
        </div>
      ) : null}

      {confirmPaymentMutation.isPending ? (
        <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50 p-6 text-sky-900">
          Đang cập nhật trạng thái booking sau thanh toán...
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
                  <p className="mt-2 text-2xl font-black text-slate-900">Thanh toán qua MoMo</p>
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

              {momoPaymentQuery.isLoading ? (
                <div className="mt-6 rounded-[1.75rem] border border-pink-100 bg-pink-50 p-6 text-pink-700">
                  Đang tạo giao dịch MoMo...
                </div>
              ) : momoPaymentQuery.isError ? (
                <div className="mt-6 space-y-4 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-900">
                  <p className="font-black">
                    {momoPaymentQuery.error?.response?.data?.message ||
                      momoPaymentQuery.error?.message ||
                      "Không thể tạo thanh toán MoMo cho booking."}
                  </p>
                  <button
                    type="button"
                    onClick={() => momoPaymentQuery.refetch()}
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
                  disabled={selectedDetail.status === "Confirmed" || confirmPaymentMutation.isPending}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {selectedDetail.status === "Confirmed"
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
    </div>
  );
};

export default UserBookingPaymentPage;
