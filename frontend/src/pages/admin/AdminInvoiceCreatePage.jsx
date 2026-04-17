import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Receipt, Save, Tag, XCircle } from "lucide-react";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { useVoucherData } from "../../hooks/useVoucherData";
import { markBookingDetailInvoiced } from "../../utils/bookingRoomFlowState";
import {
  calculateStayedDays,
  calculateVoucherDiscount,
  createStoredInvoice,
  hasInvoiceForBookingDetail,
  isVoucherApplicable,
} from "../../utils/invoiceState";
import {
  getRoomEntryGuestName,
  getRoomEntryName,
  getRoomEntryNumber,
  getRoomEntryPrice,
} from "../../utils/bookingRoomEntries";
import { formatVietnamDate, formatVietnamDateTime } from "../../utils/vietnamTime";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} d`;

const buildInvoiceCode = (bookingCode, roomNumber) =>
  `INV-${String(bookingCode || "BK").replace(/\s+/g, "").toUpperCase()}-${roomNumber}-${Date.now()
    .toString()
    .slice(-6)}`;

const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  tone = "sky",
  onCancel,
  onConfirm,
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
      <div className="flex items-start gap-4">
        <div
          className={`rounded-2xl p-3 ${
            tone === "rose" ? "bg-rose-100 text-rose-600" : "bg-sky-100 text-sky-600"
          }`}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
        >
          Khong
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-2xl px-4 py-2.5 text-sm font-black text-white transition ${
            tone === "rose" ? "bg-rose-600 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-700"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const AdminInvoiceCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const detailId = Number(searchParams.get("detailId"));
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmAction, setConfirmAction] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const { vouchers } = useVoucherData();

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingsApi.getBookingById(bookingId),
    enabled: Boolean(bookingId),
  });

  const detail = useMemo(
    () => booking?.bookingDetails?.find((item) => item.id === detailId) || null,
    [booking, detailId],
  );

  const guestName = getRoomEntryGuestName(booking || {});
  const roomNumber = getRoomEntryNumber(detail || {});
  const roomName = getRoomEntryName(booking || {}, detail || {});
  const roomRate = getRoomEntryPrice(booking || {}, detail || {});
  const stayedDays = calculateStayedDays(detail?.checkInDate, currentTime);
  const subtotal = roomRate * stayedDays;
  const availableVouchers = useMemo(
    () => vouchers.filter((voucher) => isVoucherApplicable(voucher, subtotal, currentTime)),
    [currentTime, subtotal, vouchers],
  );
  const selectedVoucher =
    availableVouchers.find((voucher) => String(voucher.id) === String(selectedVoucherId)) || null;
  const discountAmount = calculateVoucherDiscount(selectedVoucher, subtotal);
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const invoiceExists = bookingId && detailId ? hasInvoiceForBookingDetail(bookingId, detailId) : false;

  const handleCancelConfirmed = () => {
    setConfirmAction("");
    navigate("/admin/check-out");
  };

  const handleSaveConfirmed = () => {
    if (!booking || !detail) return;

    const invoice = createStoredInvoice({
      code: buildInvoiceCode(booking.bookingCode, roomNumber),
      bookingId: booking.id,
      detailId: detail.id,
      bookingCode: booking.bookingCode,
      guestName,
      roomNumber,
      roomName,
      roomRate,
      checkInDate: detail.checkInDate,
      checkOutDate: currentTime.toISOString(),
      stayedDays,
      subtotal,
      discountAmount,
      totalAmount,
      notes: notes.trim(),
      status: "Pending",
      voucher: selectedVoucher
        ? {
            id: selectedVoucher.id,
            code: selectedVoucher.code,
            discountType: selectedVoucher.discountType,
            discountValue: selectedVoucher.discountValue,
          }
        : null,
    });

    markBookingDetailInvoiced(booking.id, detail.id);
    setConfirmAction("");
    navigate("/admin/invoices", {
      replace: true,
      state: {
        notice: {
          type: "success",
          title: "Da luu hoa don",
          message: `Hoa don ${invoice.code} da duoc tao va dang o trang thai Pending.`,
        },
      },
    });
  };

  if (isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500">Dang tai du lieu hoa don...</div>;
  }

  if (isError || !booking || !detail) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Khong tim thay booking/detail de tao hoa don.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/check-out")}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Quay lai tra phong
            </button>
            <h1 className="mt-4 text-3xl font-black text-slate-900">Tao hoa don checkout</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Tao hoa don theo booking da checkout, tinh tien theo so ngay luu tru thuc te.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmAction("cancel")}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <XCircle size={18} />
              Huy
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction("save")}
              disabled={invoiceExists}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              <Save size={18} />
              Luu
            </button>
          </div>
        </div>

        {invoiceExists ? (
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
            Booking phong nay da co hoa don truoc do. Ban co the quay lai danh sach hoa don de xem.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <section className="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                <Receipt size={22} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Thong tin booking</p>
                <h2 className="text-2xl font-black text-slate-900">{booking.bookingCode}</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Khach hang</p>
                <p className="mt-2 text-lg font-black text-slate-900">{guestName}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phong</p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  Phong {roomNumber} - {roomName}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ngay nhan phong</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDate(detail.checkInDate)}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Realtime checkout</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDateTime(currentTime)}</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50 p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Gia 1 dem</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(roomRate)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">So ngay da o</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{stayedDays} ngay</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Tien tam tinh</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(subtotal)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-sky-800">
                Cong thuc: {formatCurrency(roomRate)} x {stayedDays} ngay = {formatCurrency(subtotal)}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Voucher</p>
                  <h3 className="text-xl font-black text-slate-900">Ap dung giam gia</h3>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <select
                  value={selectedVoucherId}
                  onChange={(event) => setSelectedVoucherId(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400"
                >
                  <option value="">Khong ap dung voucher</option>
                  {availableVouchers.map((voucher) => (
                    <option key={voucher.id} value={voucher.id}>
                      {voucher.code} - {voucher.discountType} {voucher.discountValue}
                    </option>
                  ))}
                </select>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {selectedVoucher
                    ? `${selectedVoucher.code} - giam ${formatCurrency(discountAmount)}`
                    : "Chua ap dung voucher"}
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Ghi chu hoa don..."
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
              />
            </div>
          </section>

          <aside className="space-y-4 rounded-[2rem] bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">Tong ket hoa don</p>
            <div className="rounded-[1.5rem] bg-white/10 p-4">
              <p className="text-sm font-semibold text-white/70">Tong tien phong</p>
              <p className="mt-2 text-3xl font-black">{formatCurrency(subtotal)}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-4">
              <p className="text-sm font-semibold text-white/70">Giam voucher</p>
              <p className="mt-2 text-3xl font-black text-emerald-300">- {formatCurrency(discountAmount)}</p>
            </div>
            <div className="rounded-[1.5rem] bg-sky-500 p-4 text-slate-950">
              <p className="text-sm font-semibold text-slate-900/70">Tong thanh toan</p>
              <p className="mt-2 text-4xl font-black">{formatCurrency(totalAmount)}</p>
              <p className="mt-3 text-sm font-semibold text-slate-900/70">Trang thai sau khi luu: Pending</p>
            </div>
          </aside>
        </div>
      </div>

      {confirmAction === "cancel" ? (
        <ConfirmDialog
          title="Xac nhan huy tao hoa don"
          description="Neu huy, du lieu hoa don moi se khong duoc luu va he thong se quay lai trang Tra phong."
          confirmLabel="Co, huy"
          tone="rose"
          onCancel={() => setConfirmAction("")}
          onConfirm={handleCancelConfirmed}
        />
      ) : null}

      {confirmAction === "save" ? (
        <ConfirmDialog
          title="Xac nhan luu hoa don"
          description="Hoa don se duoc luu vao danh sach hoa don voi trang thai Pending. Ban co muon tiep tuc?"
          confirmLabel="Co, luu hoa don"
          onCancel={() => setConfirmAction("")}
          onConfirm={handleSaveConfirmed}
        />
      ) : null}
    </>
  );
};

export default AdminInvoiceCreatePage;
