import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicVouchers, saveVoucher, getMyVouchers } from "../../api/user/userVouchersApi";
import { BadgePercent, Ticket, Sparkles, Star, ArrowRight, ChevronDown, Clock } from "lucide-react";
import VoucherViewModal from "../../components/shared/VoucherViewModal";
import { toast } from "react-hot-toast";
import { getStoredAuth } from "../../utils/authStorage";
import { Link } from "react-router-dom";

const OffersPage = () => {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [savingVoucherId, setSavingVoucherId] = useState(null);
  const [sortBy, setSortBy] = useState("latest"); // latest, oldest, expiring

  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ["public-vouchers-page"],
    queryFn: () => getPublicVouchers(),
  });

  const { data: myVouchersData, refetch: refetchMyVouchers } = useQuery({
    queryKey: ["my-vouchers-page"],
    queryFn: () => getMyVouchers(),
    enabled: !!getStoredAuth()?.token,
  });

  const handleSaveVoucher = async (e, voucherId) => {
    e.stopPropagation();
    if (isVoucherSaved(voucherId)) return;
    
    setSavingVoucherId(voucherId);
    try {
      await saveVoucher(voucherId);
      toast.success("Đã lưu voucher vào ví của bạn!");
      refetchMyVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu voucher. Vui lòng đăng nhập.");
    } finally {
      setSavingVoucherId(null);
    }
  };

  const isVoucherSaved = (voucherId) => {
    return myVouchersData?.data?.some(uv => uv.voucherId === voucherId);
  };

  const sortedVouchers = useMemo(() => {
    if (!vouchersData?.data) return [];
    let list = [...vouchersData.data];
    
    if (sortBy === "latest") {
      list.sort((a, b) => b.id - a.id);
    } else if (sortBy === "oldest") {
      list.sort((a, b) => a.id - b.id);
    } else if (sortBy === "expiring") {
      list.sort((a, b) => {
        const dateA = a.validTo ? new Date(a.validTo) : new Date(8640000000000000);
        const dateB = b.validTo ? new Date(b.validTo) : new Date(8640000000000000);
        return dateA - dateB;
      });
    }
    
    return list;
  }, [vouchersData, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-orange-100 selection:text-orange-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-slate-900 pt-48 pb-40">
        <div className="absolute top-0 left-0 h-full w-full opacity-20">
            <div className="absolute top-[-10%] left-[-5%] size-96 rounded-full bg-orange-500 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] size-96 rounded-full bg-blue-500 blur-[120px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
              Kho Ưu Đãi <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Đặc Quyền</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl font-medium leading-relaxed text-slate-400">
              Nâng tầm trải nghiệm kỳ nghỉ của bạn với những đặc quyền chỉ dành riêng cho bạn. 
              Săn ngay mã giảm giá và tích lũy phần thưởng mỗi ngày.
            </p>
          </div>
        </div>
      </div>

      <div className="relative -mt-20 mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        {/* Statistics Bar */}
        <div className="mb-20 grid grid-cols-2 gap-4 rounded-[2.5rem] bg-white p-4 shadow-2xl shadow-slate-200/50 md:grid-cols-4">
            {[
                { label: "Voucher khả dụng", value: vouchersData?.data?.length || 0, icon: Ticket, color: "text-blue-600 bg-blue-50" },
                { label: "Khách hàng tin dùng", value: "10k+", icon: Star, color: "text-orange-600 bg-orange-50" },
                { label: "Mã mới mỗi tuần", value: "5+", icon: BadgePercent, color: "text-green-600 bg-green-50" },
                { label: "Hỗ trợ 24/7", value: "Active", icon: Sparkles, color: "text-purple-600 bg-purple-50" },
            ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-8 text-center border-r last:border-0 border-slate-50">
                    <div className={`mb-4 flex size-14 items-center justify-center rounded-2xl ${stat.color}`}>
                        <stat.icon size={26} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                </div>
            ))}
        </div>

        {/* Section Title & Sort */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-8">
            <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Danh sách mã giảm giá</h2>
                <p className="mt-2 text-base font-bold text-slate-400">Ưu đãi mới nhất được cập nhật liên tục</p>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-400">Sắp xếp theo:</span>
                <div className="group relative">
                    <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-orange-200 hover:text-orange-600 transition-all">
                        {sortBy === "latest" ? "Mới nhất" : sortBy === "oldest" ? "Cũ nhất" : "Sắp hết hạn"}
                        <ChevronDown size={16} />
                    </button>
                    <div className="invisible absolute right-0 top-full z-10 mt-2 w-48 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                        <button onClick={() => setSortBy("latest")} className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors ${sortBy === "latest" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>Mới nhất</button>
                        <button onClick={() => setSortBy("oldest")} className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors ${sortBy === "oldest" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>Cũ nhất</button>
                        <button onClick={() => setSortBy("expiring")} className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors ${sortBy === "expiring" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>Sắp hết hạn</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Vouchers Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="h-44 animate-pulse rounded-3xl bg-slate-100" />
             ))}
          </div>
        ) : sortedVouchers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {sortedVouchers.map((voucher) => {
              const isExpired = voucher.validTo && new Date(voucher.validTo) < new Date();
              const saved = isVoucherSaved(voucher.id);
              const themeColor = voucher.id % 2 === 0 ? "blue" : "orange";

              return (
                <div 
                  key={voucher.id}
                  onClick={() => !isExpired && setSelectedVoucher(voucher)}
                  className={`group relative flex h-44 overflow-hidden rounded-[1.5rem] border transition-all duration-300 ${
                    isExpired 
                      ? 'border-slate-200 bg-slate-50/50 grayscale' 
                      : themeColor === "orange" 
                        ? 'border-orange-200 bg-white hover:border-orange-400 hover:shadow-lg' 
                        : 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-lg'
                  }`}
                >
                  {/* Left part: Content */}
                  <div className="relative flex flex-1 flex-col p-6">
                    <div className="mb-3">
                         <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                           isExpired ? 'bg-slate-200 text-slate-500' : themeColor === "orange" ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                         }`}>
                           {voucher.discountType === "PERCENT" ? "Ưu đãi đặc biệt" : "Giảm giá trực tiếp"}
                         </span>
                    </div>
                    
                    <h3 className={`text-lg font-black leading-snug line-clamp-2 ${isExpired ? 'text-slate-400' : 'text-slate-900'}`}>
                      {voucher.name}
                    </h3>
                    
                    <div className="mt-auto flex items-center gap-2">
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Mã ưu đãi:</span>
                         <span className={`text-[11px] font-black tracking-widest ${isExpired ? 'text-slate-400' : 'text-slate-700'}`}>{voucher.code}</span>
                    </div>
                  </div>
                  
                  {/* Divider with Notches */}
                  <div className="relative flex flex-col items-center justify-between py-1">
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 size-5 rounded-full border shadow-inner z-10 ${
                        isExpired ? 'border-slate-200 bg-slate-100' : 'border-orange-200 bg-[#f8fafc]'
                      }`} />
                      <div className="h-full w-px border-l border-dashed border-slate-300" />
                      <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 size-5 rounded-full border shadow-inner z-10 ${
                        isExpired ? 'border-slate-200 bg-slate-100' : 'border-orange-200 bg-[#f8fafc]'
                      }`} />
                  </div>

                  {/* Right part: Action */}
                  <div className={`flex w-40 flex-col items-center justify-center p-6 text-center text-white ${
                    isExpired ? 'bg-slate-400' : 'bg-orange-500'
                  }`}>
                    <div className="mb-4">
                      <p className="text-2xl font-black">
                        Giảm {voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : `${(voucher.discountValue / 1000)}k`}
                      </p>
                      <p className="text-[10px] font-bold mt-1 opacity-90">
                        Đơn tối thiểu: {voucher.minBookingValue ? `${voucher.minBookingValue.toLocaleString()} VND` : "0 VND"}
                      </p>
                    </div>
                    
                    {!isExpired ? (
                      <button 
                        onClick={(e) => handleSaveVoucher(e, voucher.id)}
                        disabled={saved || savingVoucherId === voucher.id}
                        className={`w-full rounded-full py-2 text-xs font-black shadow-lg transition-all active:scale-95 ${
                          saved 
                            ? 'bg-orange-400/50 text-white/80 cursor-default shadow-none' 
                            : 'bg-white text-orange-600 hover:bg-orange-50'
                        }`}
                      >
                        {saved ? "Đã lưu" : "Lưu mã"}
                      </button>
                    ) : (
                      <div className="w-full rounded-full bg-white/20 py-2 text-center text-[10px] font-black text-white/50 uppercase tracking-widest">
                        Hết hạn
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="relative mb-10">
                  <div className="absolute inset-0 animate-ping rounded-full bg-orange-100 opacity-20" />
                  <div className="relative flex size-24 items-center justify-center rounded-full bg-white text-slate-300 shadow-xl border border-slate-50">
                      <Ticket size={40} />
                  </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Hiện chưa có ưu đãi mới</h3>
              <p className="mt-3 max-w-md font-medium text-slate-500">Chúng tôi đang chuẩn bị những chương trình hấp dẫn nhất. Vui lòng quay lại sau nhé!</p>
              <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm font-black text-orange-600 hover:gap-3 transition-all">
                  Quay lại trang chủ <ArrowRight size={18} />
              </Link>
          </div>
        )}
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

export default OffersPage;
