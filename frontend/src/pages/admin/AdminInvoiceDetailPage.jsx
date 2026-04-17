import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Receipt } from "lucide-react";
import { getStoredInvoiceById } from "../../utils/invoiceState";
import { formatVietnamDate, formatVietnamDateTime } from "../../utils/vietnamTime";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} d`;

const AdminInvoiceDetailPage = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const invoice = useMemo(() => getStoredInvoiceById(invoiceId), [invoiceId]);

  if (!invoice) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        Khong tim thay hoa don can xem.
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
            Quay lai danh sach
          </button>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Chi tiet hoa don</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Chi xem lai hoa don va in hoa don tu man nay.</p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-black"
        >
          <Printer size={18} />
          In hoa don
        </button>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-[1.5rem] bg-sky-100 p-4 text-sky-600">
              <Receipt size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Invoice</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">{invoice.code}</h2>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Trang thai</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{invoice.status}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Khach hang</p>
            <p className="mt-2 text-lg font-black text-slate-900">{invoice.guestName}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Booking {invoice.bookingCode}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Phong</p>
            <p className="mt-2 text-lg font-black text-slate-900">
              Phong {invoice.roomNumber} - {invoice.roomName}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Check in</p>
            <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDate(invoice.checkInDate)}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Check out</p>
            <p className="mt-2 text-lg font-black text-slate-900">{formatVietnamDateTime(invoice.checkOutDate)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-slate-200">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            <div>Dich vu</div>
            <div>Don gia</div>
            <div>So ngay</div>
            <div className="text-right">Thanh tien</div>
          </div>
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 px-5 py-5 text-sm font-semibold text-slate-700">
            <div>Tien phong {invoice.roomName}</div>
            <div>{formatCurrency(invoice.roomRate)}</div>
            <div>{invoice.stayedDays} ngay</div>
            <div className="text-right font-black text-slate-900">{formatCurrency(invoice.subtotal)}</div>
          </div>
        </div>

        <div className="mt-6 ml-auto max-w-md space-y-3 rounded-[1.75rem] bg-slate-900 p-5 text-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Tong tien phong</span>
            <span className="font-bold">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">
              Voucher {invoice.voucher?.code ? `(${invoice.voucher.code})` : ""}
            </span>
            <span className="font-bold text-emerald-300">- {formatCurrency(invoice.discountAmount)}</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/70">Tong thanh toan</span>
            <span className="text-3xl font-black">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>

        {invoice.notes ? (
          <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ghi chu</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{invoice.notes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminInvoiceDetailPage;
