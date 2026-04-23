import React from "react";
import { FileText, ReceiptText } from "lucide-react";

const mockInvoices = [
  {
    id: "INV-2026-001",
    room: "Standard Single",
    total: "400.000 đ",
    status: "Đã thanh toán",
    date: "23/04/2026",
  },
  {
    id: "INV-2026-002",
    room: "Superior City View",
    total: "700.000 đ",
    status: "Chờ thanh toán",
    date: "22/04/2026",
  },
];

const UserInvoicesPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          User / Hóa đơn
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Hóa đơn của tôi</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Theo dõi các hóa đơn phát sinh và trạng thái thanh toán của bạn.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ReceiptText size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Danh sách hóa đơn</h2>
            <p className="text-sm font-medium text-slate-500">{mockInvoices.length} hóa đơn</p>
          </div>
        </div>

        {mockInvoices.length ? (
          <div className="space-y-4">
            {mockInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-black text-slate-900">{invoice.id}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{invoice.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{invoice.total}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{invoice.date}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-600">
                  {invoice.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <FileText className="mx-auto size-10" />
            <p className="mt-4 text-sm font-semibold">Bạn chưa có hóa đơn nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInvoicesPage;
