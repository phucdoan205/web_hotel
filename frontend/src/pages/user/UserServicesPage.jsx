import React from "react";
import { FileText, ShoppingBag } from "lucide-react";

const mockServices = [
  {
    id: "SV-01",
    name: "Bữa sáng buffet",
    room: "Phòng 102",
    price: "120.000 đ",
    usedAt: "23/04/2026 08:00",
  },
  {
    id: "SV-02",
    name: "Giặt ủi",
    room: "Phòng 203",
    price: "80.000 đ",
    usedAt: "22/04/2026 17:30",
  },
];

const UserServicesPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          User / Dịch vụ
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Dịch vụ đã sử dụng</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Theo dõi những dịch vụ đã phát sinh trong quá trình lưu trú của bạn.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Danh sách dịch vụ</h2>
            <p className="text-sm font-medium text-slate-500">{mockServices.length} dịch vụ đã ghi nhận</p>
          </div>
        </div>

        {mockServices.length ? (
          <div className="space-y-4">
            {mockServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-black text-slate-900">{service.name}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{service.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{service.price}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{service.usedAt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <FileText className="mx-auto size-10" />
            <p className="mt-4 text-sm font-semibold">Bạn chưa sử dụng dịch vụ nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserServicesPage;
