import React from "react";


const formatDiscount = (voucher) =>
  voucher.discountType === "PERCENT"
    ? `${voucher.discountValue}%`
    : `${voucher.discountValue}`;

const VoucherEmailPreview = ({ voucher, message, recipientsPreview = [] }) => {
  if (!voucher) return null;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-6 text-white">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">
          Hotel Voucher
        </div>
        <div className="mt-3 text-3xl font-black tracking-[0.08em]">
          {voucher.code}
        </div>
        <div
          className="prose max-w-none bg-gray-50 p-4 rounded-2xl font-black"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </div>

      <div className="grid gap-4 bg-slate-50 px-6 py-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Ưu đãi
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {formatDiscount(voucher)}
          </div>
        </div>
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Thời hạn
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900">
            {voucher.validFrom ? new Date(voucher.validFrom).toLocaleDateString() : "-"} -{" "}
            {voucher.validTo ? new Date(voucher.validTo).toLocaleDateString() : "-"}
          </div>
        </div>
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Điều kiện tối thiểu
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900">
            {voucher.minBookingValue ?? "-"}
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {recipientsPreview.length > 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
            Gửi tới: {recipientsPreview.join(", ")}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
            Mẫu xem trước này mô phỏng giao diện email khách hàng sẽ nhận được.
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherEmailPreview;
