import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, DoorClosed, BedDouble, Users, MapPin, Star, ArrowRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getFavoriteRoomTypes, toggleFavoriteRoomType } from "../../utils/userFavorites";
import { toast } from "react-hot-toast";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const AccountFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate slight loading for smoother entrance
    const timer = setTimeout(() => {
      setFavorites(getFavoriteRoomTypes());
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = (roomTypeId) => {
    const result = toggleFavoriteRoomType({ roomTypeId });
    setFavorites(result.favorites);
    toast.error("Đã xóa khỏi danh sách yêu thích");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]/50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600/60"
          >
            <Heart size={14} className="fill-current" />
            <span>Danh mục yêu thích</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                Phòng đã lưu
              </h1>
              <p className="mt-3 text-lg font-medium text-slate-500">
                Lưu giữ những không gian nghỉ dưỡng tuyệt vời nhất cho chuyến đi của bạn.
              </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-100">
              <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-600">
                {favorites.length} phòng được lưu
              </span>
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {favorites.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center rounded-[3rem] bg-white py-24 text-center shadow-xl shadow-slate-200/50 ring-1 ring-slate-100"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping rounded-full bg-rose-100 opacity-20" />
                <div className="relative flex size-24 items-center justify-center rounded-full bg-rose-50 border-2 border-rose-100">
                  <Heart className="size-10 text-rose-400" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Danh sách trống</h3>
              <p className="mt-4 max-w-sm text-[15px] font-medium leading-relaxed text-slate-500">
                Có vẻ như bạn chưa tìm thấy căn phòng ưng ý? Hãy để chúng tôi gợi ý cho bạn những không gian sang trọng nhất.
              </p>
              <Link
                to="/booking"
                className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-1"
              >
                Khám phá ngay <ArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {favorites.map((room) => (
                <motion.div 
                  key={room.roomTypeId}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  layout
                  className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-200/50 ring-1 ring-slate-100"
                >
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={room.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                      alt={room.roomTypeName}
                      className="size-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    {/* Floating Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-400" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">Tọa lạc tại vị trí đắc địa</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(room.roomTypeId);
                      }}
                      className="absolute right-5 top-5 z-10 flex size-12 items-center justify-center rounded-2xl bg-white/90 text-rose-500 shadow-xl backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white group/btn"
                      title="Xóa khỏi danh sách"
                    >
                      <Trash2 className="size-5 transition-transform group-hover/btn:scale-110" />
                    </button>

                    <div className="absolute left-5 top-5 z-10">
                      <div className="inline-flex items-center gap-1.5 rounded-2xl bg-white/95 px-4 py-2 text-[12px] font-black shadow-lg backdrop-blur">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-slate-900">{room.rating || 4.8}</span>
                        <span className="text-slate-400 font-bold ml-1">Excellent</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-1 flex-col p-8">
                    <div className="mb-6">
                      <h3 className="line-clamp-1 text-2xl font-black text-slate-900 transition-colors group-hover:text-blue-600">
                        {room.roomTypeName}
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-[12px] font-bold text-slate-600">
                          <Users size={14} className="text-slate-400" />
                          {room.capacityAdults} người
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-[12px] font-bold text-slate-600">
                          <BedDouble size={14} className="text-slate-400" />
                          {room.bedType || "1 giường đôi"}
                        </div>
                        {room.size && (
                          <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-[12px] font-bold text-slate-600">
                            <DoorClosed size={14} className="text-slate-400" />
                            {room.size} m²
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Giá từ</p>
                        <p className="mt-1 text-2xl font-black text-blue-600">{formatCurrency(room.basePrice)}</p>
                      </div>
                      <Link
                        to={`/room-types/${room.roomTypeId}`}
                        className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-900 text-white shadow-xl transition-all hover:bg-blue-600 hover:shadow-blue-200 hover:-translate-x-1"
                      >
                        <ArrowRight size={24} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AccountFavoritesPage;

