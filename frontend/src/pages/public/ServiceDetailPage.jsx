import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
  Minus,
  Plus,
  Reply,
  Send,
  Star,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import publicServicesApi from "../../api/public/publicServicesApi";
import { getStoredAuth } from "../../utils/authStorage";

const normalizeServiceContent = (content) => {
  if (!content) {
    return "";
  }

  // Thay thế các khoảng trắng không ngắt (non-breaking spaces) sinh ra từ Editor
  // để chữ có thể tự động xuống dòng trên màn hình nhỏ.
  let cleanedContent = content.replace(/&nbsp;/g, " ");

  if (/<[a-z][\s\S]*>/i.test(cleanedContent)) {
    return cleanedContent;
  }

  return cleanedContent
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

const extractImageUrlsFromHtml = (html) => {
  if (!html) {
    return [];
  }

  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter(Boolean);
};

const extractMapSrc = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  return match?.[1] || trimmed;
};

const getMonthMatrix = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  const weekDay = (firstDay.getDay() + 6) % 7;
  startDate.setDate(firstDay.getDate() - weekDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
};

const isSameDate = (left, right) =>
  left &&
  right &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNextNDays = (n = 14) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
};

const getDayName = (date) => {
  const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
  const isToday = isSameDate(date, new Date());
  if (isToday) return "Hôm nay";
  return days[date.getDay()];
};

const CommentComposer = ({
  auth,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  replyTarget,
  onCancelReply,
  rating,
  setRating,
}) => (
  <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4 sm:p-6">
    {replyTarget ? (
      <div className="flex items-center justify-between rounded-xl bg-[#0194f3]/10 px-4 py-3 text-sm font-semibold text-[#017bc0]">
        <span>
          Đang trả lời <span className="font-black">{replyTarget.userName}</span>
        </span>
        <button type="button" onClick={onCancelReply} className="text-[#01539d] hover:underline">
          Hủy
        </button>
      </div>
    ) : (
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-700">Đánh giá dịch vụ (tùy chọn)</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1 transition hover:scale-110"
            >
              <Star
                size={24}
                fill={value <= rating ? "#fbbf24" : "none"}
                className={value <= rating ? "text-amber-400" : "text-slate-300"}
              />
            </button>
          ))}
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    )}

    <div className="flex items-start gap-4">
      <img
        src={auth?.avatarUrl || "https://placehold.co/100x100/e2e8f0/64748b?text=U"}
        alt={auth?.fullName || "User"}
        className="size-10 rounded-full object-cover ring-2 ring-white shadow-sm sm:size-12"
      />

      <div className="min-w-0 flex-1 space-y-3">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          placeholder={replyTarget ? "Nhập câu trả lời..." : "Chia sẻ cảm nghĩ của bạn về dịch vụ này..."}
          className="w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0194f3] focus:ring-4 focus:ring-[#0194f3]/10"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !value.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0194f3] px-6 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-[#017bc0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="size-4" />
            )}
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  </form>
);

