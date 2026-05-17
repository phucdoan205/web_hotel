import React, { useEffect, useMemo, useState } from "react";
import {
  Star,
  MessageSquare,
  TrendingUp,
  Filter,
  ArrowUpDown,
  Search,
  RefreshCw,
  Sparkles,
  Award,
  ThumbsUp,
  Percent,
} from "lucide-react";
import { getPublicReviews } from "../../api/admin/reviewsApi";
import { getVietnamDateKey } from "../../utils/vietnamTime";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering, Sorting & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Jump-to-page state for interactive ellipsis
  const [showJumpInput, setShowJumpInput] = useState(false);
  const [inputPageVal, setInputPageVal] = useState("");

  const loadReviewsData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getPublicReviews(100);
      const formattedFetched = (data ?? []).map((r, index) => ({
        id: r.id ?? index,
        roomTypeName: r.roomTypeName ?? "Premium Room",
        userName: r.userName ?? "Khách ẩn danh",
        avatarUrl: r.avatarUrl ?? "",
        rating: Number(r.rating ?? 5),
        amenitiesRating: r.amenitiesRating ?? 5,
        staffRating: r.staffRating ?? 5,
        cleanlinessRating: r.cleanlinessRating ?? 5,
        locationRating: r.locationRating ?? 5,
        comment: r.comment ?? "",
        createdAt: r.createdAt ?? new Date().toISOString(),
      }));
      setReviews(formattedFetched);
    } catch (err) {
      console.error("Không tải được danh sách đánh giá từ API", err);
      setError("Không thể tải danh sách đánh giá từ máy chủ.");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRating, selectedRoomType, sortBy]);

  // Dynamic satisfaction color and label mapping from User Table
  const getSatisfactionDetails = (rating) => {
    if (rating >= 4.8) {
      return { 
        text: "Xuất sắc", 
        color: "text-emerald-700 bg-emerald-50 border border-emerald-200" 
      };
    }
    if (rating >= 4.5) {
      return { 
        text: "Rất hài lòng", 
        color: "text-green-600 bg-green-50 border border-green-150" 
      };
    }
    if (rating >= 4.0) {
      return { 
        text: "Hài lòng", 
        color: "text-blue-600 bg-blue-50 border border-blue-150" 
      };
    }
    if (rating >= 3.5) {
      return { 
        text: "Khá tốt", 
        color: "text-amber-600 bg-amber-50 border border-amber-150" 
      };
    }
    if (rating >= 3.0) {
      return { 
        text: "Trung bình", 
        color: "text-orange-600 bg-orange-50 border border-orange-150" 
      };
    }
    if (rating >= 2.0) {
      return { 
        text: "Chưa hài lòng", 
        color: "text-rose-500 bg-rose-50 border border-rose-100" 
      };
    }
    return { 
      text: "Rất tệ", 
      color: "text-red-600 bg-red-50 border border-red-200" 
    };
  };

  // Compute Dashboard Metrics
  const metrics = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        breakdownPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        criteria: { cleanliness: 0, staff: 0, amenities: 0, location: 0 },
      };
    }

    const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = (sumRating / total).toFixed(1);

    const countStars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(Math.max(Math.round(r.rating), 1), 5);
      countStars[rounded] = (countStars[rounded] || 0) + 1;
    });

    const percentages = {};
    Object.keys(countStars).forEach((key) => {
      percentages[key] = Math.round((countStars[key] / total) * 100);
    });

    const sumClean = reviews.reduce((sum, r) => sum + (r.cleanlinessRating ?? r.rating), 0);
    const sumStaff = reviews.reduce((sum, r) => sum + (r.staffRating ?? r.rating), 0);
    const sumAmen = reviews.reduce((sum, r) => sum + (r.amenitiesRating ?? r.rating), 0);
    const sumLoc = reviews.reduce((sum, r) => sum + (r.locationRating ?? r.rating), 0);

    return {
      totalReviews: total,
      averageRating: parseFloat(average),
      breakdown: countStars,
      breakdownPercentages: percentages,
      criteria: {
        cleanliness: (sumClean / total).toFixed(1),
        staff: (sumStaff / total).toFixed(1),
        amenities: (sumAmen / total).toFixed(1),
        location: (sumLoc / total).toFixed(1),
      },
    };
  }, [reviews]);

  const roomTypes = useMemo(() => {
    const list = reviews.map((r) => r.roomTypeName).filter(Boolean);
    return ["all", ...Array.from(new Set(list))];
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    if (searchTerm.trim()) {
      const normalizedKeyword = searchTerm.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(normalizedKeyword) ||
          r.roomTypeName.toLowerCase().includes(normalizedKeyword) ||
          r.comment.toLowerCase().includes(normalizedKeyword)
      );
    }

    if (selectedRating !== "all") {
      const ratingVal = parseInt(selectedRating);
      result = result.filter((r) => Math.round(r.rating) === ratingVal);
    }

    if (selectedRoomType !== "all") {
      result = result.filter((r) => r.roomTypeName === selectedRoomType);
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      
      if (sortBy === "newest") return timeB - timeA;
      if (sortBy === "oldest") return timeA - timeB;
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return timeB - timeA;
    });

    return result;
  }, [reviews, searchTerm, selectedRating, selectedRoomType, sortBy]);

  const displayedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedReviews, currentPage]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < fullStars) {
            return <Star key={index} className="size-4 fill-amber-400 text-amber-400" />;
          }
          if (index === fullStars && hasHalf) {
            return (
              <div key={index} className="relative size-4">
                <Star className="absolute inset-0 size-4 text-slate-200" />
                <div className="absolute inset-0 w-[50%] overflow-hidden">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </div>
              </div>
            );
          }
          return <Star key={index} className="size-4 text-slate-200" />;
        })}
      </div>
    );
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Mới đây";
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Mới đây";
    }
  };

  // Jump page submission handler
  const handleJumpPageSubmit = (e) => {
    e.preventDefault();
    const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage);
    const pageNum = parseInt(inputPageVal);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setInputPageVal("");
      setShowJumpInput(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1680px] space-y-8 pb-20">
      {/* Premium Header */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(31,100,156,0.12),_transparent_40%),linear-gradient(135deg,_#f4f8fc_0%,_#ffffff_60%,_#f7fbfd_100%)] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/50">
              <Sparkles className="size-4 text-blue-600" />
              Chất lượng & Ý kiến khách hàng
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Đánh giá dịch vụ phòng
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Lắng nghe và phân tích ý kiến phản hồi của du khách để liên tục cải tiến chất lượng
              tiện nghi phòng, phục vụ và dịch vụ lưu trú.
            </p>
          </div>

          <div>
            <button
              onClick={loadReviewsData}
              className="flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition"
            >
              <RefreshCw className="size-4" />
              Tải lại danh sách
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Overview Metrics */}
      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Average Rating Box */}
          <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:col-span-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Điểm đánh giá trung bình</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-6xl font-black text-slate-900">{metrics.averageRating}</span>
                <span className="text-xl font-bold text-slate-400">/ 5.0</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderStars(metrics.averageRating)}
                <span className="text-xs font-bold text-slate-500">
                  Dựa trên {metrics.totalReviews} lượt đánh giá
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              {(() => {
                const satisfaction = getSatisfactionDetails(metrics.averageRating);
                return (
                  <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black tracking-wide uppercase ${satisfaction.color}`}>
                    <Award className="size-4 shrink-0" />
                    Mức độ hài lòng: {satisfaction.text}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Sub-Criteria Metrics */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:col-span-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Điểm thành phần chi tiết</h3>
            
            <div className="space-y-3.5 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Dịch vụ & Thái độ phục vụ</span>
                  <span>{metrics.criteria.staff} / 5.0</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                  <div 
                    className="h-full rounded-full bg-blue-600 transition-all duration-1000" 
                    style={{ width: `${(metrics.criteria.staff / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Vệ sinh & Sạch sẽ</span>
                  <span>{metrics.criteria.cleanliness} / 5.0</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                  <div 
                    className="h-full rounded-full bg-sky-500 transition-all duration-1000" 
                    style={{ width: `${(metrics.criteria.cleanliness / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Tiện nghi</span>
                  <span>{metrics.criteria.amenities} / 5.0</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                  <div 
                    className="h-full rounded-full bg-purple-500 transition-all duration-1000" 
                    style={{ width: `${(metrics.criteria.amenities / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Vị trí</span>
                  <span>{metrics.criteria.location} / 5.0</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                  <div 
                    className="h-full rounded-full bg-amber-500 transition-all duration-1000" 
                    style={{ width: `${(metrics.criteria.location / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Star Percentages Breakdown */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tỷ lệ phân bổ sao</h3>
            
            <div className="space-y-2 pt-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = metrics.breakdown[stars] ?? 0;
                const percentage = metrics.breakdownPercentages[stars] ?? 0;

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <span className="w-3 text-right">{stars}</span>
                    <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-400">{percentage}%</span>
                    <span className="w-8 text-right text-slate-300">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-12">
          {/* Keyword Search */}
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên khách, loại phòng, nội dung..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Star Rating Dropdown */}
          <div className="relative md:col-span-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter className="size-4" />
            </div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100 appearance-none"
            >
              <option value="all">Tất cả số sao</option>
              <option value="5">5 Sao (Tuyệt vời)</option>
              <option value="4">4 Sao (Khá tốt)</option>
              <option value="3">3 Sao (Trung bình)</option>
              <option value="2">2 Sao (Kém)</option>
              <option value="1">1 Sao (Tồi tệ)</option>
            </select>
          </div>

          {/* Room Type Dropdown */}
          <div className="relative md:col-span-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Filter className="size-4" />
            </div>
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100 appearance-none"
            >
              <option value="all">Tất cả loại phòng</option>
              {roomTypes.filter(rt => rt !== "all").map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative md:col-span-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <ArrowUpDown className="size-4" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100 appearance-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Điểm cao nhất</option>
              <option value="lowest">Điểm thấp nhất</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid of Reviews */}
      {isLoading ? (
        <div className="flex h-60 items-center justify-center rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="size-8 animate-spin text-blue-600" />
            <span className="text-sm font-bold text-slate-400">Đang tải danh sách đánh giá...</span>
          </div>
        </div>
      ) : filteredAndSortedReviews.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <MessageSquare className="size-10 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">Không tìm thấy đánh giá nào</h3>
          <p className="max-w-md text-xs font-semibold text-slate-400">
            Không tìm thấy đánh giá phòng nào phù hợp với bộ lọc tìm kiếm hiện tại của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {displayedReviews.map((review) => {
              const initial = review.userName ? review.userName.charAt(0).toUpperCase() : "K";
              
              return (
                <div 
                  key={review.id} 
                  className="group flex flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Top Section: Author Details and Date */}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {review.avatarUrl ? (
                          <img 
                            src={review.avatarUrl} 
                            alt={review.userName} 
                            className="size-11 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-base font-black text-blue-700">
                            {initial}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-slate-800">{review.userName}</h4>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Khách
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">
                            Đã đăng {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Room Type Tag */}
                      <span className="inline-flex rounded-xl bg-blue-50/70 border border-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {review.roomTypeName}
                      </span>
                    </div>

                    {/* Star Rating Display */}
                    <div className="mt-4 flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-black text-slate-700">{review.rating} Sao</span>
                    </div>

                    {/* Comment bubble */}
                    {review.comment ? (
                      <div className="mt-4 border-l-2 border-slate-200/80 pl-3 italic text-sm font-medium text-slate-600 leading-relaxed">
                        "{review.comment}"
                      </div>
                    ) : (
                      <div className="mt-4 text-xs font-semibold text-slate-400 italic">
                        Khách hàng không để lại bình luận viết tay.
                      </div>
                    )}
                  </div>

                  {/* Sub-ratings Breakdown Inside Card */}
                  <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Phục vụ</span>
                      <span className="text-slate-700">{review.staffRating ?? review.rating}★</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Sạch sẽ</span>
                      <span className="text-slate-700">{review.cleanlinessRating ?? review.rating}★</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Tiện nghi</span>
                      <span className="text-slate-700">{review.amenitiesRating ?? review.rating}★</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Vị trí</span>
                      <span className="text-slate-700">{review.locationRating ?? review.rating}★</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Premium Pagination Bar */}
          {filteredAndSortedReviews.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between border border-slate-200 bg-white px-4 py-3 sm:px-8 sm:py-5 rounded-2xl sm:rounded-[2rem] shadow-sm gap-4">
              {/* Items Range Info (hidden on mobile, visible on desktop) */}
              <div className="hidden sm:block text-xs font-bold text-slate-400">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedReviews.length)} trong tổng số {filteredAndSortedReviews.length} đánh giá
              </div>

              {/* Desktop Pagination: Visible on screens >= sm */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {(() => {
                  const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage);
                  if (totalPages <= 6) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  } else {
                    const isNearStart = currentPage <= 3;
                    const isNearEnd = currentPage >= totalPages - 2;

                    return (
                      <div className="flex items-center gap-2">
                        {/* First 3 pages */}
                        {[1, 2, 3].map(page => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        {/* Middle ellipsis or dynamic current page */}
                        {isNearStart || isNearEnd ? (
                          showJumpInput ? (
                            <form onSubmit={handleJumpPageSubmit} className="flex items-center">
                              <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={inputPageVal}
                                onChange={(e) => setInputPageVal(e.target.value)}
                                placeholder="Trang..."
                                className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-extrabold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                autoFocus
                                onBlur={() => {
                                  setTimeout(() => setShowJumpInput(false), 250);
                                }}
                              />
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowJumpInput(true)}
                              title="Nhấp để nhập số trang cần chuyển"
                              className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs font-black text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition"
                            >
                              ...
                            </button>
                          )
                        ) : (
                          <>
                            {showJumpInput ? (
                              <form onSubmit={handleJumpPageSubmit} className="flex items-center">
                                <input
                                  type="number"
                                  min="1"
                                  max={totalPages}
                                  value={inputPageVal}
                                  onChange={(e) => setInputPageVal(e.target.value)}
                                  placeholder="Trang..."
                                  className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-extrabold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                  autoFocus
                                  onBlur={() => {
                                    setTimeout(() => setShowJumpInput(false), 250);
                                  }}
                                />
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowJumpInput(true)}
                                title="Nhấp để nhập số trang cần chuyển"
                                className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs font-black text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition"
                              >
                                ...
                              </button>
                            )}

                            {/* Dynamic Middle Active Page */}
                            <button
                              type="button"
                              className="rounded-xl px-4 py-2 text-xs font-bold transition bg-blue-600 text-white shadow-lg shadow-blue-100"
                            >
                              {currentPage}
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowJumpInput(true)}
                              title="Nhấp để nhập số trang cần chuyển"
                              className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs font-black text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition"
                            >
                              ...
                            </button>
                          </>
                        )}

                        {/* Last 3 pages */}
                        {[totalPages - 2, totalPages - 1, totalPages].map(page => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    );
                  }
                })()}
                <button
                  type="button"
                  disabled={currentPage === Math.ceil(filteredAndSortedReviews.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>

              {/* Mobile Compact Pagination: Visible only on screens < sm */}
              <div className="flex sm:hidden items-center justify-between w-full gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                {(() => {
                  const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage);
                  return showJumpInput ? (
                    <form onSubmit={handleJumpPageSubmit} className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={inputPageVal}
                        onChange={(e) => setInputPageVal(e.target.value)}
                        placeholder="Số..."
                        className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-xs font-extrabold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        autoFocus
                        onBlur={() => {
                          setTimeout(() => setShowJumpInput(false), 250);
                        }}
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowJumpInput(true)}
                      title="Nhấp để nhập số trang cần chuyển"
                      className="rounded-xl border border-dashed border-slate-350 bg-slate-50/50 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition"
                    >
                      Trang {currentPage} / {totalPages}
                    </button>
                  );
                })()}

                <button
                  type="button"
                  disabled={currentPage === Math.ceil(filteredAndSortedReviews.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
