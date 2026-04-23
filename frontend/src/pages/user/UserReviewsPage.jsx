import React from "react";
import { ChevronDown } from "lucide-react";
import ReviewCard from "../../components/user/reviews/ReviewCard";

const reviewsData = [
  {
    id: 1,
    hotelName: "The Grand Hyatt Singapore",
    image: "https://ik.imagekit.io/tvlk/blog/2021/06/alma-oasis-long-hai-cvdes.jpg",
    rating: 4.5,
    stayDate: "Oct 12, 2023",
    isVerified: true,
    content:
      "Exceptional service and the breakfast buffet was outstanding. The pool area is very relaxing, though it can get a bit crowded in the afternoons.",
    reply:
      "Dear Alex, thank you for your kind words. We are delighted to hear you enjoyed the breakfast and our hospitality.",
  },
];

const UserReviewsPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <nav className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Home / Account Settings / <span className="text-gray-900">Review</span>
        </nav>
        <h1 className="mb-2 text-3xl font-black text-gray-900">Review của tôi</h1>
        <p className="text-[13px] font-bold text-gray-400">
          Xem lại các đánh giá bạn đã gửi sau những lần lưu trú.
        </p>
      </div>

      <div className="max-w-4xl">
        {reviewsData.map((item) => (
          <ReviewCard key={item.id} review={item} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-8 py-3 text-[11px] font-black text-[#0085FF] shadow-sm transition-all hover:shadow-md">
          Load More Reviews
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

export default UserReviewsPage;
