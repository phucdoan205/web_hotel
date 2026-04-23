import React from "react";
import { Gift, TicketPercent } from "lucide-react";

const mockVouchers = [
  {
    id: "SUMMER26",
    discount: "Giảm 20%",
    description: "Áp dụng cho booking từ 1.000.000 đ",
    expiry: "30/06/2026",
  },
  {
    id: "WELCOME100K",
    discount: "Giảm 100.000 đ",
    description: "Dành cho khách hàng mới",
    expiry: "31/12/2026",
  },
];

const UserVouchersPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          User / Voucher
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Voucher của tôi</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Quản lý các voucher đang còn hiệu lực để áp dụng khi đặt phòng.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {mockVouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <Gift size={22} />
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                HSD {voucher.expiry}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">{voucher.id}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{voucher.discount}</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{voucher.description}</p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <TicketPercent size={16} />
              Sẵn sàng áp dụng khi đặt phòng
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserVouchersPage;
