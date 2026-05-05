import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MessageCircle, Reply, Send, User, ArrowLeft, ChevronLeft, ChevronRight, X, Star, BadgeDollarSign, ShieldCheck, Clock } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import publicServicesApi from "../../api/public/publicServicesApi";
import { getStoredAuth } from "../../utils/authStorage";

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
        <span>Đang trả lời <span className="font-black">{replyTarget.userName}</span></span>
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
          placeholder={replyTarget ? `Nhập câu trả lời...` : "Chia sẻ cảm nghĩ của bạn về dịch vụ này..."}
          className="w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0194f3] focus:ring-4 focus:ring-[#0194f3]/10"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !value.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0194f3] px-6 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-[#017bc0] disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex items-center gap-0.5 ml-2">
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
  const { id } = useParams();
  const auth = getStoredAuth();
  const contentRef = useRef(null);
  const [service, setService] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const canInteract = auth?.role?.toLowerCase() !== "housekeeping";

  const imageUrls = useMemo(() => {
    if (!service) return [];
    return [...new Set([service.thumbnailUrl, ...(service.images || [])].filter(Boolean))];
  }, [service]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadService = async () => {
      setLoading(true);
      setError("");
      try {
        const detail = await publicServicesApi.getPublicServiceDetail(id);
        setService(detail);
        setComments(detail.comments ?? []);
      } catch (fetchError) {
        setError(fetchError?.response?.data || "Không tải được dịch vụ.");
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

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
        rating: replyTarget ? null : (rating > 0 ? rating : null),
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="mb-4 size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0194f3]"></div>
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
    <div className="min-h-screen bg-white pb-24 pt-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link to="/services" className="hover:text-[#0194f3] transition-colors">Dịch vụ</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#0194f3]">{service.categoryName || "Chung"}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 truncate">{service.name}</span>
        </div>

        {/* Title Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl mb-4">
              {service.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
               {service.averageRating > 0 && (
                 <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-600 border border-amber-100">
                   <Star size={14} fill="#fbbf24" className="text-amber-400" />
                   <span className="text-slate-900">{service.averageRating.toFixed(1)}</span>
                 </div>
               )}
               <span className="flex items-center gap-1.5">
                 <MessageCircle className="size-4" />
                 {comments.length} đánh giá
               </span>
               <span className="flex items-center gap-1.5">
                 <Clock className="size-4" />
                 {service.unit ? `Đơn vị: ${service.unit}` : "Luôn sẵn sàng"}
               </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start md:items-end">
             <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Giá chỉ từ</span>
             <div className="text-4xl font-black text-[#f12c2c]">{formattedPrice}</div>
          </div>
        </div>

        {/* Gallery Section (Booking.com Style) */}
        {imageUrls.length > 0 && (
          <div 
            className="mb-12 grid gap-2 overflow-hidden rounded-3xl cursor-pointer group h-[300px] sm:h-[400px] md:h-[500px] md:grid-cols-4"
            onClick={() => { setIsGalleryOpen(true); setCurrentImageIndex(0); }}
          >
            <div className="md:col-span-2 h-full overflow-hidden">
              <img src={imageUrls[0]} alt="Main" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            
            <div className="hidden md:grid col-span-2 gap-2 grid-cols-2 grid-rows-2">
               {imageUrls.slice(1, 5).map((url, idx) => (
                 <div key={idx} className="relative h-full overflow-hidden">
                   <img src={url} alt={`Gallery ${idx}`} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                   {idx === 3 && imageUrls.length > 5 && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-sm uppercase tracking-widest backdrop-blur-[2px]">
                        +{imageUrls.length - 5} Ảnh khác
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-black text-slate-900 flex items-center gap-3">
               <div className="size-8 rounded-xl bg-[#0194f3]/10 flex items-center justify-center text-[#0194f3]">
                 <ChevronDown size={20} />
               </div>
               Mô tả dịch vụ
            </h2>
            <div 
              ref={contentRef}
              className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-img:rounded-3xl"
              dangerouslySetInnerHTML={{ __html: service.description }}
            />

            {/* Extra images if any */}
            {imageUrls.length > 5 && (
               <div className="mt-12 grid grid-cols-2 gap-4">
                  {imageUrls.slice(5).map((url, i) => (
                    <img key={i} src={url} alt="" className="rounded-3xl w-full aspect-video object-cover" />
                  ))}
               </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
               <div className="rounded-3xl bg-slate-50 p-8 ring-1 ring-slate-100">
                  <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-500">Tại sao nên chọn?</h3>
                  <ul className="space-y-4">
                     <li className="flex gap-3 text-sm font-bold text-slate-700">
                        <ShieldCheck className="size-5 shrink-0 text-[#0194f3]" />
                        <span>Dịch vụ uy tín, chất lượng đảm bảo</span>
                     </li>
                     <li className="flex gap-3 text-sm font-bold text-slate-700">
                        <BadgeDollarSign className="size-5 shrink-0 text-[#0194f3]" />
                        <span>Giá cả cạnh tranh, ưu đãi khách lưu trú</span>
                     </li>
                     <li className="flex gap-3 text-sm font-bold text-slate-700">
                        <User className="size-5 shrink-0 text-[#0194f3]" />
                        <span>Phục vụ tận tâm, chuyên nghiệp 24/7</span>
                     </li>
                  </ul>
                  
                  <button className="mt-10 w-full rounded-2xl bg-[#0194f3] py-4 text-sm font-black text-white shadow-lg shadow-[#0194f3]/20 transition-all hover:bg-[#017bc0] hover:scale-[1.02] active:scale-95">
                     Đặt ngay dịch vụ này
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 pt-12 border-t border-slate-100">
          <div className="flex flex-col items-center justify-between mb-10 sm:flex-row">
            <h2 className="text-2xl font-black text-slate-900 mb-4 sm:mb-0">Đánh giá & Nhận xét ({comments.length})</h2>
            {service.averageRating > 0 && (
               <div className="flex items-center gap-3 bg-amber-50 px-5 py-2 rounded-2xl border border-amber-100">
                  <div className="text-3xl font-black text-slate-900">{service.averageRating.toFixed(1)}</div>
                  <div className="flex flex-col">
                     <div className="flex gap-0.5">
                       {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.round(service.averageRating) ? "#fbbf24" : "none"} className={s <= Math.round(service.averageRating) ? "text-amber-400" : "text-slate-200"} />)}
                     </div>
                     <span className="text-[10px] font-black uppercase text-amber-700">Đánh giá trung bình</span>
                  </div>
               </div>
            )}
          </div>

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
              <div className="py-20 text-center text-sm font-bold text-slate-400 italic">
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

      {/* GALLERY MODAL OVERLAY */}
      {isGalleryOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div 
            className="relative flex flex-col w-full h-full max-w-5xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b bg-white px-6">
              <span className="font-black text-slate-900">{currentImageIndex + 1} / {imageUrls.length}</span>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="flex items-center gap-2 text-slate-500 font-black hover:text-red-500 transition-colors"
              >
                <span>Đóng</span>
                <X size={20} />
              </button>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center bg-slate-50 p-4 overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1)); }}
                  className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105 disabled:opacity-0"
                >
                  <ChevronLeft size={24} />
                </button>

                <img
                  src={imageUrls[currentImageIndex]}
                  alt="Service"
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-sm"
                />

                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0)); }}
                  className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105"
                >
                  <ChevronRight size={24} />
                </button>
            </div>
            
            {imageUrls.length > 1 && (
              <div className="h-24 border-t bg-white p-2 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
                {imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative h-full aspect-[4/3] flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                      i === currentImageIndex ? "ring-4 ring-[#0194f3] scale-105 z-10 shadow-md" : "opacity-40 hover:opacity-100"
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
  );
};

export default ServiceDetailPage;
