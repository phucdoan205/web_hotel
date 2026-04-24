import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import ReviewCard from "../../components/user/reviews/ReviewCard";
import { userReviewsApi } from "../../api/user/reviewsApi";

const UserReviewsPage = () => {
  const reviewsQuery = useQuery({
    queryKey: ["user-reviews"],
    queryFn: () => userReviewsApi.getMyReviews(),
  });

  const reviews = reviewsQuery.data || [];

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
        {reviewsQuery.isLoading ? (
          <div className="rounded-[2rem] bg-white px-6 py-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Đang tải review...
          </div>
        ) : reviewsQuery.isError ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm font-semibold text-rose-600">
            Không tải được danh sách review.
          </div>
        ) : reviews.length ? (
          reviews.map((item) => <ReviewCard key={item.id} review={item} />)
        ) : (
          <div className="rounded-[2rem] bg-white px-6 py-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Bạn chưa có review nào.
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-8 py-3 text-[11px] font-black text-[#0085FF] shadow-sm transition-all hover:shadow-md"
        >
          Reviews của bạn
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

export default UserReviewsPage;
