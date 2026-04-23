import React from "react";
import FavoriteFilter from "../../components/user/favorites/FavoriteFilter";
import FavoriteCard from "../../components/user/favorites/FavoriteCard";
import { Trash2 } from "lucide-react";

const UserFavoritesPage = () => {
  const favorites = [
    {
      name: "Grand Hyatt Bali",
      location: "Nusa Dua, Bali",
      rating: 4.9,
      price: 250,
      badge: "RECOMMENDED",
      image: "https://cdn.xanhsm.com/2025/03/09bd489f-khach-san-view-bien-vung-tau-18.jpg",
    },
    {
      name: "The Ritz-Carlton",
      location: "South Jakarta",
      rating: 4.8,
      price: 320,
      badge: "BEST VALUE",
      image: "https://www.kientrucapollo.vn/uploads/43/khach-san-nha-hang-1/2-9/khach-san-5-sao-o-vung-tau-1.jpg",
    },
    {
      name: "Alila Villas Uluwatu",
      location: "Uluwatu, Bali",
      rating: 5.0,
      price: 850,
      badge: null,
      image: "https://motogo.vn/wp-content/uploads/2020/02/khach-san-vung-tau-gia-re-1.jpeg",
    },
    {
      name: "Mandapa Reserve",
      location: "Ubud, Bali",
      rating: 4.9,
      price: 1200,
      badge: "RECOMMENDED",
      image: "https://cdn2.vietnambooking.com/wp-content/uploads/hotel_pro/hotel_302015/c0317bec30d5d7f66703c479781db57b.jpg",
    },
    // ... Thêm các mục khác từ thiết kế
  ];

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            My Favorites
          </h1>
          <p className="text-[13px] font-bold text-gray-400">
            You have <span className="text-[#0085FF]">12</span> saved
            accommodations
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-rose-500 text-[11px] font-black uppercase tracking-widest transition-colors">
          <Trash2 size={14} />
          Clear All
        </button>
      </div>

      <FavoriteFilter />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {favorites.map((hotel, idx) => (
          <FavoriteCard key={idx} hotel={hotel} />
        ))}
      </div>
    </div>
  );
};

export default UserFavoritesPage;
