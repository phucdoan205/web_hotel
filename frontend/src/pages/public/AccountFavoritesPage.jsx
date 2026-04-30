import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, DoorClosed, Star, BedDouble, Users, ArrowRight } from "lucide-react";
import { getFavoriteRoomTypes, toggleFavoriteRoomType } from "../../utils/userFavorites";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const AccountFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavoriteRoomTypes());
  }, []);

  const handleRemove = (roomTypeId) => {
    // toggle will remove it if it exists
    const result = toggleFavoriteRoomType({ roomTypeId });
    setFavorites(result.favorites);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-[#01539d] pt-12 pb-[14rem] text-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 shadow-inner">
              <Heart className="h-10 w-10 text-[#ffb700]" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Phòng yêu thích của bạn</h1>
              <p className="mt-2 text-lg font-medium text-white/80">
                Lưu lại những lựa chọn ưng ý nhất để đặt phòng nhanh chóng trong tương lai.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-[11rem] max-w-5xl px-5 lg:px-8 relative z-10">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl md:p-10">
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black text-slate-950">Danh sách đã lưu</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Bạn đang có {favorites.length} phòng trong danh sách yêu thích.
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#0194f3] mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Danh sách trống</h3>
              <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
                Hãy khám phá các khách sạn và nhấn vào biểu tượng trái tim để lưu lại những lựa chọn mà bạn yêu thích.
              </p>
              <Link
                to="/booking"
                className="mt-6 rounded-full bg-[#0194f3] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#017bc0]"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {favorites.map((room) => (
                <div key={room.roomTypeId} className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#0194f3] hover:shadow-lg sm:flex-row sm:items-center">
                  <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-48">
                    <img
                      src={room.imageUrl || "https://placehold.co/400x300/e2e8f0/64748b?text=Room"}
                      alt={room.roomTypeName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <button
                      onClick={() => handleRemove(room.roomTypeId)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm backdrop-blur transition hover:bg-red-50"
                    >
                      <Heart className="h-4 w-4" fill="currentColor" />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <h3 className="text-lg font-bold text-slate-900">{room.roomTypeName || "Phòng nghỉ"}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><Users size={16} /> {room.capacityAdults} người lớn</span>
                      <span className="flex items-center gap-1.5"><BedDouble size={16} /> {room.bedType || "1 giường đôi"}</span>
                      {room.size && <span className="flex items-center gap-1.5"><DoorClosed size={16} /> {room.size} m²</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center sm:border-l sm:border-slate-100 sm:pl-6">
                    <div className="text-sm font-semibold text-slate-500 mb-1">Giá từ</div>
                    <div className="text-xl font-black text-slate-900">{formatCurrency(room.basePrice)}</div>
                    <Link
                      to={`/room-types/${room.roomTypeId}`}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-[#0194f3] transition hover:bg-[#0194f3] hover:text-white sm:w-auto"
                    >
                      Xem chi tiết <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountFavoritesPage;
