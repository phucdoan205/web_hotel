import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MessageCircle, Reply, Send, Calendar, User, ArrowLeft, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { createArticleComment, getArticleDetail } from "../../api/articles/articleApi";
import { getStoredAuth } from "../../utils/authStorage";

const normalizeArticleContent = (content) => {
  if (!content) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

const CommentComposer = ({
  auth,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  replyTarget,
  onCancelReply,
}) => (
  <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4 sm:p-6">
    {replyTarget ? (
      <div className="flex items-center justify-between rounded-xl bg-[#0194f3]/10 px-4 py-3 text-sm font-semibold text-[#017bc0]">
        <span>Đang trả lời <span className="font-black">{replyTarget.userName}</span></span>
        <button type="button" onClick={onCancelReply} className="text-[#01539d] hover:underline">
          Hủy
        </button>
      </div>
    ) : null}

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
          placeholder={replyTarget ? `Nhập câu trả lời...` : "Chia sẻ cảm nghĩ của bạn về bài viết này..."}
          className="w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0194f3] focus:ring-4 focus:ring-[#0194f3]/10"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !value.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0194f3] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#017bc0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="size-4" />
            )}
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
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
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const PostDetailPage = () => {
  const { id } = useParams();
  const auth = getStoredAuth();
  const contentRef = useRef(null);
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedContent, setExpandedContent] = useState(false);
  const [canExpandContent, setCanExpandContent] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const canInteract = auth?.role?.toLowerCase() !== "housekeeping";
  const htmlContent = useMemo(() => normalizeArticleContent(article?.content), [article?.content]);

  const imageUrls = useMemo(() => {
    if (!article) return [];
    return [...new Set([article.thumbnailUrl, ...(article.galleryUrls || [])].filter(Boolean))];
  }, [article]);

  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isGalleryOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadArticle = async () => {
      setLoading(true);
      setError("");
      try {
        const detail = await getArticleDetail(id, { scope: "public" });
        setArticle(detail);
        setComments(detail.comments ?? []);
      } catch (fetchError) {
        setError(fetchError?.response?.data || "Không tải được bài viết.");
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setCanExpandContent(node.scrollHeight > 800);
  }, [htmlContent, expandedContent]);

  const handleReply = (comment) => {
    setReplyTarget(comment);
    setCommentText("");
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || !article) return;
    setSubmitting(true);
    try {
      const nextComments = await createArticleComment(article.id, {
        content: commentText.trim(),
        parentCommentId: replyTarget?.id ?? null,
        taggedUserId: replyTarget?.userId ?? null,
      });
      setComments(nextComments);
      setCommentText("");
      setReplyTarget(null);
    } catch (submitError) {
      setError(submitError?.response?.data || "Không gửi được bình luận.");
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
          <p className="text-sm font-semibold text-slate-500">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-lg font-bold text-slate-900">{String(error || "Không tìm thấy bài viết.")}</p>
          <Link to="/articles" className="mt-4 inline-block font-semibold text-[#0194f3] hover:underline">
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-6 md:pt-10">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        
        {/* Breadcrumbs / Back */}
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Link to="/articles" className="hover:text-[#0194f3] transition-colors">Góc Khám Phá</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#0194f3] truncate">{article.categoryName || "Tin tức"}</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-900 truncate hidden sm:inline">{article.title}</span>
        </div>

        {/* Title & Summary */}
        <div className="mb-6">
          <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl mb-4">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-base font-medium text-slate-600 mb-4 border-l-4 border-[#0194f3] pl-4">
              {article.summary}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="rounded bg-[#003b95] px-2.5 py-1 text-xs font-bold text-white">
            {article.categoryName || "Tin tức"}
          </span>
          {article.tags?.map((tag) => (
            <span key={tag} className="rounded bg-[#003b95] px-2.5 py-1 text-xs font-bold text-white">
              {tag}
            </span>
          ))}
          <div className="ml-auto flex items-center gap-6 text-sm font-semibold text-slate-500">
             <span className="flex items-center gap-1.5">
               <Calendar className="size-4" />
               {new Date(article.publishedAt || article.createdAt).toLocaleDateString("vi-VN")}
             </span>
             <span className="flex items-center gap-1.5">
               <MessageCircle className="size-4" />
               {comments.length} bình luận
             </span>
          </div>
        </div>

        {/* Image Grid (Booking.com style) */}
        {imageUrls.length > 0 && (
          <div 
            className="mb-12 grid gap-2 overflow-hidden rounded-xl cursor-pointer group h-[300px] sm:h-[400px] md:h-[460px] md:grid-cols-3"
            onClick={() => { setIsGalleryOpen(true); setCurrentImageIndex(0); }}
          >
            <div className={`${imageUrls.length >= 2 ? "md:col-span-2" : "md:col-span-3"} h-full overflow-hidden relative`}>
              <img src={imageUrls[0]} alt="Ảnh chính" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>

            {imageUrls.length >= 2 && (
               <div className={`hidden md:grid gap-2 ${imageUrls.length >= 5 ? "grid-cols-2 grid-rows-2" : imageUrls.length === 4 ? "grid-cols-1 grid-rows-3" : imageUrls.length === 3 ? "grid-cols-1 grid-rows-2" : "grid-cols-1 grid-rows-1"}`}>
                 {imageUrls.slice(1, 5).map((url, idx) => {
                   const isLast = idx === 3 || (imageUrls.length < 5 && idx === imageUrls.length - 2);
                   return (
                     <div key={idx} className="relative h-full overflow-hidden">
                       <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                       {isLast && imageUrls.length > 5 && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold flex-col gap-1.5 transition-colors hover:bg-black/40">
                           <div className="flex gap-1 mb-1">
                             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                           </div>
                           <span className="text-sm">Hiển thị tất cả hình ảnh</span>
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        )}

        {/* Content & Comments Wrapper */}
        <div className="mx-auto max-w-4xl">
          
          {/* HTML Content */}
          <div className="relative">
            <div
              ref={contentRef}
              className={`prose prose-lg prose-slate max-w-none prose-headings:font-black prose-a:text-[#0194f3] prose-img:rounded-2xl transition-all duration-500 ${expandedContent ? "" : "max-h-[800px] overflow-hidden"}`}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            {!expandedContent && canExpandContent && (
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Expand Button */}
          {!expandedContent && canExpandContent && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setExpandedContent(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-[#0194f3]"
              >
                Đọc tiếp bài viết <ChevronDown className="size-4" />
              </button>
            </div>
          )}

          {/* Map Section */}
          {article.attractionName && (
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="size-6 text-[#0194f3]" />
                Vị trí: {article.attractionName}
              </h3>
              <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100 bg-slate-50">
                <iframe
                  title="Google Maps"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(article.attractionName + " Việt Nam")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between pb-5">
              <h2 className="text-2xl font-black text-slate-900">Bình luận ({comments.length})</h2>
              {!canInteract && (
                <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-500">
                  Tài khoản của bạn bị hạn chế
                </span>
              )}
            </div>

          {error && (
            <div className="mt-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
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
            />
          )}

          {!auth && (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-10 text-center">
              <p className="mb-4 text-sm font-semibold text-slate-500">Vui lòng đăng nhập để tham gia bình luận</p>
              <Link to="/login" className="rounded-xl bg-[#0194f3] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#017bc0]">
                Đăng nhập ngay
              </Link>
            </div>
          )}

          <div className="mt-10 space-y-6">
            {comments.length === 0 ? (
              <div className="py-10 text-center text-sm font-medium text-slate-400">
                Hãy là người đầu tiên chia sẻ cảm nghĩ về bài viết này.
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
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>

      {/* GALLERY MODAL OVERLAY */}
      {isGalleryOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div 
            className="relative flex flex-col w-full h-full max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b bg-white px-6">
              <span className="font-bold text-slate-900">{currentImageIndex + 1} / {imageUrls.length}</span>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="flex items-center gap-2 text-slate-500 font-bold hover:text-red-500 transition-colors"
              >
                <span>Đóng</span>
                <X size={20} />
              </button>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center bg-slate-50 p-4">
              <div className="relative flex-1 w-full flex items-center justify-center">
                {imageUrls.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1)); }}
                    className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                <img
                  src={imageUrls[currentImageIndex]}
                  alt="Ảnh bài viết"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                />

                {imageUrls.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0)); }}
                    className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white hover:scale-105"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {imageUrls.length > 1 && (
              <div className="h-24 border-t bg-white p-2 flex items-center justify-center gap-2 overflow-x-auto">
                {imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative h-full aspect-[4/3] flex-shrink-0 overflow-hidden rounded-md transition-all duration-300 ${
                      i === currentImageIndex ? "ring-2 ring-[#0194f3] scale-105 z-10 shadow-sm" : "opacity-50 hover:opacity-100"
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

export default PostDetailPage;
