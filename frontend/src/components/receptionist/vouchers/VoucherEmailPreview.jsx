import React from "react";

const formatDiscount = (voucher) =>
  voucher.discountType === "PERCENT"
    ? `${voucher.discountValue}%`
    : `${voucher.discountValue}`;

const VoucherEmailPreview = ({ voucher, message, onSend, recipientsPreview = [] }) => {
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
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">
          {message?.trim() || "Khách sạn gửi đến bạn một ưu đãi đặc biệt cho kỳ nghỉ tiếp theo."}
        </p>
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
          <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
            Gửi tới: {recipientsPreview.join(", ")}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div>
            <div className="text-sm font-black text-slate-900">Sẵn sàng gửi email</div>
            <div className="mt-1 text-xs font-medium text-slate-500">
              Mẫu email sẽ hiển thị chuyên nghiệp hơn khi gửi thật tới khách hàng.
            </div>
          </div>
          <button
            onClick={onSend}
            className="rounded-2xl bg-[#0085FF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-600"
          >
            Gửi email
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherEmailPreview;
