import React from "react";
import {
  Info,
  MapPin,
  Clock,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";

const HotelInfoTab = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Cột trái: Logo & Verification (4/12) */}
      <div className="xl:col-span-4 space-y-6">
        {/* Hotel Logo Section */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest self-start mb-6">
            Hotel Logo
          </h4>
          <div className="size-40 bg-[#b1a078] rounded-[2.5rem] flex items-center justify-center shadow-inner mb-6 relative group overflow-hidden">
            {/* Giả lập logo khách sạn */}
            <div className="text-white flex flex-col items-center">
              <div className="border-2 border-white/30 p-2 rounded-lg mb-1">
                <ImageIcon className="size-8" />
              </div>
              <span className="text-[8px] font-black tracking-[0.2em] uppercase">
                Grand Blue
              </span>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="text-[10px] font-black text-white uppercase tracking-wider">
                Change
              </button>
            </div>
          </div>
          <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
            Replace Logo
          </button>
          <p className="mt-4 text-[9px] font-bold text-gray-400 leading-relaxed px-4">
            Recommended: 400x400px, PNG or JPG (Max 2MB)
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl text-emerald-500 shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-emerald-900">
                Verified Partner
              </h4>
              <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <p className="text-[10px] font-bold text-emerald-600/70">
              Trust score: 98/100
            </p>
          </div>
        </div>
      </div>

      {/* Cột phải: Form chi tiết (8/12) */}
      <div className="xl:col-span-8 space-y-6">
        {/* General Details */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Info className="size-4" />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
              General Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Hotel Name
              </label>
              <input
                type="text"
                defaultValue="Blue Horizon Resort & Spa"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-100 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Property Type
              </label>
              <select className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 outline-none">
                <option>Resort</option>
                <option>Boutique Hotel</option>
                <option>Villa</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Star Rating
              </label>
              <div className="flex items-center gap-1.5 px-5 py-3.5 bg-gray-50 rounded-2xl">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-orange-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Location & Contact */}
        <section className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <MapPin className="size-4" />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
              Location & Contact
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Complete Address
              </label>
              <textarea
                rows="2"
                defaultValue="Jl. Sunset Road No. 88, Kuta, Kabupaten Badung, Bali 80361, Indonesia"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-100 transition-all outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  defaultValue="+62 361 738444"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="contact@bluehorizonbali.com"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Operational Hours */}
        <section className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Clock className="size-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                Operational Hours
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Auto-apply to all days
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="size-4 rounded accent-blue-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            {["Weekdays", "Weekends"].map((day) => (
              <div
                key={day}
                className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50"
              >
                <span className="text-xs font-bold text-gray-600 w-24">
                  {day}
                </span>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    defaultValue="12:00 AM"
                    className="w-24 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-center"
                  />
                  <span className="text-gray-300">-</span>
                  <input
                    type="text"
                    defaultValue="11:59 PM"
                    className="w-24 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-center"
                  />
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">
                    24 Hours
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HotelInfoTab;
