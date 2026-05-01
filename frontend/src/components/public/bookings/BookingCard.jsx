import React, { useMemo, useState } from "react";
import { CircleHelp, DoorClosed, Users } from "lucide-react";
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
  const [showPriceDetail, setShowPriceDetail] = useState(false);

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
    <article className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <div className="overflow-hidden rounded-xl bg-slate-100">
          <img src={imageUrl} alt={roomType.roomTypeName} className="h-full min-h-[208px] w-full object-cover" />
        </div>


        <div className="flex min-w-0 flex-col justify-between border-slate-200 lg:border-r lg:pr-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {roomType.roomTypeName || "Loại phòng"}
            </h3>

            <div className="mt-1.5 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`size-3.5 ${
                    i < Math.round(Number(roomType.rating || 0)) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              <span className="ml-1.5 text-xs font-bold text-amber-600">
                {roomType.rating && Number(roomType.rating) > 0 ? Number(roomType.rating).toFixed(1) : "0.0"}
              </span>
              <span className="text-xs font-medium text-slate-400">
                ({roomType.reviewCount || 0} đánh giá)
              </span>
            </div>



            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-slate-400" />
                {capacityText}
              </span>
              <span className="flex items-center gap-1.5">
                <DoorClosed size={16} className="text-slate-400" />
                {roomType.bedType || "Chưa cập nhật loại giường"}
              </span>
            </div>

            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
              {roomType.size ? `Diện tích ${roomType.size} m2` : "Xem chi tiết để chọn ngày và phòng phù hợp."}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <NavLink
              to={`/room-types/${roomType.roomTypeId}`}
              state={detailLinkState}
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Chi tiết
            </NavLink>
          </div>
        </div>

        <div className="relative flex flex-col justify-between pt-2">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-500">
              <span>Giá theo:</span>
              <button
                type="button"
                onClick={() => setShowPriceDetail((current) => !current)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
              >
                Tổng giá tiền
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <p className="whitespace-nowrap text-3xl font-black tracking-tight text-slate-900">
                {formatCurrency(totalPrice)}
              </p>
              <button
                type="button"
                onClick={() => setShowPriceDetail((current) => !current)}
                className="text-slate-400 transition hover:text-blue-600"
                aria-label="Xem chi tiết giá"
              >
                <CircleHelp size={18} />
              </button>
            </div>
          </div>

          {showPriceDetail ? (
            <div className="absolute right-0 top-28 z-10 w-72 rounded-[24px] border border-blue-200 bg-white p-5 shadow-[0_18px_40px_rgba(37,99,235,0.15)]">
              <h4 className="text-sm font-bold text-slate-900">Chi tiết giá</h4>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {priceBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                  <span>Tổng giá tiền:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 text-right">
            <p className="text-lg font-semibold text-rose-500">
              Còn {availableCount} phòng trống
            </p>
            <NavLink
              to={`/room-types/${roomType.roomTypeId}`}
              state={detailLinkState}
              className="mt-4 inline-flex h-12 min-w-[132px] items-center justify-center rounded-xl border border-blue-500 px-6 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
            >
              Chọn
            </NavLink>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BookingCard;
