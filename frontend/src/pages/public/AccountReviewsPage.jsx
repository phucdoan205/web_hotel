import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, FileText } from "lucide-react";
import { userReviewsApi } from "../../api/user/reviewsApi";
import { getStoredAuth } from "../../utils/authStorage";

const AccountReviewsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const auth = getStoredAuth() || {};
  const userFullName = auth.fullName || "Tài khoản";
  const avatarUrl = auth.avatarUrl;

  const reviewsQuery = useQuery({
    queryKey: ["user-my-reviews"],
    queryFn: () => userReviewsApi.getMyReviews(),
  });

  const reviews = reviewsQuery.data || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 lg:px-8 flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <div className="rounded border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-slate-100">
              {avatarUrl ? (
                <img 
                  src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:5000${avatarUrl}`} 
                  alt={userFullName} 
                  className="h-12 w-12 rounded-full object-cover border border-slate-200" 
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 border border-slate-200">
                  {userFullName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-base">{userFullName}</h3>
                <Link to="/profile" className="text-xs text-[#0194f3] hover:underline">
                  Chỉnh sửa hồ sơ của bạn
                </Link>
              </div>
            </div>
            <div className="py-2">
              <button 
                onClick={() => setActiveTab("all")}
                className={`w-full flex items-center justify-between px-5 py-3.5 transition-all ${activeTab === "all" ? "bg-white border-l-4 border-[#0194f3]" : "bg-white border-l-4 border-transparent hover:bg-slate-50"}`}
              >
                <span className={`text-sm ${activeTab === "all" ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                  Tất cả các đánh giá
                </span>
                <span className="text-sm font-semibold text-slate-500">{reviews.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab("property")}
                className={`w-full flex items-center justify-between px-5 py-3.5 transition-all ${activeTab === "property" ? "bg-white border-l-4 border-[#0194f3]" : "bg-white border-l-4 border-transparent hover:bg-slate-50"}`}
              >
                <span className={`text-sm ${activeTab === "property" ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                  Đánh giá về chỗ nghỉ
                </span>
                <span className="text-sm font-semibold text-slate-500">{reviews.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 w-full">
          {reviewsQuery.isLoading ? (
            <div className="flex h-40 items-center justify-center font-bold text-slate-400">
              Đang tải dữ liệu...
            </div>
          ) : reviewsQuery.isError ? (
             <div className="flex h-40 items-center justify-center font-bold text-rose-500">
               Không thể tải đánh giá. Vui lòng thử lại sau.
             </div>
          ) : !reviews.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-20 w-20 text-slate-400 mb-6 stroke-[1.5]" />
              <p className="text-slate-700 text-base font-medium">Bạn hiện không có đánh giá đang chờ xử lý nào.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="group relative flex flex-col gap-4 rounded border border-slate-200 bg-white p-5 transition-all hover:border-[#0194f3] shadow-sm sm:flex-row">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded bg-slate-100 sm:h-32 sm:w-32 border border-slate-200">
                    <img
                      src={review.image}
                      alt={review.hotelName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{review.hotelName}</h3>
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(review.createdAt || review.stayDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-1 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          fill={star <= review.rating ? "#fbbf24" : "none"} 
                          className={star <= review.rating ? "text-amber-400" : "text-slate-200"} 
                        />
                      ))}
                      <span className="ml-2 text-sm font-bold text-slate-700">{review.rating.toFixed(1)}</span>
                    </div>

                    {/* Multi-category breakdown */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Tiện nghi", val: review.amenitiesRating },
                        { label: "Nhân viên", val: review.staffRating },
                        { label: "Sạch sẽ", val: review.cleanlinessRating },
                        { label: "Vị trí", val: review.locationRating },
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col rounded-lg bg-slate-50 p-2 border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                          <span className="text-xs font-black text-slate-700">{item.val || "-"}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                      "{review.content}"
                    </p>
                    <div className="mt-3 text-xs font-semibold text-slate-400">
                      Tình trạng: <span className={review.isVerified ? "text-emerald-600" : "text-[#0194f3]"}>{review.isVerified ? "Đã duyệt" : "Đang chờ duyệt"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountReviewsPage;
