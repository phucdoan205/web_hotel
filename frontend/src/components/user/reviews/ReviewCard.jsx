import React from "react";
import { Pencil, Trash2, Star } from "lucide-react";
import ManagementReply from "./ManagementReply";

const ReviewCard = ({ review }) => (
  <div className="bg-white rounded-4xl border border-gray-100 p-8 shadow-sm mb-6 transition-all hover:shadow-md">
    <div className="flex gap-6">
      {/* Hotel Image */}
      <img
        src={review.image}
        alt={review.hotelName}
        className="size-24 rounded-2xl object-cover"
      />

      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="text-[15px] font-black text-gray-900">
                {review.hotelName}
              </h4>
              {review.isVerified && (
                <span className="bg-emerald-50 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                  Verified Stay
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <div className="flex items-center gap-1 text-orange-400">
                <Star size={12} fill="currentColor" />
                <span className="text-gray-900">{review.rating}/5</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">Stayed on {review.stayDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="p-2.5 text-gray-400 hover:text-[#0085FF] bg-gray-50 rounded-xl transition-colors">
              <Pencil size={16} />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-rose-500 bg-gray-50 rounded-xl transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Review Text */}
        <p className="text-[12px] font-medium text-gray-500 leading-relaxed italic mb-6">
          "{review.content}"
        </p>

        {/* Reply Section if exists */}
        {review.reply && <ManagementReply reply={review.reply} />}
      </div>
    </div>
  </div>
);

export default ReviewCard;
