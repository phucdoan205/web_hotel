import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyVouchers, saveVoucherByCode } from "../../api/user/userVouchersApi";
import { Ticket, Search, Info, CheckCircle2, X } from "lucide-react";
import VoucherViewModal from "../../components/shared/VoucherViewModal";
import toast from "react-hot-toast";

const AccountVouchersPage = () => {
  const [activeTab, setActiveTab] = useState("apply"); // apply, skip
  const [claimCode, setClaimCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const queryClient = useQueryClient();

  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ["my-vouchers"],
    queryFn: () => getMyVouchers(),
  });

  const vouchers = vouchersData?.data || [];

  const filtered = vouchers.filter(uv => {
    const v = uv.voucher;
    const now = new Date();
    const isExpired = v.validTo && new Date(v.validTo) < now;
    
    if (activeTab === "apply") {
      return !uv.isUsed && !isExpired;
    } else {
      return uv.isUsed || isExpired;
    }
  });

  const handleApplyVoucher = async () => {
    if (!claimCode.trim()) {
      toast.error("Vui lòng nhập mã khuyến mãi");
      return;
    }

    setIsApplying(true);
    try {
      const res = await saveVoucherByCode(claimCode.trim());
      toast.success(res.data?.message || "Áp dụng voucher thành công!");
      setClaimCode("");
      queryClient.invalidateQueries({ queryKey: ["my-vouchers"] });
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể áp dụng voucher này. Vui lòng kiểm tra lại.";
      toast.error(errMsg);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Nhập mã khuyến mãi"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  disabled={isApplying}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-5 pr-32 text-sm font-bold focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all disabled:opacity-75"
                />
                <button 
                  onClick={handleApplyVoucher}
                  disabled={isApplying}
                  className="absolute right-2 top-2 bottom-2 rounded-xl bg-orange-600 px-6 text-sm font-black text-white transition hover:bg-orange-700 active:scale-95 disabled:opacity-50"
                >
                  {isApplying ? "Đang áp dụng..." : "Sử dụng"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 border-b border-slate-100">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab("apply")}
                className={`relative pb-4 text-sm font-black transition-all ${activeTab === "apply" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                Áp dụng ({vouchers.filter(uv => !uv.isUsed && (!uv.voucher.validTo || new Date(uv.voucher.validTo) >= new Date())).length})
                {activeTab === "apply" && <div className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-orange-600" />}
              </button>
              <button 
                onClick={() => setActiveTab("skip")}
                className={`relative pb-4 text-sm font-black transition-all ${activeTab === "skip" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                Đặc biệt
                {activeTab === "skip" && <div className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-orange-600" />}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {isLoading ? (
               <div className="col-span-2 py-10 text-center text-slate-400 font-bold">Đang tải voucher...</div>
            ) : filtered.length > 0 ? (
              filtered.map((uv) => {
                const v = uv.voucher;
                const isExpired = v.validTo && new Date(v.validTo) < new Date();
                
                return (
                  <div 
                    key={uv.id}
                    onClick={() => setSelectedVoucher(v)}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${isExpired || uv.isUsed ? 'border-slate-200 grayscale opacity-80' : 'border-slate-100 hover:shadow-md'}`}
                  >
                    <div className={`p-5 ${activeTab === "apply" ? "bg-[#14b8a6]" : "bg-slate-200"} text-white`}>
                      <h3 className="text-xl font-black">
                        {v.discountType === "PERCENT" ? `Giảm ${v.discountValue}%` : `${v.discountValue.toLocaleString()} VND`}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium opacity-90 line-clamp-1">
                          Áp dụng cho: <span className="font-extrabold">{v.voucherType === "Service" ? "Dịch vụ" : v.voucherType === "Birthday" ? "Mừng sinh nhật" : "Đặt phòng"}</span> ({v.name})
                        </p>
                        <p className="text-xs font-medium opacity-90">
                          Hết hạn: {v.validTo ? new Date(v.validTo).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Vô thời hạn"}
                        </p>
                        <p className="text-xs font-medium opacity-90">
                          {v.minBookingValue ? `Đơn tối thiểu: ${v.minBookingValue.toLocaleString()} VND` : "Không cần đơn tối thiểu"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Dashed line effect */}
                    <div className="relative h-4 bg-white">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-dashed border-slate-100" />
                        </div>
                        <div className="absolute -left-2 top-0 size-4 rounded-full bg-slate-50 shadow-inner" />
                        <div className="absolute -right-2 top-0 size-4 rounded-full bg-slate-50 shadow-inner" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã voucher</p>
                        <p className="text-sm font-black text-slate-800">{v.code}</p>
                        <p className="mt-1 text-[10px] font-bold text-slate-400 line-clamp-1">{v.name}</p>
                      </div>
                      {isExpired && (
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Đã hết hạn</span>
                      )}
                      {!isExpired && uv.isUsed && (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Đã sử dụng</span>
                      )}
                      {!isExpired && !uv.isUsed && v.validTo && 
                        (new Date(v.validTo) - new Date()) <= 14 * 24 * 60 * 60 * 1000 && 
                        (!v.validFrom || new Date(v.validFrom) <= new Date()) && (
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Sắp hết hạn dùng</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-10 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <Ticket size={32} />
                </div>
                <p className="font-bold text-slate-400">Không có voucher nào trong danh sách này</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedVoucher && (
        <VoucherViewModal 
          voucher={selectedVoucher} 
          onClose={() => setSelectedVoucher(null)} 
        />
      )}
    </div>
  );
};

export default AccountVouchersPage;
