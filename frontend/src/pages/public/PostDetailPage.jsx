import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MessageCircle, Reply, Send } from "lucide-react";
import { useParams } from "react-router-dom";
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
  <form onSubmit={onSubmit} className="space-y-3">
    {replyTarget ? (
      <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
        Đang trả lời {replyTarget.userName}
        <button type="button" onClick={onCancelReply} className="ml-3 text-sky-900">
          Bỏ qua
        </button>
      </div>
    ) : null}

    <div className="flex items-start gap-3">
      <img
        src={auth?.avatarUrl || "https://placehold.co/64x64/e2e8f0/64748b?text=U"}
        alt={auth?.fullName || "User"}
        className="mt-1 size-10 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1 space-y-3">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          placeholder={replyTarget ? `Trả lời ${replyTarget.userName}...` : "Viết bình luận, đặt câu hỏi hoặc trả lời bài viết..."}
          className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            <Send className="size-4" />
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
    <div className="flex gap-3">
      <img
        src={comment.userAvatarUrl || "https://placehold.co/64x64/e2e8f0/64748b?text=U"}
        alt={comment.userName}
        className="size-10 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="rounded-[1.5rem] bg-slate-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-900">{comment.userName}</span>
            <span className="text-xs font-semibold text-slate-400">
              {new Date(comment.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {comment.taggedUserName ? (
              <span className="mr-1 font-bold text-sky-600">@{comment.taggedUserName}</span>
            ) : null}
            {comment.content}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onReply(comment)}
          className="mt-2 inline-flex items-center gap-2 pl-2 text-xs font-black uppercase tracking-wide text-slate-500"
        >
          <Reply className="size-3.5" />
          Trả lời
        </button>

        {isReplyingHere && canInteract && auth ? (
          <div className="mt-4">
            <CommentComposer
              auth={auth}
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleSubmitComment}
              isSubmitting={submitting}
              replyTarget={replyTarget}
              onCancelReply={cancelReply}
            />
          </div>
        ) : null}

        {comment.replies?.length ? (
          <div className="mt-4 space-y-4 border-l border-slate-200 pl-5">
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
    if (!node) {
      return;
    }

    setCanExpandContent(node.scrollHeight > 720);
  }, [htmlContent, expandedContent]);

  const handleReply = (comment) => {
    setReplyTarget(comment);
    setCommentText("");
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || !article) {
      return;
    }

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
    return <div className="py-20 text-center text-sm font-semibold text-gray-400">Đang tải bài viết...</div>;
  }

  if (!article) {
    return <div className="py-20 text-center text-sm font-semibold text-gray-400">{String(error || "Không tìm thấy bài viết.")}</div>;
  }

  return (
    <div className="min-h-screen bg-[#eef2f7] pb-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <article className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
            <div className="relative">
              <img
                src={article.thumbnailUrl || "https://placehold.co/1200x600/e2e8f0/64748b?text=News"}
                alt={article.title}
                className="h-[320px] w-full object-cover sm:h-[420px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent px-6 py-8 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide backdrop-blur">
                    {article.categoryName || "Tin tức"}
                  </span>
                  {article.tags?.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-4xl">
                  {article.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-medium text-slate-100 sm:text-base">
                  {article.summary}
                </p>
              </div>
            </div>

            <div className="border-b border-slate-100 px-6 py-4">
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
                <span>Tác giả: {article.authorName || "Hotel"}</span>
                <span>Đăng lúc {new Date(article.publishedAt || article.createdAt).toLocaleString("vi-VN")}</span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="size-4" />
                  {comments.length} chủ đề trao đổi
                </span>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="relative">
                <div
                  ref={contentRef}
                  className={`prose max-w-none overflow-hidden break-words text-slate-700 transition-all ${expandedContent ? "" : "max-h-[720px]"}`}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {!expandedContent && canExpandContent ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent" />
                ) : null}
              </div>

              {canExpandContent ? (
                <button
                  type="button"
                  onClick={() => setExpandedContent((current) => !current)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700"
                >
                  <ChevronDown className={`size-4 transition ${expandedContent ? "rotate-180" : ""}`} />
                  {expandedContent ? "Thu gọn" : "Xem thêm"}
                </button>
              ) : null}
            </div>
          </article>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-900">Bình luận</h2>
              {!canInteract ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  Housekeeping không được tham gia
                </span>
              ) : null}
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {String(error)}
              </div>
            ) : null}

            {canInteract && auth && !replyTarget ? (
              <div className="mt-6">
                <CommentComposer
                  auth={auth}
                  value={commentText}
                  onChange={setCommentText}
                  onSubmit={handleSubmitComment}
                  isSubmitting={submitting}
                  replyTarget={null}
                  onCancelReply={cancelReply}
                />
              </div>
            ) : null}

            {!canInteract || !auth ? (
              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                Đăng nhập bằng tài khoản không phải housekeeping để tham gia trao đổi.
              </div>
            ) : null}

            <div className="mt-8 space-y-5">
              {comments.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-400">
                  Chưa có bình luận nào.
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
