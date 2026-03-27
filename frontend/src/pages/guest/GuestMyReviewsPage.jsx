import React from "react";
import ReviewCard from "../../components/guest/reviews/ReviewCard";
import ReviewTabs from "../../components/guest/reviews/ReviewTabs";
import { ChevronDown } from "lucide-react";

const GuestMyReviewsPage = () => {
  const reviewsData = [
    {
      id: 1,
      hotelName: "The Grand Hyatt Singapore",
      image: "https://ik.imagekit.io/tvlk/blog/2021/06/alma-oasis-long-hai-cvdes.jpg",
      rating: 4.5,
      stayDate: "Oct 12, 2023",
      isVerified: true,
      content:
        "Exceptional service and the breakfast buffet was outstanding. The pool area is very relaxing, though it can get a bit crowded in the afternoons. Highly recommended for business travelers.",
      reply:
        "Dear Alex, thank you for your kind words! We are delighted to hear you enjoyed the breakfast and our hospitality. We've noted your feedback regarding the pool area. Looking forward to welcoming you back soon.",
    },
    // Thêm các review khác từ ảnh
  ];

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <nav className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Home / Account Settings /{" "}
          <span className="text-gray-900">My Reviews</span>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 mb-2">My Reviews</h1>
        <p className="text-[13px] font-bold text-gray-400">
          Manage and edit your feedback for past stays to help other travelers.
        </p>
      </div>

      {/* Tabs */}
      <ReviewTabs />

      {/* Reviews List */}
      <div className="max-w-4xl">
        {reviewsData.map((item) => (
          <ReviewCard key={item.id} review={item} />
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-10">
        <button className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-[#0085FF] shadow-sm hover:shadow-md transition-all">
          Load More Reviews
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

export default GuestMyReviewsPage;
