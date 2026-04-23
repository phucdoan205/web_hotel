import React from "react";
import { DoorClosed, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const FavoriteCard = ({ favorite, onRemove }) => (
  <div className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
    <div className="relative h-56 overflow-hidden">
      <img
        src={favorite.imageUrl || "https://placehold.co/800x480/e2e8f0/64748b?text=Room"}
        alt={favorite.roomTypeName}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
        aria-label="Bỏ khỏi yêu thích"
      >
        <Heart size={18} fill="currentColor" />
      </button>
    </div>

    <div className="p-6">
      <h4 className="text-lg font-black text-gray-900">{favorite.roomTypeName}</h4>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Users size={15} />
          {favorite.capacityAdults || 0} người lớn, {favorite.capacityChildren || 0} trẻ em
        </span>
        <span className="inline-flex items-center gap-1.5">
          <DoorClosed size={15} />
          {favorite.bedType || "Chưa cập nhật"}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {favorite.size ? `Diện tích ${favorite.size} m2` : "Xem chi tiết loại phòng để biết thêm thông tin."}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-lg font-black text-[#0085FF]">{formatCurrency(favorite.basePrice)}</p>
        <Link
          to={`/user/room-types/${favorite.roomTypeId}`}
          state={{ roomType: favorite }}
          className="rounded-xl bg-blue-50 px-5 py-2.5 text-[11px] font-black text-[#0085FF] transition-all hover:bg-[#0085FF] hover:text-white"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  </div>
);

export default FavoriteCard;
