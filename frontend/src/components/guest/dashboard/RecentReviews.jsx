import React from "react";
import { MessageSquareText, Star } from "lucide-react";

const RecentReviews = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
    <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
      <MessageSquareText size={16} className="text-[#0085FF]" /> Recent Reviews
    </h2>
    <div className="space-y-6">
      {[1, 2].map((_, idx) => (
        <div
          key={idx}
          className={`${idx === 0 ? "pb-6 border-b border-gray-50" : ""}`}
        >
          <p className="text-[11px] font-bold text-gray-500 italic leading-relaxed">
            "Absolutely wonderful stay. The service was impeccable and the
            private beach was stunning."
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] font-black text-[#0085FF]">
              Vinpearl Resort Nha Trang
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={8}
                  className="fill-orange-400 text-orange-400"
                />
              ))}
            </div>
          </div>
          <p className="text-[8px] font-bold text-gray-300 mt-1">
            Posted on Aug 20, 2023
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default RecentReviews;
