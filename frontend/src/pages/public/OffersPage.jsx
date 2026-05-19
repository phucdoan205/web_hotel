import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicVouchers, saveVoucher, getMyVouchers } from "../../api/user/userVouchersApi";
import { BadgePercent, Ticket, Star, ArrowRight, ChevronDown, Gift, PhoneCall } from "lucide-react";
import VoucherViewModal from "../../components/shared/VoucherViewModal";
import { toast } from "react-hot-toast";
import { getStoredAuth } from "../../utils/authStorage";
import { Link } from "react-router-dom";

const OffersPage = () => {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [savingVoucherId, setSavingVoucherId] = useState(null);
  const [sortBy, setSortBy] = useState("latest");

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

  // Helper function to pick premium tags for coupons based on metadata
  const getVoucherTag = (voucher) => {
    if (voucher.discountType === "PERCENT") {
      if (voucher.discountValue >= 30) {
        return { label: "ƯU ĐÃI ĐẶC BIỆT", color: "bg-orange-50 text-orange-600" };
      }
      return { label: "THÀNH VIÊN VIP", color: "bg-purple-50 text-purple-600" };
    } else {
      if (voucher.discountValue >= 300000) {
        return { label: "FLASH DEAL", color: "bg-blue-50 text-blue-600" };
      }
      return { label: "SIÊU KHUYẾN MÃI", color: "bg-emerald-50 text-emerald-600" };
    }
  };

  // Helper to generate dynamic premium description if empty
  const getVoucherDesc = (voucher) => {
    if (voucher.description) return voucher.description;
    if (voucher.discountType === "PERCENT") {
      return `Giảm giá phòng khách sạn cao cấp cho mùa hè. Áp dụng toàn hệ thống khách sạn HPT.`;
    }
    return `Mã giảm giá trực tiếp trị giá ${(voucher.discountValue / 1000).toFixed(0)}K cho các hóa đơn đặt phòng và dịch vụ.`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium Hero Section with Background image & Gradients */}
      <div className="relative overflow-hidden bg-[#0A192F] pt-48 pb-40">
        <div className="absolute top-0 left-0 h-full w-full opacity-25">
          <div className="absolute top-[-20%] left-[-10%] size-[500px] rounded-full bg-blue-500 blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[10%] size-[400px] rounded-full bg-orange-500 blur-[120px]" />
        </div>

        {/* Bedroom background preview on the right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-4/5 hidden lg:block opacity-90 pr-10">
          <img
            src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
            alt="HPT Luxury Suite Room"
            className="w-full h-full object-cover rounded-l-[3rem] shadow-2xl border-l border-y border-white/10"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-xl text-left">
            <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl leading-tight">
              Kho Ưu Đãi <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Đặc Quyền</span>
            </h1>
            <p className="mt-6 text-base font-medium leading-relaxed text-slate-300">
              Nâng tầm trải nghiệm kỳ nghỉ của bạn với những đặc quyền chỉ dành riêng cho bạn. Săn ngay mã giảm giá và tích lũy phần thưởng mỗi ngày.
            </p>
          </div>
        </div>
      </div>

      <div className="relative -mt-20 mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        {/* White Floating Statistics Bar */}
        <div className="mb-20 grid grid-cols-2 gap-4 rounded-[2.5rem] bg-white p-6 shadow-2xl shadow-slate-200/50 md:grid-cols-4 border border-slate-100">
          {[
            { label: "Voucher khả dụng", value: vouchersData?.data?.length || 0, icon: Ticket, color: "text-blue-600 bg-blue-50" },
            { label: "Khách hàng tin dùng", value: "10K+", icon: Star, color: "text-orange-600 bg-orange-50" },
            { label: "Ưu đãi mới mỗi tuần", value: "35+", icon: Gift, color: "text-emerald-600 bg-emerald-50" },
            { label: "Hỗ trợ liên tục", value: "24/7", icon: PhoneCall, color: "text-[#7C3AED] bg-purple-50" },
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center gap-4 px-6 py-4 border-r last:border-0 border-slate-100">
              <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${stat.color} shadow-inner`}>
                <stat.icon size={24} className="stroke-[2.2]" />
              </div>
              <div className="flex flex-col text-left">
                <p className="text-2xl font-black text-slate-900 leading-tight">{stat.value}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header Title with Dropdown Sort */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Danh sách mã giảm giá</h2>
            <p className="mt-1 text-sm font-bold text-slate-400">Ưu đãi mới nhất được cập nhật liên tục</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm">
                <span>{sortBy === "latest" ? "Mới nhất" : sortBy === "oldest" ? "Cũ nhất" : "Sắp hết hạn"}</span>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-orange-500" />
              </button>
              <div className="invisible absolute right-0 top-full z-10 mt-2 w-40 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <button onClick={() => setSortBy("latest")} className={`w-full rounded-xl px-4 py-2 text-left text-xs font-black transition-colors ${sortBy === "latest" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>Mới nhất</button>
                <button onClick={() => setSortBy("oldest")} className={`w-full rounded-xl px-4 py-2 text-left text-xs font-black transition-colors ${sortBy === "oldest" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>Cũ nhất</button>
                <button onClick={() => setSortBy("expiring")} className={`w-full rounded-xl px-4 py-2 text-left text-xs font-black transition-colors ${sortBy === "expiring" ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"}`}>Sắp hết hạn</button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Physical Notched Voucher Ticket Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-100 border border-slate-200" />
            ))}
          </div>
        ) : sortedVouchers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {sortedVouchers.map((voucher) => {
              const isExpired = voucher.validTo && new Date(voucher.validTo).setHours(23, 59, 59, 999) < new Date();
              const saved = isVoucherSaved(voucher.id);
              const tagInfo = getVoucherTag(voucher);
              const descriptionText = getVoucherDesc(voucher);

              return (
                <div
                  key={voucher.id}
                  onClick={() => !isExpired && setSelectedVoucher(voucher)}
                  className={`group relative flex h-48 overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 ${isExpired
                      ? 'border-slate-200 grayscale opacity-60'
                      : 'border-slate-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                >
                  {/* Left Column: Voucher Main info */}
                  <div className="relative flex flex-1 flex-col p-6 text-left cursor-pointer">
                    <div className="mb-2">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tagInfo.color}`}>
                        {tagInfo.label}
                      </span>
                    </div>

                    <h3 className={`text-base font-black leading-snug line-clamp-1 ${isExpired ? 'text-slate-400' : 'text-slate-900 group-hover:text-orange-600 transition-colors'}`}>
                      {voucher.name}
                    </h3>
                    
                    <p className="text-xs font-bold text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {descriptionText}
                    </p>

                    <div className="mt-auto flex items-center gap-1">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Mã ưu đãi:</span>
                      <span className={`text-[11px] font-black tracking-widest text-[#1F649C] uppercase`}>{voucher.code}</span>
                    </div>
                  </div>

                  {/* Notch Tear-Off Divider */}
                  <div className="relative flex flex-col items-center justify-between py-2">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 size-8 rounded-full bg-[#f8fafc] border-b border-slate-200 z-10 shadow-inner" />
                    <div className="h-full w-px border-l border-dashed border-slate-200" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 size-8 rounded-full bg-[#f8fafc] border-t border-slate-200 z-10 shadow-inner" />
                  </div>

                  {/* Right Column: Tear-Off Orange Ticket Value & Action Button */}
                  <div className={`flex w-44 shrink-0 flex-col items-center justify-center p-6 text-center text-white relative ${isExpired ? 'bg-slate-400' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                    }`}>
                    <div className="mb-3">
                      <p className="text-3xl font-black tracking-tight leading-none">
                        {voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : `${(voucher.discountValue / 1000).toFixed(0)}K`}
                      </p>
                      <p className="text-[10px] font-bold mt-2 opacity-90 leading-tight">
                        {voucher.minBookingValue ? `Đơn tối thiểu: ${(voucher.minBookingValue / 1000).toFixed(0)}K` : "Mọi đơn hàng"}
                      </p>
                    </div>

                    {!isExpired ? (
                      <button
                        onClick={(e) => handleSaveVoucher(e, voucher.id)}
                        disabled={saved || savingVoucherId === voucher.id}
                        className={`w-full rounded-full py-2 text-xs font-black shadow-lg transition-all active:scale-95 ${saved
                            ? 'bg-transparent border border-white hover:bg-white/10 text-white'
                            : 'bg-white text-orange-600 hover:bg-orange-50'
                          }`}
                      >
                        {saved ? "Sử dụng" : "Lưu ngay"}
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
