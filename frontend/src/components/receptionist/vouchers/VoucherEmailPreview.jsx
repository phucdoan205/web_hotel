import React from "react";

const VoucherEmailPreview = ({ voucher, message, onSend, recipientsPreview = [] }) => {
  if (!voucher) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-2xl mx-auto text-center">
      <div className="text-xs font-bold text-gray-400 mb-2">Voucher</div>
      <div className="text-4xl font-black text-[#0085FF] tracking-wide mb-4">{voucher.code}</div>

      <div className="text-sm text-gray-700 mb-4">{message ?? `Chúc mừng sinh nhật! Mời bạn nhận ưu đãi từ chúng tôi.`}</div>

      <div className="mb-4 text-sm text-gray-500">
        <div>Giảm: {voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : `${voucher.discountValue}`}</div>
        <div>Thời gian: {voucher.validFrom ? new Date(voucher.validFrom).toLocaleDateString() : "-"} - {voucher.validTo ? new Date(voucher.validTo).toLocaleDateString() : "-"}</div>
      </div>

      {recipientsPreview.length > 0 && (
        <div className="text-xs text-gray-500 mb-4">Gửi tới: {recipientsPreview.join(", ")}</div>
      )}

      <div className="flex justify-center gap-2">
        <button onClick={onSend} className="px-6 py-2 rounded-2xl bg-[#0085FF] text-white font-black">Gửi Email</button>
      </div>
    </div>
  );
};

export default VoucherEmailPreview;
