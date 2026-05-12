import React from "react";


const formatDiscount = (voucher) =>
  voucher.discountType === "PERCENT"
    ? `${voucher.discountValue}%`
    : `${voucher.discountValue}`;

const VoucherEmailPreview = ({ voucher, message, recipientsPreview = [] }) => {
  if (!voucher) return null;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl flex flex-col h-full">
      {/* Email Header Mockup */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="text-[11px] text-gray-400 font-medium ml-2">Tin nhắn mới - Voucher</div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header Branding */}
          <div className="text-center pb-6">
            <h2 className="text-2xl font-black text-blue-600 tracking-tighter italic">HPT HOTEL</h2>
          </div>

          {/* User Custom Message */}
          <div
            className="prose prose-sm max-w-none text-slate-700 min-h-[100px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message || "<p className='text-gray-300 italic'>Nội dung email bạn nhập sẽ hiện ở đây...</p>" }}
          />

          {/* Voucher Card */}
          <div className="relative overflow-hidden rounded-3xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-10 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-100/80 mb-1">Voucher đặc quyền</p>
                  <h3 className="text-4xl font-black tracking-wider uppercase">{voucher.code}</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                  <span className="text-2xl font-black">{formatDiscount(voucher)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white grid grid-cols-2 gap-px border-t border-blue-50">
              <div className="p-5 text-center border-r border-blue-50">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Hạn sử dụng</p>
                <p className="text-sm font-bold text-gray-800">
                  {voucher.validTo ? new Date(voucher.validTo).toLocaleDateString("vi-VN") : "Không thời hạn"}
                </p>
              </div>
              <div className="p-5 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Giá tối thiểu</p>
                <p className="text-sm font-bold text-gray-800">
                  {voucher.minBookingValue?.toLocaleString() ?? "0"}đ
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action Mockup */}
          <div className="text-center pt-4">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-sm shadow-lg shadow-blue-200">
              Sử dụng ngay
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
        {recipientsPreview.length > 0 ? (
          <p className="text-[10px] font-medium text-gray-400">
            Gửi tới: <span className="text-gray-600 italic">{recipientsPreview.join(", ")}</span>
          </p>
        ) : (
          <p className="text-[10px] font-medium text-gray-400 italic">
            * Đây là bản xem trước mô phỏng nội dung khách hàng nhận được.
          </p>
        )}
      </div>

      <style>{`
        .prose img {
          max-width: 100% !important;
          max-height: 250px !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          border-radius: 0.75rem;
          margin: 1rem auto !important;
          display: block;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .prose p {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default VoucherEmailPreview;
