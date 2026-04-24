import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Receipt } from "lucide-react";
import { invoicesApi } from "../../api/admin/invoicesApi";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { servicesApi } from "../../api/admin/servicesApi";
import { formatVietnamDate, formatVietnamDateTime } from "../../utils/vietnamTime";
import { openInvoicePrintWindow } from "../../utils/invoicePrint";

const currencyFormatter = new Intl.NumberFormat("vi-VN");
const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} đ`;

const AdminInvoiceDetailPage = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const invoiceQuery = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => invoicesApi.getInvoiceById(invoiceId),
    enabled: Boolean(invoiceId),
  });

  const invoice = invoiceQuery.data;

  const bookingQuery = useQuery({
    queryKey: ["booking", invoice?.bookingId],
    queryFn: () => bookingsApi.getBookingById(invoice.bookingId),
    enabled: Boolean(invoice?.bookingId),
  });

  const booking = bookingQuery.data;

  const serviceUsagesQuery = useQuery({
    queryKey: ["invoice-service-items", invoice?.detailId, invoice?.status, invoice?.createdAt],
    queryFn: async () => {
      const items = await servicesApi.getUsageHistory({
        bookingDetailId: invoice.detailId,
      });

      return items.filter((item) => {
        if (item.bookingDetailId !== invoice.detailId) return false;

        const usedAtTime = item.usedAt ? new Date(item.usedAt).getTime() : 0;
        const invoiceCreatedTime = invoice.createdAt ? new Date(invoice.createdAt).getTime() : Number.MAX_SAFE_INTEGER;

        return usedAtTime <= invoiceCreatedTime;
      });
    },
    enabled: Boolean(invoice?.detailId),
  });

  const serviceItems = useMemo(() => serviceUsagesQuery.data || [], [serviceUsagesQuery.data]);

  if (invoiceQuery.isLoading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center text-slate-500">Đang tải chi tiết hóa đơn...</div>;
  }

  if (!invoice) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Không tìm thấy hóa đơn cần xem.
      </div>
    );
  }

  const handlePrintInvoice = () => {
    openInvoicePrintWindow({
      invoice,
      booking,
      serviceItems,
      receiptDateText: invoice?.paidAt || invoice?.createdAt || invoice?.updatedAt
        ? formatVietnamDateTime(invoice.paidAt || invoice.createdAt || invoice.updatedAt)
        : "--",
    });
  };

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
            Quay lại danh sách
          </button>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Chi tiết hóa đơn</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Bao gồm tiền phòng và các dịch vụ đã cộng khi checkout.</p>
        </div>

        <button
          type="button"
          onClick={handlePrintInvoice}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700"
        >
          <Printer size={18} />
          In hóa đơn
        </button>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-[1.5rem] bg-sky-100 p-4 text-sky-600">
              <Receipt size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Hóa đơn</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">{invoice.code}</h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-sky-50 px-5 py-4 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Trạng thái</p>
            <p className="mt-2 text-2xl font-black text-sky-700">{invoice.status}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Khách hàng</p>
            <p className="mt-2 text-lg font-black text-slate-900">{invoice.guestName}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Booking {invoice.bookingCode}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phòng</p>
            <p className="mt-2 text-lg font-black text-slate-900">
              Phòng {invoice.roomNumber} - {invoice.roomName}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Check-in</p>
            <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDate(invoice.checkInDate)}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Check-out</p>
            <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDateTime(invoice.checkOutDate)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-slate-200">
          <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-sky-50 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            <div>Hạng mục</div>
            <div>Đơn giá</div>
            <div>Số lượng</div>
            <div className="text-right">Thành tiền</div>
          </div>

          <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr] gap-4 px-5 py-5 text-sm font-semibold text-slate-700">
            <div>Tiền phòng {invoice.roomName}</div>
            <div>{formatCurrency(invoice.roomRate)}</div>
            <div>{invoice.stayedDays} ngày</div>
            <div className="text-right font-black text-slate-900">{formatCurrency(invoice.subtotal)}</div>
          </div>

          {serviceUsagesQuery.isLoading ? (
            <div className="border-t border-slate-100 px-5 py-5 text-sm text-slate-500">Đang tải chi tiết dịch vụ...</div>
          ) : serviceItems.length > 0 ? (
            serviceItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.7fr_1fr_1fr_1fr] gap-4 border-t border-slate-100 px-5 py-5 text-sm font-semibold text-slate-700"
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
            <div className="border-t border-slate-100 px-5 py-5 text-sm text-slate-500">Không có dịch vụ nào trong hóa đơn này.</div>
          )}
        </div>

        <div className="mt-6 ml-auto max-w-md space-y-3 rounded-[1.75rem] bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-500 p-5 text-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Tổng tiền phòng</span>
            <span className="font-bold">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Tổng tiền dịch vụ</span>
            <span className="font-bold">{formatCurrency(invoice.totalServiceAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Voucher {invoice.voucher?.code ? `(${invoice.voucher.code})` : ""}</span>
            <span className="font-bold text-cyan-100">- {formatCurrency(invoice.discountAmount)}</span>
          </div>
          <div className="h-px bg-white/15" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/80">Tổng thanh toán</span>
            <span className="text-3xl font-black">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>

        {invoice.notes ? (
          <div className="mt-6 rounded-[1.5rem] bg-sky-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ghi chú</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{invoice.notes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminInvoiceDetailPage;
