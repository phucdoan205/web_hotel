import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  Receipt,
  RefreshCw,
  Smartphone,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { invoicesApi } from "../../api/admin/invoicesApi";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} đ`;

const buildQuickChartQrUrl = (value) => {
  if (!value) return "";
  return `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(value)}`;
};

const AdminInvoicePaymentPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("qrpay");
  const [momoView, setMomoView] = useState("hosted");
  const [copied, setCopied] = useState(false);
  const completedInvoiceRef = useRef(false);

  const resultCode = searchParams.get("resultCode");
  const momoMessage = searchParams.get("message");
  const momoOrderId = searchParams.get("orderId");
  const isReturnedFromMomo = searchParams.has("resultCode");
  const paymentSucceeded = resultCode === "0";

  const invoiceQuery = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => invoicesApi.getInvoiceById(invoiceId),
    enabled: Boolean(invoiceId),
  });

  const invoice = invoiceQuery.data;
  const qrTransferContent = useMemo(
    () => `HOTEL INVOICE ${invoice?.code || invoiceId} ${formatCurrency(invoice?.totalAmount || 0)}`,
    [invoice?.code, invoice?.totalAmount, invoiceId],
  );

  const momoPaymentQuery = useQuery({
    queryKey: ["invoice-momo-payment", invoiceId, invoice?.updatedAt, invoice?.status],
    queryFn: () => invoicesApi.createMomoPayment(invoiceId),
    enabled:
      paymentMethod === "momo" &&
      Boolean(invoiceId) &&
      Boolean(invoice) &&
      invoice.status !== "Completed" &&
      !isReturnedFromMomo,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const completeInvoiceMutation = useMutation({
    mutationFn: () =>
      invoicesApi.completeInvoice(invoiceId, {
        transactionCode: momoOrderId || undefined,
      }),
    onSuccess: (completedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", String(completedInvoice.bookingId)] });
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["departures"] });
      queryClient.invalidateQueries({ queryKey: ["checkout-bookings"] });

      navigate("/admin/invoices", {
        replace: true,
        state: {
          notice: {
            type: "success",
            title: "Đã thanh toán hóa đơn",
            message: `${completedInvoice.code || "Hóa đơn"} đã chuyển sang Completed.`,
          },
        },
      });
    },
  });

  const momoPayment = momoPaymentQuery.data;
  const momoQrImageUrl = useMemo(
    () => buildQuickChartQrUrl(momoPayment?.qrCodeUrl),
    [momoPayment?.qrCodeUrl],
  );

  const failureMessage = useMemo(() => {
    if (!isReturnedFromMomo || paymentSucceeded) return null;
    return momoMessage || "Thanh toán MoMo không thành công.";
  }, [isReturnedFromMomo, momoMessage, paymentSucceeded]);

  const handleRetry = () => {
    momoPaymentQuery.refetch();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrTransferContent);
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

  useEffect(() => {
    if (!isReturnedFromMomo) return;
    if (!paymentSucceeded) return;
    if (!invoice) return;
    if (invoice.status === "Completed") return;
    if (completeInvoiceMutation.isPending) return;
    if (completedInvoiceRef.current) return;

    completedInvoiceRef.current = true;
    completeInvoiceMutation.mutate();
  }, [completeInvoiceMutation, invoice, isReturnedFromMomo, paymentSucceeded]);

  if (invoiceQuery.isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500">Đang tải hóa đơn...</div>;
  }

  if (!invoice) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Không tìm thấy hóa đơn cần thanh toán.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/invoices")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Quay lại hóa đơn
          </button>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Thanh toán hóa đơn</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Chọn MoMo hoặc QR Pay. Sau khi thanh toán thành công, hóa đơn sẽ được cập nhật sang Completed.
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-pink-50 px-5 py-4 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">Tổng thanh toán</p>
          <p className="mt-2 text-3xl font-black text-pink-600">{formatCurrency(invoice.totalAmount)}</p>
        </div>
      </div>

      {invoice.status === "Completed" ? (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />
            <div>
              <p className="font-black">Hóa đơn đã thanh toán</p>
              <p className="mt-2 text-sm">Hóa đơn này đã ở trạng thái Completed.</p>
            </div>
          </div>
        </div>
      ) : null}

      {completeInvoiceMutation.isPending ? (
        <div className="rounded-[1.75rem] border border-sky-200 bg-sky-50 p-6 text-sky-900">
          Đang cập nhật trạng thái hóa đơn sau thanh toán...
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
          <div className="flex items-center gap-4">
            <div className="rounded-[1.5rem] bg-sky-100 p-4 text-sky-600">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Hóa đơn</p>
              <p className="mt-1 text-lg font-black text-slate-900">{invoice.code}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 rounded-[1.5rem] bg-slate-50 p-4 text-sm">
            <div>
              <p className="text-slate-500">Khách hàng</p>
              <p className="mt-1 font-bold text-slate-900">{invoice.guestName}</p>
            </div>
            <div>
              <p className="text-slate-500">Booking</p>
              <p className="mt-1 font-bold text-slate-900">{invoice.bookingCode}</p>
            </div>
            <div>
              <p className="text-slate-500">Phòng</p>
              <p className="mt-1 font-bold text-slate-900">
                {invoice.roomNumber} - {invoice.roomName}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Trạng thái hiện tại</p>
              <p className="mt-1 font-bold text-slate-900">{invoice.status}</p>
            </div>
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
                  <p className="text-sm text-slate-500">Lấy QR hoặc mở cổng thanh toán MoMo</p>
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
                  <p className="text-sm text-slate-500">Chuyển khoản bằng app ngân hàng hoặc VietQR</p>
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
                  <p className="mt-2 text-2xl font-black text-slate-900">Thanh toán hóa đơn qua MoMo</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Tạo giao dịch trước, sau đó bạn có thể mở cổng thanh toán hoặc quét QR ngay trên trang này.
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
                <div className="mt-6 rounded-[1.75rem] border border-pink-100 bg-pink-50 p-6 text-pink-700">
                  Đang tạo giao dịch MoMo...
                </div>
              ) : momoPaymentQuery.isError ? (
                <div className="mt-6 space-y-4 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-900">
                  <p className="font-black">
                    {momoPaymentQuery.error?.response?.data?.message ||
                      momoPaymentQuery.error?.message ||
                      "Không thể tạo thanh toán MoMo cho hóa đơn."}
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
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
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
                        Cổng thanh toán test
                      </p>
                      <p className="mt-3 text-3xl font-black text-slate-900">Mở trang thanh toán MoMo</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Trang sẽ đứng yên tại đây cho đến khi bạn chủ động mở cổng thanh toán.
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

                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p>
                      Kết quả MoMo: <span className="font-bold text-slate-900">{momoPayment.message}</span>
                    </p>
                    {momoPayment.deeplink ? (
                      <button
                        type="button"
                        onClick={() => openExternalLink(momoPayment.deeplink)}
                        className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                      >
                        <Smartphone size={16} />
                        Mở deeplink MoMo
                      </button>
                    ) : null}
                    {momoPayment.payUrl ? (
                      <p className="mt-3 break-all text-xs text-slate-500">{momoPayment.payUrl}</p>
                    ) : null}
                  </div>
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
                  <p className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Nội dung chuyển khoản</p>
                  <p className="mt-2 break-words text-sm font-bold text-slate-700">{qrTransferContent}</p>
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
                  onClick={() => completeInvoiceMutation.mutate()}
                  disabled={invoice.status === "Completed" || completeInvoiceMutation.isPending}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {invoice.status === "Completed"
                    ? "Đã thanh toán"
                    : completeInvoiceMutation.isPending
                      ? "Đang xác nhận..."
                      : "Xác nhận đã thanh toán"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/invoices")}
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

export default AdminInvoicePaymentPage;
