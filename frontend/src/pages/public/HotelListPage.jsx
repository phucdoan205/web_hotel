import React from "react";
import SearchSummary from "../../components/hotels/SearchSummary";
import FilterSidebar from "../../components/hotels/FilterSidebar";
import HotelCard from "../../components/hotels/HotelCard";

const dummyHotels = [
  {
    id: 1,
    name: "InterContinental Danang Sun Peninsula Resort",
    stars: 5,
    location: "Bán đảo Sơn Trà, Đà Nẵng",
    rating: 9.2,
    reviewStatus: "Tuyệt vời",
    reviewCount: "2.450",
    price: 8420000,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  },
  {
    id: 2,
    name: "Novotel Danang Premier Han River",
    stars: 5,
    location: "Hải Châu, Đà Nẵng",
    rating: 8.8,
    reviewStatus: "Rất tốt",
    reviewCount: "1.820",
    price: 2450000,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  },
];

const HotelListPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SearchSummary />

      <div className="max-w-7xl mx-auto px-10 py-8 flex gap-8">
        {/* Cột trái: Bộ lọc */}
        <div className="w-1/4">
          <FilterSidebar />
        </div>

        {/* Cột phải: Danh sách */}
        <div className="w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-800">
              Khách sạn tại Đà Nẵng
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sắp xếp theo:</span>
              <select className="bg-transparent font-bold text-sm outline-none">
                <option>Độ phổ biến</option>
                <option>Giá thấp nhất</option>
                <option>Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {dummyHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}

          {/* Phân trang */}
          <div className="flex justify-center mt-10 gap-2">
            {[1, 2, 3, "...", 15].map((page, i) => (
              <button
                key={i}
                className={`w-10 h-10 rounded-lg border ${page === 1 ? "bg-blue-500 text-white border-blue-500" : "bg-white hover:bg-slate-50"}`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListPage;
