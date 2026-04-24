import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CircleCheckBig,
  CircleDollarSign,
  Copy,
  ExternalLink,
  QrCode,
  RefreshCw,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../../api/admin/bookingsApi";
import {
  getBookingDepositAmount,
  getBookingDetailDeposit,
} from "../../utils/bookingPricing";
import {
  getBookingPaymentState,
  isBookingDetailPaid,
  markBookingDetailPaid,
} from "../../utils/bookingPaymentState";
import { hasPermission } from "../../utils/permissions";

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString("vi-VN")} đ`;

const buildQuickChartQrUrl = (value) => {
  if (!value) return "";
  return `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(value)}`;
};

const AdminBookingPaymentPage = () => {
  const canPayInvoice = hasPermission("PAY_INVOICE");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rawDetailId = searchParams.get("detailId");
  const detailId = rawDetailId ? Number(rawDetailId) : null;
  const [paymentMethod, setPaymentMethod] = useState("qrpay");
  const [momoView, setMomoView] = useState("hosted");
  const [copied, setCopied] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const checkInReturnPath = "/admin/check-in?tab=in";

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.getBookingById(id),
    enabled: Boolean(id),
  });

  const paymentState = getBookingPaymentState(booking);
  const selectedDetailFromQuery = useMemo(
    () =>
      Number.isFinite(detailId)
        ? booking?.bookingDetails?.find((detail) => detail.id === detailId) || null
        : null,
    [booking, detailId],
  );

  const unpaidDetails = useMemo(
    () => (booking?.bookingDetails || []).filter((detail) => !isBookingDetailPaid(booking, detail.id)),
    [booking],
  );

  const fallbackDetail = useMemo(() => {
    if (!booking?.bookingDetails?.length || selectedDetailFromQuery) return null;
    if (unpaidDetails.length === 1) return unpaidDetails[0];
    if (booking.bookingDetails.length === 1) return booking.bookingDetails[0];
    return null;
  }, [booking, selectedDetailFromQuery, unpaidDetails]);

  const selectedDetail = selectedDetailFromQuery || fallbackDetail;
  const isSingleRoomPayment = Boolean(selectedDetail);
  const isCancelled = booking?.status === "Cancelled";
  const mustChooseRoom = !selectedDetail && unpaidDetails.length > 1;

  const totalDepositAmount = useMemo(() => {
    if (!booking?.bookingDetails?.length) return 0;

    if (selectedDetail) {
      return getBookingDetailDeposit(selectedDetail);
    }

    return booking.bookingDetails.reduce((sum, detail) => {
      if (isBookingDetailPaid(booking, detail.id)) return sum;
      return sum + getBookingDetailDeposit(detail);
    }, 0);
  }, [booking, selectedDetail]);

  const bookingDepositAmount = useMemo(
    () => getBookingDepositAmount(booking?.bookingDetails || []),
    [booking],
  );

  const bankTransferContent = `HOTEL PAYMENT ${booking?.bookingCode || ""} ${formatCurrency(totalDepositAmount)}`;
  const singleRoomPaid = selectedDetail ? isBookingDetailPaid(booking, selectedDetail.id) : false;
  const alreadyPaid = isSingleRoomPayment ? singleRoomPaid : paymentState.depositComplete;
  const selectedRoomNumber = selectedDetail?.room?.roomNumber || selectedDetail?.roomNumber || "--";
  const selectedRoomType = selectedDetail?.roomTypeName || selectedDetail?.roomType?.name || "Phòng";

  const confirmOnlineMutation = useMutation({
    mutationFn: async () => {
      if (!booking) return null;
      if (booking.status === "Cancelled") {
        throw new Error("Booking đã hủy, không thể xác nhận thanh toán.");
      }

      if (mustChooseRoom) {
        throw new Error("Booking nhiều phòng, vui lòng chọn đúng phòng cần thanh toán.");
      }

      if (selectedDetail?.id) {
        markBookingDetailPaid(booking.id, selectedDetail.id);
        await bookingsApi.confirmBookingDetail(booking.id, selectedDetail.id);

        const allDetailsPaid = (booking.bookingDetails || []).every(
          (detail) => detail.id === selectedDetail.id || isBookingDetailPaid(booking, detail.id),
        );

        if (allDetailsPaid) {
          return { scope: "all" };
        }

        return { scope: "detail" };
      }

      const unpaidBookingDetails = (booking.bookingDetails || []).filter(
        (detail) => !isBookingDetailPaid(booking, detail.id),
      );

      if (unpaidBookingDetails.length === 1) {
        const [onlyDetail] = unpaidBookingDetails;
        markBookingDetailPaid(booking.id, onlyDetail.id);
        await bookingsApi.confirmBookingDetail(booking.id, onlyDetail.id);
        return { scope: "detail" };
      }

      throw new Error("Không xác định được phòng cần thanh toán.");
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["arrivals"] });
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["departures"] });
      setConfirmMessage(
        result?.scope === "detail"
          ? "Đã xác nhận thanh toán cho phòng này."
          : "Đã xác nhận thanh toán QR.",
      );
    },
    onError: (error) => {
      setConfirmMessage(error.message || "Không thể xác nhận thanh toán.");
    },
  });

  const canLoadMomoPayment =
    paymentMethod === "momo" &&
    Boolean(booking?.id) &&
    !isCancelled &&
    !mustChooseRoom &&
    totalDepositAmount >= 1000;

  const momoPaymentQuery = useQuery({
    queryKey: ["booking-momo-payment", id, selectedDetail?.id || "all", totalDepositAmount],
    queryFn: () =>
      bookingsApi.createMomoPayment(id, {
        bookingDetailId: selectedDetail?.id || null,
        amount: totalDepositAmount,
      }),
    enabled: canLoadMomoPayment,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const momoPayment = momoPaymentQuery.data;
  const momoQrImageUrl = useMemo(
    () => buildQuickChartQrUrl(momoPayment?.qrCodeUrl),
    [momoPayment?.qrCodeUrl],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bankTransferContent);
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

  const renderConfirmButton = () =>
    canPayInvoice ? (
      <button
        type="button"
        onClick={() => confirmOnlineMutation.mutate()}
        disabled={
          confirmOnlineMutation.isPending ||
          alreadyPaid ||
          isCancelled ||
          totalDepositAmount <= 0 ||
          mustChooseRoom
        }
        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {alreadyPaid
          ? "Đã thanh toán"
          : isCancelled
            ? "Booking đã hủy"
            : confirmOnlineMutation.isPending
              ? "Đang xác nhận..."
              : "Xác nhận đã thanh toán"}
      </button>
    ) : null;

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(checkInReturnPath)}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Quay lại nhận phòng
          </button>
          <h1 className="text-3xl font-black text-slate-900">
            {isSingleRoomPayment ? "Mã QR thanh toán phòng" : "Mã QR thanh toán"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isSingleRoomPayment
              ? `Thanh toán 1 đêm cho phòng ${selectedRoomNumber}`
              : mustChooseRoom
                ? `Booking ${booking?.bookingCode || id} có nhiều phòng, hãy chọn đúng phòng cần thanh toán.`
                : `Thanh toán 1 đêm cho booking ${booking?.bookingCode || id}`}
          </p>
        </div>

      </div>

      {confirmMessage ? (
        <div
          className={`rounded-3xl px-5 py-4 ${
            confirmMessage.toLowerCase().includes("không") || confirmMessage.toLowerCase().includes("hủy")
              ? "border border-amber-200 bg-amber-50 text-amber-900"
              : "border border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <CircleCheckBig className="text-emerald-600" size={22} />
            <p className="font-bold">{confirmMessage}</p>
          </div>
        </div>
      ) : null}

      {isCancelled ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900">
          <p className="font-bold">Booking này đã hủy nên không thể thanh toán.</p>
        </div>
      ) : null}

      {mustChooseRoom ? (
        <div className="rounded-3xl border border-sky-200 bg-sky-50 px-5 py-4 text-sky-900">
          <p className="font-bold">
            Booking này có nhiều phòng. Vui lòng chọn đúng 1 phòng trước khi xác nhận thanh toán.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Hình thức thanh toán</p>
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
                  <p className="text-sm text-slate-500">Lấy QR từ API MoMo và thanh toán trên ví</p>
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
                  <p className="text-sm text-slate-500">Thanh toán qua mobile banking hoặc VietQR</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-4">
            {isSingleRoomPayment ? (
              <div className="mb-4 rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-bold text-slate-700">Phòng thanh toán</p>
                <p className="mt-1 text-lg font-black text-slate-900">Phòng {selectedRoomNumber}</p>
                <p className="mt-1 text-sm text-slate-500">{selectedRoomType}</p>
                <p className="mt-3 text-sm font-semibold text-orange-600">
                  Thanh toán 1 đêm: {formatCurrency(totalDepositAmount)}
                </p>
              </div>
            ) : null}

            {!isSingleRoomPayment && unpaidDetails.length > 0 ? (
              <div className="mb-4 rounded-2xl bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-bold text-slate-700">Chọn phòng cần thanh toán</p>
                <div className="mt-3 space-y-2">
                  {unpaidDetails.map((detail, index) => {
                    const roomNumber = detail?.room?.roomNumber || detail?.roomNumber || index + 1;
                    const roomType = detail?.roomTypeName || detail?.roomType?.name || "Phòng";

                    return canPayInvoice ? (
                      <button
                        key={detail.id || `${booking?.id}-detail-${index}`}
                        type="button"
                        onClick={() => navigate(`/admin/bookings/${id}/payment-qr?detailId=${detail.id}`)}
                        className="flex w-full items-center justify-between rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-left text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                      >
                        <span>
                          Phòng {roomNumber} - {roomType}
                        </span>
                        <span>{formatCurrency(getBookingDetailDeposit(detail))}</span>
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            ) : null}

            <p className="text-sm font-bold text-slate-700">Booking</p>
            <p className="mt-1 text-lg font-black text-slate-900">{booking?.bookingCode || "--"}</p>
            <p className="mt-3 text-sm text-slate-500">
              {isSingleRoomPayment ? `Phòng: ${selectedRoomNumber}` : `Khách: ${booking?.guestName || "Chưa có thông tin"}`}
            </p>
            <p className="mt-3 text-sm font-semibold text-orange-600">
              Tổng tiền booking: {formatCurrency(bookingDepositAmount)}
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm">
          {isLoading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
              Đang tải thông tin thanh toán...
            </div>
          ) : paymentMethod === "momo" ? (
            <div className="mx-auto max-w-xl rounded-[32px] border border-pink-100 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">MoMo</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {isSingleRoomPayment ? "Thanh toán qua ví điện tử" : "Thanh toán booking qua MoMo"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    API sẽ tạo request `captureWallet`, nhận `payUrl`, `deeplink` và `qrCodeUrl`.
                  </p>
                </div>
                <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
                  <CircleDollarSign size={24} />
                </div>
              </div>

              <div className="mt-6 inline-flex rounded-2xl bg-pink-50 p-1">
                <button
                  type="button"
                  onClick={() => setMomoView("hosted")}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    momoView === "hosted"
                      ? "bg-pink-600 text-white shadow-sm"
                      : "text-pink-700 hover:bg-pink-100"
                  }`}
                >
                  Trang thanh toán MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setMomoView("qr")}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    momoView === "qr"
                      ? "bg-pink-600 text-white shadow-sm"
                      : "text-pink-700 hover:bg-pink-100"
                  }`}
                >
                  QR MoMo
                </button>
              </div>

              {momoPaymentQuery.isLoading ? (
                <div className="mt-6 rounded-3xl border border-pink-100 bg-pink-50 px-5 py-12 text-center text-pink-700">
                  Đang tạo mã QR từ MoMo...
                </div>
              ) : momoPaymentQuery.isError ? (
                <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-5 text-rose-900">
                  <p className="font-bold">
                    {momoPaymentQuery.error?.response?.data?.message ||
                      momoPaymentQuery.error?.message ||
                      "Không thể tạo thanh toán MoMo."}
                  </p>
                  <button
                    type="button"
                    onClick={() => momoPaymentQuery.refetch()}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
                  >
                    <RefreshCw size={16} />
                    Thử tạo lại QR
                  </button>
                </div>
              ) : momoPayment ? (
                <>
                  {momoView === "hosted" ? (
                    <div className="mt-6 rounded-[30px] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-rose-50 p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
                        Cổng thanh toán test
                      </p>
                      <p className="mt-3 text-3xl font-black text-slate-900">Mở trang thanh toán MoMo</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Bạn có thể mở cổng thanh toán MoMo khi sẵn sàng, trang này sẽ không tự chuyển nữa.
                      </p>

                      <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Số tiền</p>
                        <p className="mt-1 text-3xl font-black text-pink-600">
                          {formatCurrency(momoPayment.amount)}
                        </p>
                        <p className="mt-4 text-sm text-slate-500">Order ID</p>
                        <p className="mt-1 break-all font-bold text-slate-900">{momoPayment.orderId}</p>
                        <p className="mt-4 text-sm text-slate-500">Kết quả tạo giao dịch</p>
                        <p className="mt-1 font-bold text-slate-900">{momoPayment.message}</p>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => openCurrentWindow(momoPayment.payUrl)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-700"
                        >
                          <ExternalLink size={16} />
                          Mở cùng tab này
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
                        <p className="mt-2 text-xs font-semibold text-pink-500">
                          Order ID: {momoPayment.orderId}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    {renderConfirmButton()}
                    <button
                      type="button"
                      onClick={() => momoPaymentQuery.refetch()}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                    >
                      Tạo lại giao dịch
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(checkInReturnPath)}
                      className="rounded-2xl bg-sky-100 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-200"
                    >
                      Hoàn tất
                    </button>
                  </div>
                </>
              ) : null}
            </div>
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

              <div className="mt-4 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-inner">
                <div className="flex items-center justify-between text-lg font-black text-slate-800">
                  <span className="text-red-500">VIETQR</span>
                  <span className="text-blue-700">QR PAY</span>
                </div>

                <div className="mt-4 flex justify-center">
                  <div className="flex h-80 w-80 items-center justify-center rounded-[30px] border-[12px] border-slate-100 bg-slate-50 p-4 shadow-sm">
                    <QrCode size={92} className="text-slate-300" />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm font-bold text-slate-500">
                  <span className="text-red-500">VietQR Pay</span>
                  <span className="text-red-500">VietQR Global</span>
                  <span className="text-blue-700">napas 247</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-[28px] bg-slate-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Số tiền thanh toán</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(totalDepositAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Nội dung chuyển khoản</p>
                  <p className="mt-2 break-words text-sm font-bold text-slate-700">{bankTransferContent}</p>
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
                {renderConfirmButton()}
                <button
                  type="button"
                  onClick={() => navigate(checkInReturnPath)}
                  className="rounded-2xl bg-sky-100 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-200"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingPaymentPage;
