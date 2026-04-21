import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, CreditCard, Eye, Receipt, Search, X } from "lucide-react";
import { invoicesApi } from "../../api/admin/invoicesApi";
import { hasPermission } from "../../utils/permissions";
import { formatVietnamDateTime } from "../../utils/vietnamTime";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} d`;

const statusClasses = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const AdminInvoiceListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [screenNotice, setScreenNotice] = useState(location.state?.notice || null);
  const [pendingPaymentInvoice, setPendingPaymentInvoice] = useState(null);
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

  const completeInvoiceMutation = useMutation({
    mutationFn: (invoiceId) => invoicesApi.completeInvoice(invoiceId),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", String(invoice.id)] });
      setPendingPaymentInvoice(null);
      setScreenNotice({
        type: "success",
        title: "Da thanh toan hoa don",
        message: `${invoice.code || "Hoa don"} da chuyen sang Completed.`,
      });
    },
  });

  const filteredInvoices = useMemo(() => invoicesQuery.data || [], [invoicesQuery.data]);

  const handlePaymentConfirmed = () => {
    if (!pendingPaymentInvoice) return;
    completeInvoiceMutation.mutate(pendingPaymentInvoice.id);
  };

  return (
    <>
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
            <h1 className="text-3xl font-black text-slate-900">Danh sach hoa don</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Hoa don moi luu se o trang thai Pending cho toi khi duoc thanh toan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/check-out")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Quay lai tra phong
          </button>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tim ma hoa don, booking, khach..."
                className="w-80 rounded-2xl bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-sky-300"
              />
            </div>

            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
              Tong hoa don: {filteredInvoices.length}
            </div>
          </div>

          {invoicesQuery.isLoading ? (
            <div className="rounded-[1.75rem] bg-slate-50 px-6 py-14 text-center text-slate-500">
              Dang tai danh sach hoa don...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-sky-50/60 px-6 py-14 text-center">
              <Receipt className="mx-auto text-sky-300" size={34} />
              <p className="mt-4 text-lg font-black text-slate-900">Chua co hoa don nao</p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Tu trang Tra phong, bam Tao hoa don de tao invoice moi.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-sky-50">
                  <tr className="text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-4">Hoa don</th>
                    <th className="px-5 py-4">Khach</th>
                    <th className="px-5 py-4">Tong tien</th>
                    <th className="px-5 py-4">Trang thai</th>
                    <th className="px-5 py-4">Tao luc</th>
                    <th className="px-5 py-4 text-right">Hanh dong</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900">{invoice.code}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Booking {invoice.bookingCode} - Phong {invoice.roomNumber}
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
                              onClick={() => setPendingPaymentInvoice(invoice)}
                              disabled={invoice.status === "Completed"}
                              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                            >
                              <CreditCard size={16} />
                              {invoice.status === "Completed" ? "Completed" : "Thanh toan"}
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

      {pendingPaymentInvoice && canPayInvoice ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-sky-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                <Clock3 size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Xac nhan thanh toan</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Thanh toan xong se chuyen hoa don <span className="font-bold">{pendingPaymentInvoice.code}</span> sang
                  trang thai Completed.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingPaymentInvoice(null)}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Khong
              </button>
              <button
                type="button"
                onClick={handlePaymentConfirmed}
                disabled={completeInvoiceMutation.isPending}
                className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {completeInvoiceMutation.isPending ? "Dang xu ly..." : "Co, thanh toan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminInvoiceListPage;
