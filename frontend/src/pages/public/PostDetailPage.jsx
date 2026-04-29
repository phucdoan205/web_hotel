import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MessageCircle, Reply, Send, Calendar, User, ArrowLeft } from "lucide-react";
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

  const canInteract = auth?.role?.toLowerCase() !== "housekeeping";
  const htmlContent = useMemo(() => normalizeArticleContent(article?.content), [article?.content]);

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
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero Header */}
      <div className="relative h-[400px] w-full md:h-[500px]">
        <img
          src={article.thumbnailUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"}
          alt={article.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/10" />
        
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-5 pb-12 lg:px-8">
          <Link to="/articles" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white">
            <ArrowLeft className="size-4" /> Quay lại Góc Khám Phá
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full bg-[#0194f3] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-sm">
              {article.categoryName || "Tin tức"}
            </span>
            {article.tags?.map((tag) => (
              <span key={tag} className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl lg:leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <div className="-mt-6 relative z-10 rounded-[2.5rem] bg-white p-6 shadow-xl sm:p-10 md:p-12">
          
          {/* Author Info Bar */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <User className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{article.authorName || "Đội ngũ Khách sạn"}</p>
                <p className="text-xs font-semibold text-slate-500">Biên tập viên</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <Calendar className="size-4" />
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="size-4" />
                {comments.length} bình luận
              </span>
            </div>
          </div>

          {/* Summary / Intro */}
          {article.summary && (
            <p className="mb-8 text-lg font-semibold leading-relaxed text-slate-600 border-l-4 border-[#0194f3] pl-5 italic">
              {article.summary}
            </p>
          )}

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
        </div>

        {/* Comments Section */}
        <div className="mt-12 rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-10">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
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
  );
};

export default PostDetailPage;
