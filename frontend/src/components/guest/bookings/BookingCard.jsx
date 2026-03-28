import React from "react";
import { MapPin, Calendar, Users, Home } from "lucide-react";
import { NavLink } from "react-router-dom";

const BookingCard = ({ data }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex gap-6 hover:shadow-md transition-all group">
      {/* Hình ảnh khách sạn */}
      <div className="w-56 h-40 rounded-[2rem] overflow-hidden flex-shrink-0">
        <img
          src={data.img}
          alt={data.hotel}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Nội dung thông tin */}
      <div className="flex-grow flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                {data.status}
              </span>
              <span className="text-[10px] font-bold text-gray-300 uppercase">
                {data.id}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase">
                Total Price
              </p>
              <p className="text-sm font-black text-[#0085FF]">
                IDR {data.price}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-black text-gray-900 mt-1">
            {data.hotel}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> Mega Kuningan, Jakarta Selatan
          </p>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Stay Dates
              </p>
              <p className="text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar size={12} className="text-[#0085FF]" /> {data.date}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Room Type
              </p>
              <p className="text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
                <Home size={12} className="text-[#0085FF]" /> {data.type}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Guests
              </p>
              <p className="text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
                <Users size={12} className="text-[#0085FF]" /> {data.guests}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="text-[11px] font-black text-gray-500 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors">
            Manage Booking
          </button>
          <NavLink
            to={`/guest/booking/${data.id}`}
            className="bg-[#0085FF] text-white text-[11px] font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-transform active:scale-95">
            View Details
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
