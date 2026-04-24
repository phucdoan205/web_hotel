import React from "react";
import { Star } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("vi-VN");
};

const ReviewCard = ({ review }) => (
  <div className="mb-6 rounded-4xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
    <div className="flex gap-6">
      <img src={review.image} alt={review.hotelName} className="size-24 rounded-2xl object-cover" />

      <div className="flex-1">
        <div className="mb-2 flex justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h4 className="text-[15px] font-black text-gray-900">{review.hotelName}</h4>
              {review.isVerified ? (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-emerald-500">
                  Verified Stay
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <div className="flex items-center gap-1 text-orange-400">
                <Star size={12} fill="currentColor" />
                <span className="text-gray-900">{review.rating}/5</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Stayed on {formatDate(review.stayDate)}</span>
            </div>
          </div>
        </div>

        <p className="text-[12px] font-medium italic leading-relaxed text-gray-500">"{review.content}"</p>
      </div>
    </div>
  </div>
);

export default ReviewCard;
