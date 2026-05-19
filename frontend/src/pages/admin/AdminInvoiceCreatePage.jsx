import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Receipt, Save, Tag, XCircle } from "lucide-react";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { invoicesApi } from "../../api/admin/invoicesApi";
import { servicesApi } from "../../api/admin/servicesApi";
import { housekeepingApi } from "../../api/admin/housekeepingApi";
import { useVoucherData } from "../../hooks/useVoucherData";
import { markBookingDetailInvoiced } from "../../utils/bookingRoomFlowState";
import { calculateStayedDays, calculateVoucherDiscount, isVoucherApplicable } from "../../utils/invoiceState";
import {
  getRoomEntryGuestName,
  getRoomEntryName,
  getRoomEntryNumber,
  getRoomEntryPrice,
} from "../../utils/bookingRoomEntries";
import { formatVietnamDate, formatVietnamDateTime } from "../../utils/vietnamTime";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} đ`;

const ConfirmDialog = ({ title, description, confirmLabel, tone = "sky", onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-sky-950/35 p-4 backdrop-blur-sm">
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
          Không
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
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bookingId = Number(searchParams.get("bookingId"));
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

  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingsApi.getBookingById(bookingId),
    enabled: Boolean(bookingId),
  });

  const allInvoicesQuery = useQuery({
    queryKey: ["booking-invoices", bookingId],
    queryFn: () => invoicesApi.getInvoices({ bookingId }),
    enabled: Boolean(bookingId),
  });

  const allServicesQuery = useQuery({
    queryKey: ["invoice-services", detailId],
    queryFn: () => servicesApi.getUsageHistory({ bookingDetailId: detailId }),
    enabled: Boolean(detailId),
  });

  const inventoryReportsQuery = useQuery({
    queryKey: ["admin-inventory-reports"],
    queryFn: () => housekeepingApi.getInventoryReports(),
  });

  const allServiceItems = allServicesQuery.data || [];
  const unpaidServiceItems = allServiceItems.filter(s => s.paymentStatus !== "Paid");
  
  const serviceSubtotal = useMemo(() => {
    const ordersMap = new Map();
    unpaidServiceItems.forEach(item => {
      const orderId = item.orderServiceId;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          totalAmount: item.orderTotalAmount,
          itemSum: 0
        });
      }
      ordersMap.get(orderId).itemSum += Number(item.lineTotal || 0);
    });

    let total = 0;
    ordersMap.forEach(order => {
      total += order.totalAmount !== null && order.totalAmount !== undefined
        ? Number(order.totalAmount)
        : order.itemSum;
    });
    return total;
  }, [unpaidServiceItems]);

  const originalServiceSubtotal = useMemo(() => {
    return unpaidServiceItems.reduce((total, item) => total + Number(item.lineTotal || 0), 0);
  }, [unpaidServiceItems]);

  const serviceVoucherDiscount = useMemo(() => {
    const diff = originalServiceSubtotal - serviceSubtotal;
    return diff > 0 ? diff : 0;
  }, [originalServiceSubtotal, serviceSubtotal]);
 
  const lossDamageReports = inventoryReportsQuery.data?.lossDamageReports || [];
  const roomLossDamageReports = lossDamageReports.filter(
    (item) => item.bookingDetailId === detailId && item.resolutionType === "Pending"
  );
  const totalLossDamageAmount = roomLossDamageReports.reduce(
    (sum, item) => sum + Number(item.penaltyAmount || 0),
    0
  );

  const booking = bookingQuery.data;
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
    () => vouchers.filter((voucher) => isVoucherApplicable(voucher, subtotal, currentTime) && voucher.voucherType !== "Service"),
    [currentTime, subtotal, vouchers],
  );
  const selectedVoucher =
    availableVouchers.find((voucher) => String(voucher.id) === String(selectedVoucherId)) || null;
  const discountAmount = calculateVoucherDiscount(selectedVoucher, subtotal);
  const allInvoices = allInvoicesQuery.data || [];
  
  const totalDepositPaid = allInvoices
    .filter((inv) => inv.detailId === null && inv.status === "Completed")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const depositAlreadyUsed = allInvoices
    .filter((inv) => inv.detailId !== null && inv.status !== "Cancelled")
    .reduce(
      (sum, inv) =>
        sum +
        Math.max(0, (inv.subtotal || 0) + (inv.totalServiceAmount || 0) + (inv.totalLossDamageAmount || 0) - (inv.discountAmount || 0) - (inv.membershipDiscountAmount || 0)) -
        (inv.totalAmount || 0),
      0
    );

  const membershipTierName = booking?.membershipTierName || null;
  const membershipDiscountPercent = Number(booking?.membershipDiscountPercent || 0);
  const membershipDiscountAmount = membershipDiscountPercent > 0 
    ? Math.round(subtotal * membershipDiscountPercent / 100) 
    : 0;

  const remainingDeposit = Math.max(0, totalDepositPaid - depositAlreadyUsed);
  const calculatedSubtotal = Math.max(0, subtotal + serviceSubtotal + totalLossDamageAmount - discountAmount - membershipDiscountAmount);
  const depositToApply = Math.min(remainingDeposit, calculatedSubtotal);

  const totalAmount = Math.max(0, calculatedSubtotal - depositToApply);
  const invoiceExists = allInvoices.some((inv) => inv.detailId === detailId && inv.status !== "Cancelled");

  const createInvoiceMutation = useMutation({
    mutationFn: () =>
      invoicesApi.createInvoice({
        bookingId,
        bookingDetailId: detailId,
        voucherId: selectedVoucher?.id || null,
        notes: notes.trim() || null,
        roomRate,
        checkOutDate: currentTime.toISOString(),
        stayedDays,
        totalRoomAmount: subtotal,
        discountAmount,
        finalTotal: totalAmount,
        voucherCode: selectedVoucher?.code || null,
        voucherDiscountType: selectedVoucher?.discountType || null,
        voucherDiscountValue: selectedVoucher?.discountValue || null,
      }),
    onSuccess: (invoice) => {
      markBookingDetailInvoiced(bookingId, detailId);
      queryClient.invalidateQueries({ queryKey: ["booking-invoices", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["invoice-exists", bookingId, detailId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["departures"] });
      queryClient.invalidateQueries({ queryKey: ["checkout-bookings"] });
      navigate(`/admin/invoices/${invoice.id}/payment`, {
        replace: true,
        state: {
          notice: {
            type: "success",
            title: "Đã lưu hóa đơn",
            message: `Hóa đơn ${invoice.code} đã được tạo thành công, vui lòng tiến hành thanh toán.`,
          },
        },
      });
    },
  });

  if (bookingQuery.isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500">Đang tải dữ liệu hóa đơn...</div>;
  }

  if (bookingQuery.isError || !booking || !detail) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Không tìm thấy booking hoặc chi tiết phòng để tạo hóa đơn.
      </div>
    );
  }

  const handleCancelConfirmed = () => {
    setConfirmAction("");
    navigate("/admin/check-out");
  };

  const handleSaveConfirmed = () => {
    if (invoiceExists) return;
    createInvoiceMutation.mutate();
  };

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
              Quay lại trả phòng
            </button>
            <h1 className="mt-4 text-3xl font-black text-slate-900">Tạo hóa đơn checkout</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Hóa đơn sẽ tự cộng toàn bộ dịch vụ chưa thanh toán của phòng này.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmAction("cancel")}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <XCircle size={18} />
              Hủy
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction("save")}
              disabled={
                invoiceExists ||
                allInvoicesQuery.isLoading ||
                allServicesQuery.isLoading ||
                createInvoiceMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              <Save size={18} />
              {createInvoiceMutation.isPending ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {invoiceExists ? (
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
            Phòng này đã có hóa đơn trước đó.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <section className="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                <Receipt size={22} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Thông tin booking</p>
                <h2 className="text-2xl font-black text-slate-900">{booking.bookingCode}</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Khách hàng</p>
                <p className="mt-2 text-lg font-black text-slate-900">{guestName}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phòng</p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  Phòng {roomNumber} - {roomName}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ngày nhận phòng</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDate(detail.checkInDate)}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Checkout thực tế</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDateTime(currentTime)}</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Giá 1 đêm</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(roomRate)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Số ngày đã ở</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{stayedDays} ngày</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Tiền phòng</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(subtotal)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-sky-800">
                Công thức: {formatCurrency(roomRate)} x {stayedDays} ngày = {formatCurrency(subtotal)}
              </p>
              <p className="mt-2 text-sm font-semibold text-sky-800">
                Dịch vụ chưa thanh toán: {formatCurrency(serviceSubtotal)}
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-slate-200">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-lg font-black text-slate-900">Chi tiết tiền phòng</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Hiển thị tên phòng, giá 1 đêm, số ngày và thành tiền.
                  </p>
                </div>

                <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr] gap-4 bg-sky-50 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  <div>Phòng</div>
                  <div>Giá 1 đêm</div>
                  <div>Số ngày</div>
                  <div className="text-right">Thành tiền</div>
                </div>

                <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr] gap-4 px-5 py-5 text-sm font-semibold text-slate-700">
                  <div>
                    Phòng {roomNumber} - {roomName}
                  </div>
                  <div>{formatCurrency(roomRate)}</div>
                  <div>{stayedDays} ngày</div>
                  <div className="text-right font-black text-slate-900">{formatCurrency(subtotal)}</div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-lg font-black text-slate-900">Chi tiết dịch vụ</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Hiển thị tên dịch vụ, đơn giá, số lượng và thành tiền.
                  </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                  <div className="grid grid-cols-4 gap-4 bg-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <div>Dịch vụ</div>
                    <div>Đơn giá</div>
                    <div>Số lượng</div>
                    <div className="text-right">Thành tiền</div>
                  </div>

                  {allServicesQuery.isLoading ? (
                    <div className="px-5 py-5 text-sm text-slate-500">Đang tải chi tiết dịch vụ...</div>
                  ) : allServiceItems.length > 0 ? (
                    allServiceItems.map((item) => {
                      const isPaidBefore = item.paymentStatus === "Paid";
                      return (
                        <div
                          key={item.id}
                          className={`grid grid-cols-4 items-center gap-4 border-t border-slate-200 px-5 py-4 text-sm transition hover:bg-slate-100 ${isPaidBefore ? "opacity-60 bg-slate-50/50" : ""}`}
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
                          <div className={`font-medium ${isPaidBefore ? "text-slate-400 line-through" : "text-slate-600"}`}>
                            {formatCurrency(item.unitPrice)}
                          </div>
                          <div className={`font-medium ${isPaidBefore ? "text-slate-400" : "text-slate-600"}`}>x {item.quantity}</div>
                          <div className={`text-right font-black ${isPaidBefore ? "text-slate-400 line-through" : "text-slate-900"}`}>
                            {formatCurrency(item.lineTotal)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-5 py-5 text-sm text-slate-500">Không có dịch vụ nào.</div>
                  )}
                </div>
              </div>

              {roomLossDamageReports.length > 0 && (
                <div className="rounded-[1.75rem] border border-slate-200">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-black text-slate-900">Chi tiết thất thoát đền bù</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Hiển thị danh sách vật tư bị thất thoát, hỏng hóc trong phòng.
                    </p>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                    <div className="grid grid-cols-4 gap-4 bg-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <div>Vật tư</div>
                      <div>Đơn giá đền bù</div>
                      <div>Số lượng</div>
                      <div className="text-right">Thành tiền</div>
                    </div>

                    {roomLossDamageReports.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-4 items-center gap-4 border-t border-slate-200 px-5 py-4 text-sm transition hover:bg-slate-100"
                      >
                        <div className="font-semibold text-slate-800">
                          {item.equipmentName}
                        </div>
                        <div className="font-medium text-slate-600">
                          {formatCurrency(item.unitPenalty)}
                        </div>
                        <div className="font-medium text-slate-600">x {item.quantity}</div>
                        <div className="text-right font-black text-slate-900">
                          {formatCurrency(item.penaltyAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Voucher</p>
                  <h3 className="text-xl font-black text-slate-900">Áp dụng giảm giá</h3>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                <select
                  value={selectedVoucherId}
                  onChange={(event) => setSelectedVoucherId(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400"
                >
                  <option value="">Không áp dụng voucher</option>
                  {availableVouchers.map((voucher) => (
                    <option key={voucher.id} value={voucher.id}>
                      {voucher.code} - {voucher.discountType} {voucher.discountValue}
                    </option>
                  ))}
                </select>

                <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                  {selectedVoucher
                    ? `${selectedVoucher.code} - giảm ${formatCurrency(discountAmount)}`
                    : "Chưa áp dụng voucher"}
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Ghi chú hóa đơn..."
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
              />
            </div>
          </section>

          <aside className="space-y-4 rounded-[2rem] bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-500 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">Tổng kết hóa đơn</p>
            <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white/80">Tổng tiền phòng</p>
              <p className="mt-2 text-3xl font-black">{formatCurrency(subtotal)}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white/80">Tiền dịch vụ</p>
              <p className="mt-2 text-3xl font-black">{formatCurrency(originalServiceSubtotal)}</p>
            </div>
            {serviceVoucherDiscount > 0 && (
              <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white/80">Giảm voucher dịch vụ</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">- {formatCurrency(serviceVoucherDiscount)}</p>
              </div>
            )}
            {totalLossDamageAmount > 0 && (
              <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white/80">Thất thoát hư hỏng</p>
                <p className="mt-2 text-3xl font-black">{formatCurrency(totalLossDamageAmount)}</p>
              </div>
            )}
            <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white/80">Giảm voucher phòng</p>
              <p className="mt-2 text-3xl font-black text-cyan-100">- {formatCurrency(discountAmount)}</p>
            </div>
            {membershipDiscountAmount > 0 && (
              <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white/80">
                  Giảm Membership ({membershipTierName} - {membershipDiscountPercent}%)
                </p>
                <p className="mt-2 text-3xl font-black text-cyan-100">- {formatCurrency(membershipDiscountAmount)}</p>
              </div>
            )}
            <div className="rounded-[1.5rem] bg-white/15 p-4 backdrop-blur-sm">
              {(() => {
                const roomTotalAfterDiscount = Math.max(0, subtotal + totalLossDamageAmount - discountAmount - membershipDiscountAmount);
                const rawDepositPct = roomTotalAfterDiscount > 0 ? (totalDepositPaid / roomTotalAfterDiscount) * 100 : 0;
                const depositPct = rawDepositPct <= 0 ? 0 : [30, 40, 50, 100].reduce((prev, curr) => Math.abs(curr - rawDepositPct) < Math.abs(prev - rawDepositPct) ? curr : prev);
                return (
                  <>
                    <p className="text-sm font-semibold text-white/80">Trừ tiền cọc {depositPct > 0 ? `(${depositPct}%)` : ""}</p>
                    <div className="mt-1 flex items-center justify-between text-xs font-semibold text-white/60">
                      <span>Tổng cọc: {formatCurrency(totalDepositPaid)}</span>
                      <span>Khả dụng: {formatCurrency(remainingDeposit)}</span>
                    </div>
                    <p className="mt-1 text-3xl font-black text-cyan-100">- {formatCurrency(depositToApply)}</p>
                  </>
                );
              })()}
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 text-sky-900">
              <p className="text-sm font-semibold text-sky-700">Cần thanh toán</p>
              <p className="mt-2 text-4xl font-black">{formatCurrency(totalAmount)}</p>
              <p className="mt-3 text-sm font-semibold text-sky-700">Trạng thái sau khi lưu: Paying</p>
            </div>
          </aside>
        </div>
      </div>

      {confirmAction === "cancel" ? (
        <ConfirmDialog
          title="Xác nhận hủy tạo hóa đơn"
          description="Nếu hủy, dữ liệu hóa đơn mới sẽ không được lưu và hệ thống sẽ quay lại trang Trả phòng."
          confirmLabel="Có, hủy"
          tone="rose"
          onCancel={() => setConfirmAction("")}
          onConfirm={handleCancelConfirmed}
        />
      ) : null}

      {confirmAction === "save" ? (
        <ConfirmDialog
          title="Xác nhận lưu hóa đơn"
          description="Hóa đơn sẽ được lưu với trạng thái Paying và đã bao gồm toàn bộ dịch vụ chưa thanh toán."
          confirmLabel="Có, lưu hóa đơn"
          onCancel={() => setConfirmAction("")}
          onConfirm={handleSaveConfirmed}
        />
      ) : null}
    </>
  );
};

export default AdminInvoiceCreatePage;
