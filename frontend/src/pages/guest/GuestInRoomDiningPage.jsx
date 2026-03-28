import React from "react";
import DeliveryStatus from "../../components/guest/dining/DeliveryStatus";
import DiningFilter from "../../components/guest/dining/DiningFilter";
import FoodCard from "../../components/guest/dining/FoodCard";
import DiningCart from "../../components/guest/dining/DiningCart";
import SpecialInstructions from "../../components/guest/dining/SpecialInstructions";
import { Search, ShoppingCart } from "lucide-react";

const GuestInRoomDiningPage = () => {
  const menuItems = [
    {
      id: 1,
      name: "Continental Breakfast",
      price: 18.0,
      rating: 4.8,
      desc: "Freshly baked pastries, seasonal fruits, organic...",
      img: "https://cdnv2.tgdd.vn/mwg-static/common/Common/banhmi887.jpg",
    },
    {
      id: 2,
      name: "Salmon Power Bowl",
      price: 24.0,
      rating: 4.9,
      desc: "Grilled Atlantic salmon, quinoa, avocado, roasted...",
      img: "https://static.vinwonders.com/production/mi-cay-quy-nhon-1.jpg",
    },
    {
      id: 3,
      name: "Artisan Margherita",
      price: 21.0,
      rating: 4.7,
      desc: "San Marzano tomatoes, fresh mozzarella, extra virgin...",
      img: "https://file.hstatic.net/1000394081/article/com-tam_e03b4325c9914def9d66619930a73432.jpg",
    },
    // Thêm các món khác tương tự ảnh thiết kế
  ];

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <nav className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Home / <span className="text-gray-900">In-room Dining</span>
          </nav>
          <h1 className="text-2xl font-black text-gray-900">In-room Dining</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search for dishes, drinks, or desserts..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 text-[11px] font-bold focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
            />
          </div>
          <div className="relative p-3 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer">
            <ShoppingCart size={20} className="text-gray-900" />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              2
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT: Menu Selection (8/12) */}
        <div className="col-span-8 space-y-8">
          <DeliveryStatus />
          <DiningFilter />

          <div className="grid grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* RIGHT: Cart & Instructions (4/12) */}
        <div className="col-span-4 space-y-6">
          <DiningCart />
          <SpecialInstructions />
        </div>
      </div>
    </div>
  );
};

export default GuestInRoomDiningPage;
