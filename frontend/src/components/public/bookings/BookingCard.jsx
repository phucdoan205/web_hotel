import React, { useMemo, useState } from "react";
import { CircleHelp, Clock, DoorClosed, Flame, Heart, Monitor, Square, Star, Users, Wifi, Wind, Check } from "lucide-react";
import { NavLink } from "react-router-dom";

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const BookingCard = ({ roomType, availableCount = 0, numberOfNights, detailLinkState }) => {

  const totalPrice = useMemo(
    () => (roomType.basePrice || 0) * Math.max(1, numberOfNights),
    [numberOfNights, roomType.basePrice],
  );

  const priceBreakdown = useMemo(
    () =>
      Array.from({ length: Math.max(1, numberOfNights) }, (_, index) => ({
        label: `Đêm ${index + 1}`,
        price: roomType.basePrice || 0,
      })),
    [numberOfNights, roomType.basePrice],
  );

  const imageUrl = roomType.imageUrls?.[0] || fallbackImage;
  const capacityText = `${roomType.capacityAdults || 0} người lớn, ${roomType.capacityChildren || 0} trẻ em`;

  return (
    <article className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr_220px]">
        
        {/* Left: Images */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
            <img 
              src={imageUrl} 
              alt={roomType.roomTypeName} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <img src={roomType.imageUrls?.[1] || imageUrl} className="h-full w-full object-cover" alt="" />
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <img src={roomType.imageUrls?.[2] || imageUrl} className="h-full w-full object-cover" alt="" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <img src={roomType.imageUrls?.[3] || imageUrl} className="h-full w-full object-cover" alt="" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white">
                +12
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Details */}
        <div className="flex min-w-0 flex-col py-1 lg:border-r lg:border-slate-100 lg:pr-6">
          <h3 className="text-xl font-bold text-slate-900">
            {roomType.roomTypeName || "Loại phòng"}
          </h3>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700">
              <Star size={12} fill="currentColor" /> {roomType.rating && Number(roomType.rating) > 0 ? Number(roomType.rating).toFixed(1) : "5.0"}
            </div>
            <div className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
              {roomType.reviewCount || 16} đánh giá
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-slate-400" />
              {capacityText}
            </span>
            <span className="flex items-center gap-1.5">
              <Square size={16} className="text-slate-400" />
              {roomType.size ? `${roomType.size} m²` : "20 m²"}
            </span>
            <span className="flex items-center gap-1.5">
              <DoorClosed size={16} className="text-slate-400" />
              {roomType.bedType || "1 giường đơn"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-slate-600">
            {roomType.amenities?.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <Check size={14} className="text-slate-500" /> {amenity}
              </span>
            ))}
            {(!roomType.amenities || roomType.amenities.length === 0) && (
              <>
                <span className="flex items-center gap-1.5">
                  <Wifi size={14} className="text-slate-500" /> Wifi miễn phí
                </span>
                <span className="flex items-center gap-1.5">
                  <Wind size={14} className="text-slate-500" /> Máy lạnh
                </span>
              </>
            )}
          </div>

          <p className="mt-4 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
            {roomType.size ? `Phòng rộng ${roomType.size}m², được thiết kế hiện đại với đầy đủ tiện nghi, mang lại không gian thoải mái cho kỳ nghỉ của bạn.` : "Phòng rộng 20m², được thiết kế hiện đại với đầy đủ tiện nghi, mang lại không gian thoải mái cho kỳ nghỉ của bạn."}
          </p>

          <NavLink
            to={`/room-types/${roomType.roomTypeId}`}
            state={detailLinkState}
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
          >
            Xem chi tiết phòng →
          </NavLink>
        </div>

        {/* Right: Price & Actions */}
        <div className="relative flex flex-col justify-between py-1 lg:pl-2">
          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-500">Giá / đêm từ</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-[#0052cc]">
              {formatCurrency(roomType.basePrice || 0)}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-stretch gap-2">
            <p className="text-right text-[11px] font-bold text-emerald-600 mb-1">
              Còn {availableCount} phòng trống!
            </p>
            <NavLink
              to={`/room-types/${roomType.roomTypeId}`}
              state={detailLinkState}
              className="flex h-[38px] w-full items-center justify-center rounded-lg bg-[#0052cc] px-4 text-sm font-bold text-white transition-colors hover:bg-[#004099]"
            >
              Chọn phòng →
            </NavLink>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BookingCard;
