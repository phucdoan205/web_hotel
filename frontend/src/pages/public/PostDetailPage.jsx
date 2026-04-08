import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle, Reply, Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { createArticleComment, getArticleDetail } from "../../api/articles/articleApi";
import { getStoredAuth } from "../../utils/authStorage";

const flattenUsers = (comments) => {
  const users = new Map();

  const visit = (items) => {
    items.forEach((item) => {
      users.set(item.userId, { id: item.userId, name: item.userName });
      if (item.replies?.length) {
        visit(item.replies);
      }
    });
  };

  visit(comments);
  return Array.from(users.values());
};

const CommentItem = ({ comment, onReply }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <img
          src={comment.userAvatarUrl || "https://placehold.co/64x64/e2e8f0/64748b?text=U"}
          alt={comment.userName}
          className="size-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-900">{comment.userName}</span>
            <span className="text-xs font-semibold text-slate-400">
              {new Date(comment.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {comment.taggedUserName ? (
              <span className="mr-1 font-bold text-sky-600">@{comment.taggedUserName}</span>
            ) : null}
            {comment.content}
          </p>
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-sky-600"
          >
            <Reply className="size-3.5" />
            Trả lời
          </button>
        </div>
      </div>

      {comment.replies?.length ? (
        <div className="mt-4 space-y-3 border-l border-slate-200 pl-5">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const PostDetailPage = () => {
  const { id } = useParams();
  const auth = getStoredAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [taggedUserId, setTaggedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canInteract = auth?.role?.toLowerCase() !== "housekeeping";
  const selectableUsers = useMemo(() => flattenUsers(comments), [comments]);

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

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const nextComments = await createArticleComment(article.id, {
        content: commentText.trim(),
        parentCommentId: replyTarget?.id ?? null,
        taggedUserId: taggedUserId ? Number(taggedUserId) : replyTarget?.userId ?? null,
      });

      setComments(nextComments);
      setCommentText("");
      setReplyTarget(null);
      setTaggedUserId("");
    } catch (submitError) {
      setError(submitError?.response?.data || "Không gửi được bình luận.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm font-semibold text-gray-400">Đang tải bài viết...</div>;
  }

  if (!article) {
    return <div className="py-20 text-center text-sm font-semibold text-gray-400">{String(error || "Không tìm thấy bài viết.")}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <article className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100">
          <img
            src={article.thumbnailUrl || "https://placehold.co/1200x600/e2e8f0/64748b?text=News"}
            alt={article.title}
            className="h-[360px] w-full object-cover"
          />

          <div className="space-y-6 p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-600">
                {article.categoryName || "Tin tức"}
              </span>
              {article.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>

            <div>
              <h1 className="text-4xl font-black leading-tight text-slate-900">
                {article.title}
              </h1>
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
                {article.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
              <span>Tác giả: {article.authorName || "Hotel"}</span>
              <span>Đăng lúc {new Date(article.publishedAt || article.createdAt).toLocaleString("vi-VN")}</span>
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="size-4" />
                {comments.length} chủ đề trao đổi
              </span>
            </div>

            <div
              className="prose max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
          </div>
        </article>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-900">Trao đổi bài viết</h2>
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

          {canInteract && auth ? (
            <form onSubmit={handleSubmitComment} className="mt-6 space-y-4">
              {replyTarget ? (
                <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
                  Đang trả lời {replyTarget.userName}
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTarget(null);
                      setTaggedUserId("");
                    }}
                    className="ml-3 text-sky-900"
                  >
                    Bỏ qua
                  </button>
                </div>
              ) : null}

              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={4}
                  placeholder="Viết bình luận, đặt câu hỏi hoặc trả lời bài viết..."
                  className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />

                <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Tag người dùng
                    </span>
                    <select
                      value={taggedUserId}
                      onChange={(event) => setTaggedUserId(event.target.value)}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                    >
                      <option value="">Không tag</option>
                      {selectableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    <Send className="size-4" />
                    {submitting ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              Đăng nhập bằng tài khoản không phải housekeeping để tham gia trao đổi.
            </div>
          )}

          <div className="mt-8 space-y-4">
            {comments.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-400">
                Chưa có bình luận nào.
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onReply={setReplyTarget} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetailPage;
