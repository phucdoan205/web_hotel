import { useMemo, useState } from "react";
import { ArrowLeft, Building2, CircleDollarSign, Copy, QrCode, Smartphone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../../api/admin/bookingsApi";

const formatCurrency = (amount) => `${amount.toLocaleString("vi-VN")} đ`;

const buildPseudoQr = (seed) => {
  const normalized = (seed || "BK").replace(/[^A-Z0-9]/gi, "");
  const size = 17;
  const cells = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const index = (row * size + col) % normalized.length;
      const charCode = normalized.charCodeAt(index) || 0;
      const dark = (charCode + row * 7 + col * 11) % 3 === 0;
      cells.push(
        <div
          key={`${row}-${col}`}
          className={dark ? "bg-slate-700" : "bg-white"}
        />
      );
    }
  }

  return cells;
};

const ReceptionistBookingPaymentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [copied, setCopied] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.getBookingById(id),
    enabled: Boolean(id),
  });

  const totalAmount = useMemo(() => {
    const details = booking?.bookingDetails || [];

    return details.reduce((sum, detail) => {
      const checkIn = detail.checkInDate ? new Date(detail.checkInDate) : null;
      const checkOut = detail.checkOutDate ? new Date(detail.checkOutDate) : null;
      const nights =
        checkIn && checkOut
          ? Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))
          : 1;

      return sum + (detail.pricePerNight || 0) * nights;
    }, 0);
  }, [booking]);

  const bankTransferContent = `HOTEL PAYMENT ${booking?.bookingCode || ""} ${formatCurrency(totalAmount)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bankTransferContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/receptionist/bookings")}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Quay lại bookings
          </button>
          <h1 className="text-3xl font-black text-slate-900">Mã QR thanh toán</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chọn hình thức thanh toán cho booking {booking?.bookingCode || id}
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-4 text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">Tổng thanh toán</p>
          <p className="mt-2 text-3xl font-black">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

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
                  <p className="text-sm text-slate-500">Quét mã bằng ví điện tử MoMo</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("bank")}
              className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                paymentMethod === "bank"
                  ? "border-sky-300 bg-sky-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">App ngân hàng</p>
                  <p className="text-sm text-slate-500">Thanh toán qua VietQR / mobile banking</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-700">Booking</p>
            <p className="mt-1 text-lg font-black text-slate-900">{booking?.bookingCode || "--"}</p>
            <p className="mt-3 text-sm text-slate-500">
              Khách: {booking?.guestName || "Chưa có thông tin"}
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">MoMo</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">Ví điện tử MoMo</p>
                </div>
                <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
                  <CircleDollarSign size={24} />
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="grid h-72 w-72 grid-cols-[repeat(17,minmax(0,1fr))] gap-[2px] rounded-[28px] border-[10px] border-pink-100 bg-white p-3 shadow-inner">
                  {buildPseudoQr(`MOMO${booking?.bookingCode || ""}`)}
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-pink-50 px-5 py-4 text-center">
                <p className="text-sm text-pink-700">Quét mã bằng ứng dụng MoMo để thanh toán</p>
                <p className="mt-2 text-3xl font-black text-pink-600">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[34px] border border-sky-100 bg-white p-5 shadow-xl">
              <div className="rounded-[28px] bg-gradient-to-r from-white to-sky-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl font-black uppercase tracking-tight text-slate-900">VU DUY THAI</p>
                    <p className="mt-1 text-2xl text-slate-700">0347474278</p>
                  </div>
                  <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                    <QrCode size={22} />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-inner">
                <div className="flex items-center justify-between text-lg font-black text-slate-800">
                  <span className="text-red-500">VIETQR</span>
                  <span className="text-blue-700">MB</span>
                </div>

                <div className="mt-4 flex justify-center">
                  <div className="grid h-80 w-80 grid-cols-[repeat(17,minmax(0,1fr))] gap-[3px] rounded-[30px] border-[12px] border-slate-100 bg-white p-4 shadow-sm">
                    {buildPseudoQr(`BANK${booking?.bookingCode || ""}${totalAmount}`)}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm font-bold text-slate-500">
                  <span className="text-red-500">VIETQR Pay</span>
                  <span className="text-red-500">VIETQR Global</span>
                  <span className="text-blue-700">napas 247</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-[28px] bg-slate-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Số tiền</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(totalAmount)}</p>
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
                <button
                  type="button"
                  onClick={() => navigate("/receptionist/bookings")}
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

export default ReceptionistBookingPaymentPage;
