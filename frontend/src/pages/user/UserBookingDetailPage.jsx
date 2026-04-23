import React from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Info,
  Star,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import DetailStayInfo from "../../components/user/bookings/DetailStayInfo";
import DetailQuickCheckIn from "../../components/user/bookings/DetailQuickCheckIn";
import DetailPriceBreakdown from "../../components/user/bookings/DetailPriceBreakdown";
import DetailPolicy from "../../components/user/bookings/DetailPolicy";
import { NavLink } from "react-router-dom";

const UserBookingDetailPage = ({ onBack, bookingId }) => {
  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <span className="hover:text-[#0085FF] cursor-pointer">Home</span>
        <span>/</span>
        <span className="hover:text-[#0085FF] cursor-pointer" onClick={onBack}>
          My Bookings
        </span>
        <span>/</span>
        <span className="text-gray-900 italic font-bold capitalize">
          Booking Details
        </span>
      </nav>

      {/* Header Actions */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-4">
          <NavLink
            to="/user/bookings"
            onClick={onBack}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </NavLink>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              Booking ID: {bookingId || "TRV-8829104"}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                Confirmed
              </span>
              <p className="text-[11px] font-bold text-gray-400 italic">
                Booked on Oct 12, 2023
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-900 shadow-sm hover:bg-gray-50 transition-colors">
            Manage Booking
          </button>
          <button className="px-6 py-3 bg-[#0085FF] text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-600 transition-colors">
            🎟️ Voucher
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN: Main Info */}
        <div className="col-span-8 space-y-8">
          {/* Hotel Info Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-72">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
                className="w-full h-full object-cover"
                alt="Hotel Banner"
              />
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg border border-white/50">
                <Star size={12} className="fill-orange-400 text-orange-400" />
                <span className="text-[10px] font-black text-gray-900">
                  5.0 Hotel
                </span>
              </div>
            </div>
            <div className="p-8 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  Grand Hyatt Jakarta
                </h3>
                <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={12} /> J. M.H. Thamrin No.Kav 28-30, Jakarta
                  Central, 10350, Indonesia
                </p>
                <button className="text-[#0085FF] text-[11px] font-black mt-2.5 flex items-center gap-1 hover:underline">
                  View on map <ExternalLink size={10} />
                </button>
              </div>
              <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-3xl border border-gray-100">
                <div className="size-11 rounded-full bg-blue-100 overflow-hidden">
                  <img
                    src="https://ui-avatars.com/api/?name=John+Doe&background=0085FF&color=fff"
                    alt="User"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-900">
                    John Doe
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Phone size={10} /> +62 812-3456-7890
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Info Section */}
          <DetailStayInfo />

          {/* Amenities & Special Requests */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-6">
                Room Amenities
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-700">
                  <div className="size-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center italic font-black">
                    Wi-Fi
                  </div>
                  Free High-speed Wi-Fi
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-700">
                  <div className="size-8 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black">
                    🍳
                  </div>
                  Breakfast included
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-700">
                  <div className="size-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-black">
                    🚭
                  </div>
                  Non-smoking room
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-6">
                Special Requests
              </h4>
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-dashed border-gray-200">
                <p className="text-[11px] font-bold text-gray-500 italic leading-relaxed">
                  "High floor preferred if available. Looking forward to an
                  early check-in around 12 PM if possible."
                </p>
              </div>
              <p className="text-[9px] font-bold text-gray-300 mt-4 italic">
                *Subject to availability upon arrival
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Check-in, Price & Policy */}
        <div className="col-span-4 space-y-8">
          <DetailQuickCheckIn />
          <DetailPriceBreakdown />
          <DetailPolicy />

          <div className="space-y-4 pt-4">
            <button className="w-full py-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-900 shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
              <Phone size={14} className="text-[#0085FF]" /> Contact Hotel
            </button>
            <button className="w-full py-4 text-rose-500 text-[11px] font-black hover:bg-rose-50 rounded-2xl transition-colors">
              Cancel or Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookingDetailPage;
