import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Eye, Receipt, Search, X } from "lucide-react";
import { invoicesApi } from "../../api/admin/invoicesApi";
import { hasPermission } from "../../utils/permissions";
import { formatVietnamDateTime } from "../../utils/vietnamTime";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} đ`;

const statusClasses = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const AdminInvoiceListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [screenNotice, setScreenNotice] = useState(location.state?.notice || null);
  const canPayInvoice = hasPermission("PAY_INVOICE");

  const invoicesQuery = useQuery({
    queryKey: ["invoices", search],
    queryFn: () => invoicesApi.getInvoices({ search: search.trim() || undefined }),
  });

  useEffect(() => {
    if (!location.state?.notice) return;
    window.history.replaceState({}, document.title);
  }, [location.state]);

  useEffect(() => {
    if (!screenNotice) return undefined;
    const timer = window.setTimeout(() => setScreenNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [screenNotice]);

  const filteredInvoices = useMemo(() => invoicesQuery.data || [], [invoicesQuery.data]);

  return (
    <div className="space-y-6">
      {screenNotice ? (
        <div className="sticky top-20 z-20">
          <div className="flex items-start justify-between gap-4 rounded-[2rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sky-900 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 text-sky-600" size={22} />
              <div>
                <p className="font-black">{screenNotice.title}</p>
                <p className="text-sm">{screenNotice.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScreenNotice(null)}
              className="rounded-xl p-2 transition hover:bg-white/70"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Danh sách hóa đơn</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Hóa đơn mới lưu sẽ ở trạng thái Pending cho tới khi được thanh toán.
          </p>
        </div>

      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã hóa đơn, booking, khách..."
              className="w-80 rounded-2xl bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-sky-300"
            />
          </div>

          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
            Tổng hóa đơn: {filteredInvoices.length}
          </div>
        </div>

        {invoicesQuery.isLoading ? (
          <div className="rounded-[1.75rem] bg-slate-50 px-6 py-14 text-center text-slate-500">
            Đang tải danh sách hóa đơn...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-sky-50/60 px-6 py-14 text-center">
            <Receipt className="mx-auto text-sky-300" size={34} />
            <p className="mt-4 text-lg font-black text-slate-900">Chưa có hóa đơn nào</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Từ trang Trả phòng, bấm Tạo hóa đơn để tạo invoice mới.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-sky-50">
                <tr className="text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-5 py-4">Hóa đơn</th>
                  <th className="px-5 py-4">Khách</th>
                  <th className="px-5 py-4">Tổng tiền</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Tạo lúc</th>
                  <th className="px-5 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{invoice.code}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Booking {invoice.bookingCode} - Phòng {invoice.roomNumber}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{invoice.guestName}</td>
                    <td className="px-5 py-4 text-sm font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                          statusClasses[invoice.status] || statusClasses.Pending
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                      {formatVietnamDateTime(invoice.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl bg-sky-100 px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:bg-sky-200"
                        >
                          <Eye size={16} />
                          Xem
                        </Link>
                        {canPayInvoice ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/invoices/${invoice.id}/payment`)}
                            disabled={invoice.status === "Completed"}
                            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                          >
                            <CreditCard size={16} />
                            {invoice.status === "Completed" ? "Completed" : "Thanh toán"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvoiceListPage;
