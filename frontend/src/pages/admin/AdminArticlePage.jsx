import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, RefreshCw, RotateCcw, Search, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArticleTrashDialog from "../../components/articles/ArticleTrashDialog";
import { approveArticle, deleteArticle, getArticles, hardDeleteArticle, restoreArticle } from "../../api/articles/articleApi";
import { formatPreservedApiDateTime } from "../../utils/vietnamTime";

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "approved", label: "Đã duyệt" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "deleted", label: "Thùng rác" },
];

const getStatusBadgeClass = (article) => {
  if (article.isDeleted) {
    return "bg-slate-100 text-slate-600";
  }

  return article.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600";
};

const getStatusLabel = (article) => {
  if (article.isDeleted) {
    return "Thùng rác";
  }

  return article.isApproved ? "Đã duyệt" : "Chờ duyệt";
};

const getDisplayTime = (article) => {
  if (article.isDeleted) {
    return article.updatedAt || article.publishedAt || article.createdAt || null;
  }

  if (article.isApproved) {
    return article.updatedAt || article.publishedAt || article.createdAt || null;
  }

  return article.publishedAt || null;
};

const getArticlePriority = (article) => {
  if (!article.isDeleted && !article.isApproved) return 0;
  if (!article.isDeleted && article.isApproved) return 1;
  return 2;
};

const AdminArticlePage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [dialogState, setDialogState] = useState({ open: false, mode: "delete", article: null });

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const approval = filter === "all" ? undefined : filter;
      const data = await getArticles({
        scope: "admin",
        approval,
        search: search.trim() || undefined,
      });
      setArticles(data);
    } catch (fetchError) {
      setError(fetchError?.response?.data || "Không tải được bài viết cho admin.");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const sortedArticles = useMemo(() => {
    return [...articles].sort((articleA, articleB) => {
      const priorityDiff = getArticlePriority(articleA) - getArticlePriority(articleB);
      if (priorityDiff !== 0) return priorityDiff;

      const timeA = new Date(
        articleA.updatedAt || articleA.publishedAt || articleA.createdAt || 0,
      ).getTime();
      const timeB = new Date(
        articleB.updatedAt || articleB.publishedAt || articleB.createdAt || 0,
      ).getTime();

      return timeB - timeA;
    });
  }, [articles]);

  const handleApprove = async (articleId) => {
    try {
      await approveArticle(articleId);
      await loadArticles();
    } catch (approveError) {
      setError(approveError?.response?.data || "Không duyệt được bài viết.");
    }
  };

  const openActionDialog = (mode, article) => {
    setActionError("");
    setDialogState({ open: true, mode, article });
  };

  const closeActionDialog = () => {
    if (actionLoading) {
      return;
    }

    setActionError("");
    setDialogState({ open: false, mode: "delete", article: null });
  };

  const handleActionConfirm = async () => {
    if (!dialogState.article) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      if (dialogState.mode === "restore") {
        await restoreArticle(dialogState.article.id);
      } else if (dialogState.mode === "hardDelete") {
        await hardDeleteArticle(dialogState.article.id);
      } else {
        await deleteArticle(dialogState.article.id);
      }

      setDialogState({ open: false, mode: "delete", article: null });
      await loadArticles();
    } catch (actionRequestError) {
      setActionError(actionRequestError?.response?.data || "Không thực hiện được thao tác.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Duyệt bài viết</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Bài chờ duyệt có thể duyệt hoặc xóa hẳn. Bài đã duyệt sẽ có xem và chuyển vào thùng rác.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/articles/new')}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm"
            >
              Tạo bài viết
            </button>

            <button
              type="button"
              onClick={loadArticles}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200"
            >
              <RefreshCw className="size-4" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadArticles();
                  }
                }}
                placeholder="Tìm theo tiêu đề, tác giả, slug..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
            {String(error)}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Bài viết", "Tác giả", "Danh mục", "Trạng thái", "Ngày hiển thị", "Tác vụ"].map((header) => (
                    <th key={header} className="px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Đang tải bài viết...
                    </td>
                  </tr>
                ) : sortedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Không có bài viết phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  sortedArticles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <img
                            src={article.thumbnailUrl || "https://placehold.co/120x120/e2e8f0/64748b?text=News"}
                            alt={article.title}
                            className="size-14 shrink-0 rounded-2xl object-cover ring-1 ring-gray-100"
                          />
                          <div className="min-w-0">
                            <p className="break-words text-sm font-black text-slate-900">{article.title}</p>
                            <p className="mt-1 line-clamp-2 break-words text-xs font-medium text-slate-500">
                              {article.summary || "Chưa có mô tả ngắn."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">{article.authorName || "-"}</td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">{article.categoryName || "-"}</td>
                      <td className="px-4 py-4 align-top">
                        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusBadgeClass(article)}`}>
                          {getStatusLabel(article)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">
                        {getDisplayTime(article) ? formatPreservedApiDateTime(getDisplayTime(article)) : "Chưa hiển thị"}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/articles/${article.slug || article.id}`)}
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700"
                          >
                            <Eye className="size-4" />
                            Xem
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-gray-700 ring-1 ring-gray-200"
                          >
                            <Edit className="size-4" />
                            Chỉnh sửa
                          </button>

                          {article.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => openActionDialog("restore", article)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600"
                            >
                              <RotateCcw className="size-4" />
                              Khôi phục
                            </button>
                          ) : !article.isApproved ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(article.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600"
                              >
                                <CheckCircle2 className="size-4" />
                                Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => openActionDialog("hardDelete", article)}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600"
                              >
                                <Trash2 className="size-4" />
                                Không duyệt
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openActionDialog("delete", article)}
                              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600"
                            >
                              <Trash2 className="size-4" />
                              Chuyển thùng rác
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ArticleTrashDialog
        open={dialogState.open}
        article={dialogState.article}
        mode={dialogState.mode}
        isPending={actionLoading}
        error={actionError}
        onClose={closeActionDialog}
        onConfirm={handleActionConfirm}
      />
    </>
  );
};

export default AdminArticlePage;


