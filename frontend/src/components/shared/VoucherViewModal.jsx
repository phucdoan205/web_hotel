import React, { useState } from "react";
import { Ticket, Copy, X } from "lucide-react";

const VoucherViewModal = ({ voucher, onClose }) => {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  if (!voucher) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="border-b border-slate-100 bg-slate-50/50 p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-100">
              <Ticket size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {voucher.name || "Chi tiết Voucher"}
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100 px-8 py-6">
          <div className="grid grid-cols-[180px_1fr] py-5">
            <span className="text-sm font-bold text-slate-400">Giá trị ưu đãi</span>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Giảm {voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : `${voucher.discountValue?.toLocaleString()} VND`}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Cho đơn từ {voucher.minBookingValue ? `${voucher.minBookingValue.toLocaleString()} VND` : "0 VND"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr] py-5">
            <span className="text-sm font-bold text-slate-400">Thời gian hiệu lực</span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className="size-1.5 rounded-full bg-slate-400" />
                Bắt đầu ngày: {voucher.validFrom ? new Date(voucher.validFrom).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className="size-1.5 rounded-full bg-slate-400" />
                Hiệu lực tới: {voucher.validTo ? new Date(voucher.validTo).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr] py-5">
            <span className="text-sm font-bold text-slate-400">Mã ưu đãi</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black tracking-wider text-slate-900">{voucher.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(voucher.code);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600 transition hover:bg-orange-100"
              >
                <Copy size={14} />
                Sao chép
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr] py-5">
            <span className="text-sm font-bold text-slate-400">Mô tả</span>
            <div>
              <p className={`text-sm font-medium leading-relaxed text-slate-600 ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
                {voucher.description || "Không có mô tả cho voucher này."}
              </p>
              {voucher.description && voucher.description.length > 150 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  {isDescExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherViewModal;