const CommentItem = ({
  comment,
  onReply,
  replyTarget,
  commentText,
  setCommentText,
  handleSubmitComment,
  submitting,
  auth,
  canInteract,
  cancelReply,
  rating,
  setRating,
}) => {
  const isReplyingHere = replyTarget?.id === comment.id;

  return (
    <div className="flex gap-3 sm:gap-4">
      <img
        src={comment.userAvatarUrl || "https://placehold.co/100x100/e2e8f0/64748b?text=U"}
        alt={comment.userName}
        className="size-10 shrink-0 rounded-full object-cover ring-1 ring-slate-100 sm:size-12"
      />

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-slate-900">{comment.userName}</span>
            <span className="text-xs font-semibold text-slate-400">
              {new Date(comment.createdAt).toLocaleString("vi-VN")}
            </span>
            {comment.rating > 0 && (
              <div className="ml-2 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    fill={star <= comment.rating ? "#fbbf24" : "none"}
                    className={star <= comment.rating ? "text-amber-400" : "text-slate-200"}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
            {comment.taggedUserName ? (
              <span className="mr-1.5 font-bold text-[#0194f3]">@{comment.taggedUserName}</span>
            ) : null}
            {comment.content}
          </p>
        </div>

        <div className="mt-2 pl-2">
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#0194f3]"
          >
            <Reply className="size-3.5" />
            Trả lời
          </button>
        </div>

        {isReplyingHere && canInteract && auth ? (
          <CommentComposer
            auth={auth}
            value={commentText}
            onChange={setCommentText}
            onSubmit={handleSubmitComment}
            isSubmitting={submitting}
            replyTarget={replyTarget}
            onCancelReply={cancelReply}
            rating={rating}
            setRating={setRating}
          />
        ) : null}

        {comment.replies?.length ? (
          <div className="mt-5 space-y-5 border-l-2 border-slate-100 pl-4 sm:pl-6">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                replyTarget={replyTarget}
                commentText={commentText}
                setCommentText={setCommentText}
                handleSubmitComment={handleSubmitComment}
                submitting={submitting}
                auth={auth}
                canInteract={canInteract}
                cancelReply={cancelReply}
                rating={rating}
                setRating={setRating}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const auth = getStoredAuth();
  const contentRef = useRef(null);
  const bookingBoxRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [service, setService] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [expandedContent, setExpandedContent] = useState(false);
  const [canExpandContent, setCanExpandContent] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingDate, setBookingDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);
  
  const renderBookingContent = () => (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-slate-800">Tìm theo ngày</span>
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="text-sm font-bold text-[#0194f3] hover:underline"
          >
            {showFullCalendar ? "Đóng lịch" : "Hiển thị thêm ngày"}
          </button>
        </div>

        {!showFullCalendar ? (
          <div className="relative group/scroll">
            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
              className="absolute -left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-transform hover:scale-110 md:group-hover/scroll:flex"
            >
              <ChevronLeft className="size-5 text-slate-600" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {quickDates.map((date) => {
                const dateValue = formatDateValue(date);
                const isSelected = selectedBookingDate && isSameDate(date, selectedBookingDate);
                return (
                  <button
                    key={date.toISOString()}
                    data-date={dateValue}
                    onClick={() => handleSelectBookingDate(date)}
                    className={`flex min-w-[85px] flex-col items-center justify-center rounded-2xl border-2 py-5 transition-all ${isSelected
                      ? "border-[#0194f3] bg-[#0194f3]/5 shadow-sm"
                      : "border-slate-100 bg-white hover:border-[#0194f3]/30"
                      }`}
                  >
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? "text-[#0194f3]" : "text-slate-400"}`}>
                      {getDayName(date)}
                    </span>
                    <span className={`mt-1 text-2xl font-black ${isSelected ? "text-[#0194f3]" : "text-slate-800"}`}>
                      {date.getDate()}
                    </span>
                    <span className={`text-[11px] font-bold ${isSelected ? "text-[#0194f3]" : "text-slate-400"}`}>
                      Tháng {date.getMonth() + 1}
                    </span>
                    {isSameDate(date, new Date(new Date().setDate(new Date().getDate() + 1))) && (
                      <span className="mt-2 rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-black text-slate-500">Ngày mai</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
              className="absolute -right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-transform hover:scale-110 md:group-hover/scroll:flex"
            >
              <ChevronRight className="size-5 text-slate-600" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="flex size-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-[#0194f3]"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="text-sm font-black text-slate-800">
                Tháng {calendarMonth.getMonth() + 1} {calendarMonth.getFullYear()}
              </div>
              <button
                type="button"
                onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="flex size-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-[#0194f3]"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-400">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
                const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
                const isPast = date < today;
                const isSelected = selectedBookingDate && isSameDate(date, selectedBookingDate);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectBookingDate(date)}
                    className={`aspect-square rounded-xl text-xs font-bold transition-all ${isSelected
                      ? "bg-[#0194f3] text-white shadow-md"
                      : isCurrentMonth
                        ? "text-slate-700 hover:bg-white hover:text-[#0194f3] hover:shadow-sm"
                        : "text-slate-300"
                      } ${isPast ? "cursor-not-allowed text-slate-200" : ""}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-4 pt-4">
        <h4 className="text-sm font-black text-slate-800">Số lượng</h4>
        <div className="flex items-center justify-end rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[#0194f3]"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-[20px] text-center text-sm font-black text-slate-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[#0194f3]"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary & CTA */}
      <div className="space-y-4 pt-6 border-t border-slate-100 mb-12 lg:mb-0">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng cộng</div>
            <div className="text-2xl font-black text-[#f12c2c]">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(service.price * quantity)}
            </div>
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0194f3] py-4 text-sm font-black text-white shadow-lg shadow-[#0194f3]/25 transition-all hover:scale-[1.02] hover:bg-[#017bc0] active:scale-95">
          Tiếp tục
        </button>
      </div>
    </div>
  );
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const canInteract = auth?.role?.toLowerCase() !== "housekeeping";
  const htmlContent = useMemo(() => normalizeServiceContent(service?.description), [service?.description]);
  const descriptionImageUrls = useMemo(() => extractImageUrlsFromHtml(htmlContent), [htmlContent]);

  const imageUrls = useMemo(() => {
    if (!service) return [];
    const descriptionImages = new Set(descriptionImageUrls);
    return [...new Set([service.thumbnailUrl, ...(service.images || [])].filter((url) => url && !descriptionImages.has(url)))];
  }, [descriptionImageUrls, service]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const selectedBookingDate = useMemo(() => {
    if (!bookingDate) return null;
    const [year, month, day] = bookingDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [bookingDate]);

  const quickDates = useMemo(() => getNextNDays(30), []);
  const calendarDays = useMemo(() => getMonthMatrix(calendarMonth), [calendarMonth]);

  useEffect(() => {
    if (bookingDate && scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector(`[data-date="${bookingDate}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [bookingDate]);

  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGalleryOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadService = async () => {
      setLoading(true);
      setError("");
      setExpandedContent(false);

      try {
        const detail = await publicServicesApi.getPublicServiceDetail(slug);
        setService(detail);
        setComments(detail.comments ?? []);
      } catch (fetchError) {
        setError(fetchError?.response?.data || "Không tải được dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [slug]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setCanExpandContent(node.scrollHeight > 800);
  }, [expandedContent, htmlContent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!bookingBoxRef.current?.contains(event.target)) {
        setShowFullCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReply = (comment) => {
    setReplyTarget(comment);
    setCommentText("");
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || !service) return;

    setSubmitting(true);

    try {
      const nextComments = await publicServicesApi.createServiceComment(service.id, {
        content: commentText.trim(),
        parentCommentId: replyTarget?.id ?? null,
        taggedUserId: replyTarget?.userId ?? null,
        rating: replyTarget ? null : rating || null,
      });

      setComments(nextComments);
      setCommentText("");
      setReplyTarget(null);
      setRating(0);
    } catch (submitError) {
      setError(submitError?.response?.data || "Không gửi được đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReply = () => {
    setReplyTarget(null);
    setCommentText("");
  };

  const handleSelectBookingDate = (date) => {
    if (date < today) return;
    setBookingDate(formatDateValue(date));
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowFullCalendar(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="mb-4 size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0194f3]" />
          <p className="text-sm font-semibold text-slate-500">Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-lg font-bold text-slate-900">{String(error || "Không tìm thấy dịch vụ.")}</p>
          <Link to="/services" className="mt-4 inline-block font-semibold text-[#0194f3] hover:underline">
            Quay lại danh sách dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(service.price);

  return (
    <>
      <div className="min-h-screen bg-white pb-24 pt-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link to="/services" className="transition-colors hover:text-[#0194f3]">
            Dịch vụ
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#0194f3]">{service.categoryName || "Chung"}</span>
          <span className="text-slate-300">/</span>
          <span className="max-w-[150px] truncate text-slate-900 sm:max-w-none">{service.name}</span>
        </div>

        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl">
            {service.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
            {service.averageRating > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-amber-600">
                <Star size={14} fill="#fbbf24" className="text-amber-400" />
                <span className="text-slate-900">{service.averageRating.toFixed(1)}</span>
              </div>
            )}
            <span className="flex items-center gap-1.5">
              <MessageCircle className="size-4" />
              {comments.length} đánh giá
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= Math.round(service.averageRating || 0) ? "#fbbf24" : "none"}
                  className={star <= Math.round(service.averageRating || 0) ? "text-amber-400" : "text-slate-200"}
                />
              ))}
              <span className="ml-1 text-slate-900">{service.averageRating > 0 ? service.averageRating.toFixed(1) : "0.0"}</span>
            </div>
          </div>
        </div>

        {imageUrls.length > 0 && (
          <div
            className="group mb-8 grid h-[250px] cursor-pointer gap-2 overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200 sm:h-[400px] md:mb-12 md:h-[480px] md:grid-cols-3"
            onClick={() => {
              setCurrentImageIndex(0);
              setIsGalleryOpen(true);
            }}
          >
            <div className={`${imageUrls.length >= 2 ? "md:col-span-2" : "md:col-span-3"} relative h-full overflow-hidden`}>
              <img
                src={imageUrls[0]}
                alt="Ảnh chính dịch vụ"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {imageUrls.length >= 2 && (
              <div
                className={`hidden gap-2 md:grid ${imageUrls.length >= 5
                  ? "grid-cols-2 grid-rows-2"
                  : imageUrls.length === 4
                    ? "grid-cols-1 grid-rows-3"
                    : imageUrls.length === 3
                      ? "grid-cols-1 grid-rows-2"
                      : "grid-cols-1 grid-rows-1"
                  }`}
              >
                {imageUrls.slice(1, 5).map((url, idx) => {
                  const isLast = idx === 3 || (imageUrls.length < 5 && idx === imageUrls.length - 2);
                  return (
                    <div key={idx} className="relative h-full overflow-hidden">
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {isLast && imageUrls.length > 5 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/40">
                          <div className="mb-1 flex gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          </div>
                          <span className="text-sm font-bold">Tất cả ảnh</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <h2 className="mb-4 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
                Mô tả dịch vụ
              </h2>
            </div>

            <div className="relative w-full overflow-hidden">
              <div
                ref={contentRef}
                className={`prose prose-slate max-w-none prose-headings:font-black prose-a:text-[#0194f3] prose-img:rounded-2xl 
                [&_*]:!whitespace-normal [&_p]:leading-7 [&_p]:text-slate-600 [&_p]:font-medium
                [&_li]:leading-7 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words 
                [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_img]:my-5 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:object-cover 
                transition-all duration-500 ${expandedContent ? "" : "max-h-[600px] sm:max-h-[800px] overflow-hidden"
                  }`}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
              {!expandedContent && canExpandContent && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
              )}
            </div>

            {!expandedContent && canExpandContent && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setExpandedContent(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-[#0194f3]"
                >
                  Đọc tiếp mô tả <ChevronDown className="size-4" />
                </button>
              </div>
            )}

            <div className="mt-20 border-t border-slate-100 pt-12">
              <div className="mb-10 flex flex-col items-center justify-between sm:flex-row">
                <h2 className="mb-4 text-2xl font-black text-slate-900 sm:mb-0">
                  Đánh giá và nhận xét ({comments.length})
                </h2>
                {service.averageRating > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-2">
                    <div className="text-3xl font-black text-slate-900">{service.averageRating.toFixed(1)}</div>
                    <div className="flex flex-col">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= Math.round(service.averageRating) ? "#fbbf24" : "none"}
                            className={star <= Math.round(service.averageRating) ? "text-amber-400" : "text-slate-200"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-700">Đánh giá trung bình</span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-8 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
                  {String(error)}
                </div>
              )}

              {canInteract && auth && !replyTarget && (
                <CommentComposer
                  auth={auth}
                  value={commentText}
                  onChange={setCommentText}
                  onSubmit={handleSubmitComment}
                  isSubmitting={submitting}
                  replyTarget={null}
                  onCancelReply={cancelReply}
                  rating={rating}
                  setRating={setRating}
                />
              )}

              {!auth && (
                <div className="mb-10 rounded-3xl bg-slate-50 p-10 text-center">
                  <p className="mb-4 text-sm font-bold text-slate-500">Vui lòng đăng nhập để gửi đánh giá cho dịch vụ này</p>
                  <Link to="/login" className="inline-block rounded-xl bg-[#0194f3] px-8 py-3 text-sm font-black text-white shadow-md hover:bg-[#017bc0]">
                    Đăng nhập ngay
                  </Link>
                </div>
              )}

              <div className="space-y-8">
                {comments.length === 0 ? (
                  <div className="py-20 text-center text-sm font-bold italic text-slate-400">
                    Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onReply={handleReply}
                      replyTarget={replyTarget}
                      commentText={commentText}
                      setCommentText={setCommentText}
                      handleSubmitComment={handleSubmitComment}
                      submitting={submitting}
                      auth={auth}
                      canInteract={canInteract}
                      cancelReply={cancelReply}
                      rating={rating}
                      setRating={setRating}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6 hidden lg:block">
            {service.location && service.mapEmbedLink && (
              <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-100">
                <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">Địa điểm</h3>
                <div className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                  <iframe
                    src={extractMapSrc(service.mapEmbedLink)}
                    title={`Bản đồ ${service.location}`}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            <div className="sticky top-32 space-y-6">
              <div ref={bookingBoxRef} className="overflow-hidden rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-100">
                <h3 className="mb-6 text-xl font-black text-slate-900">Giá cả</h3>
                {renderBookingContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Booking Drawer (Rendered at root to avoid grid layout shifts) */}
      {isMobileBookingOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileBookingOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 top-[15vh] z-[100] flex flex-col rounded-t-3xl bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <span className="font-black text-xl text-slate-900">Đặt dịch vụ</span>
              <button onClick={() => setIsMobileBookingOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 active:scale-95">
                <X size={20}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              {renderBookingContent()}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Booking Bar for Mobile */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden transition-transform duration-300 ${isMobileBookingOpen ? "translate-y-full" : "translate-y-0"}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giá từ</span>
            <span className="text-lg font-black text-[#f12c2c] truncate">{formattedPrice}</span>
          </div>
          <button 
            onClick={() => setIsMobileBookingOpen(true)}
            className="rounded-xl bg-[#0194f3] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#0194f3]/20 active:scale-95 shrink-0 whitespace-nowrap"
          >
            Đặt ngay
          </button>
        </div>
      </div>

      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-sm"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div
            className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b bg-white px-6">
              <span className="font-black text-slate-900">
                {currentImageIndex + 1} / {imageUrls.length}
              </span>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="flex items-center gap-2 font-black text-slate-500 transition-colors hover:text-red-500"
              >
                <span>Đóng</span>
                <X size={20} />
              </button>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50 p-4">
              {imageUrls.length > 1 && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
                  }}
                  className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:scale-105 hover:bg-white"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img
                src={imageUrls[currentImageIndex]}
                alt="Service"
                className="max-h-full max-w-full rounded-2xl object-contain shadow-sm"
              />

              {imageUrls.length > 1 && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:scale-105 hover:bg-white"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="flex h-24 items-center justify-center gap-2 overflow-x-auto border-t bg-white p-2">
                {imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-full aspect-[4/3] flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${index === currentImageIndex
                      ? "z-10 scale-105 ring-4 ring-[#0194f3] shadow-md"
                      : "opacity-40 hover:opacity-100"
                      }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ServiceDetailPage;
