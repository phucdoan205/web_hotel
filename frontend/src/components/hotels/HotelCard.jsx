import React from "react";
import { Star, MapPin, Coffee, Wifi, Car } from "lucide-react";

const HotelCard = ({ hotel }) => {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row mb-4 hover:shadow-md transition-shadow">
      <div className="relative w-full md:w-80 h-52 md:h-auto shrink-0">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-xl">
          PHỔ BIẾN NHẤT
        </span>
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {hotel.name}
              </h2>
              <div className="flex items-center gap-1 text-yellow-400 my-1">
                {[...Array(hotel.stars)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-slate-400 text-xs ml-2">Khách sạn</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-blue-600 font-bold text-sm">
                  {hotel.reviewStatus}
                </span>
                <span className="bg-blue-600 text-white font-bold px-2 py-1 rounded-xl text-sm">
                  {hotel.rating}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] mt-1">
                {hotel.reviewCount} đánh giá
              </p>
            </div>
          </div>

          <p className="flex items-center gap-1 text-slate-500 text-sm mt-1">
            <MapPin size={14} /> {hotel.location}
          </p>

          <div className="flex gap-4 mt-4 text-xs text-slate-600">
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-xl">
              <Coffee size={14} /> Bao gồm bữa sáng
            </span>
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-xl">
              <Wifi size={14} /> Wi-Fi miễn phí
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end mt-6">
          <div className="text-slate-400 text-xs italic">
            Không cần thanh toán ngay
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 line-through">
              10.500.000 VND
            </p>
            <p className="text-xl font-bold text-blue-600">
              {hotel.price.toLocaleString()} VND
              <span className="text-slate-400 text-xs font-normal">/đêm</span>
            </p>
            <button className="mt-2 px-6 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all">
              Chọn phòng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
