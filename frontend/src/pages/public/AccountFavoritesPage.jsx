import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, DoorClosed, BedDouble, Users, MapPin, Star, ArrowRight } from "lucide-react";
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
    const result = toggleFavoriteRoomType({ roomTypeId });
    setFavorites(result.favorites);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">User / Danh sách yêu thích</p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Phòng đã lưu</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Bạn đang có {favorites.length} phòng trong danh sách yêu thích. Nơi lưu giữ những căn phòng tuyệt vời nhất.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] bg-slate-50 py-20 text-center border border-dashed border-slate-200">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
              <Heart className="size-8 text-rose-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Chưa có phòng nào được lưu</h3>
            <p className="mt-3 max-w-md text-sm font-medium text-slate-500">
              Hãy dạo quanh các khách sạn của chúng tôi và nhấn vào biểu tượng trái tim để lưu lại những căn phòng bạn ưng ý nhé.
            </p>
            <Link
              to="/booking"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Khám phá ngay <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((room) => (
              <div 
                key={room.roomTypeId} 
                className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/50"
              >
                {/* Image & Favorite Button */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={room.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                    alt={room.roomTypeName}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(room.roomTypeId);
                    }}
                    className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110"
                  >
                    <Heart className="size-5 text-rose-500" fill="currentColor" />
                  </button>

                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] font-black shadow-sm backdrop-blur">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-slate-900">Tuyệt vời</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4">
                    <h3 className="line-clamp-1 text-xl font-black text-slate-900 transition-colors group-hover:text-[#0194f3]">
                      {room.roomTypeName || "Phòng nghỉ cao cấp"}
                    </h3>
                    <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-slate-500">
                      <MapPin size={14} className="text-[#0194f3]" />
                      <span>Trung tâm & thuận tiện di chuyển</span>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-y-3 gap-x-2 text-[13px] font-bold text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-400" />
                      <span className="truncate">{room.capacityAdults} Người lớn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble size={16} className="text-slate-400" />
                      <span className="truncate">{room.bedType || "1 Giường đôi"}</span>
                    </div>
                    {room.size && (
                      <div className="flex items-center gap-2">
                        <DoorClosed size={16} className="text-slate-400" />
                        <span>{room.size} m²</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Giá phòng / đêm</p>
                      <p className="mt-1 text-2xl font-black text-[#0194f3]">{formatCurrency(room.basePrice)}</p>
                    </div>
                    <Link
                      to={`/room-types/${room.roomTypeId}`}
                      className="inline-flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md transition-all hover:bg-[#0194f3] hover:-translate-y-1"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountFavoritesPage;
