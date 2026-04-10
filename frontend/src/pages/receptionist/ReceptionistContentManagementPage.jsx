import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ArticleTrashDialog from "../../components/articles/ArticleTrashDialog";
import { deleteArticle, getArticles, restoreArticle } from "../../api/articles/articleApi";
import { formatPreservedApiDateTime } from "../../utils/vietnamTime";

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "deleted", label: "Thùng rác" },
];

const getStatusBadge = (article) => {
  if (article.isDeleted) {
    return "Thùng rác";
  }

  return article.isApproved ? "Đã duyệt" : "Chờ duyệt";
};

const getStatusBadgeClass = (article) => {
  if (article.isDeleted) {
    return "bg-slate-100 text-slate-600";
  }

  return article.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600";
};

const formatPublishedText = (article) => {
  if (article.isDeleted && article.updatedAt) {
    return formatPreservedApiDateTime(article.updatedAt);
  }

  if (article.isApproved) {
    return formatPreservedApiDateTime(article.updatedAt || article.publishedAt || article.createdAt);
  }

  if (!article.publishedAt) {
    return "Chờ admin duyệt";
  }

  return formatPreservedApiDateTime(article.publishedAt);
};

const getArticlePriority = (article) => {
  if (!article.isDeleted && !article.isApproved) return 0;
  if (!article.isDeleted && article.isApproved) return 1;
  return 2;
};

const canShowApprovedActions = (article) => article.isApproved && !article.isDeleted;

const ReceptionistContentManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [dialogState, setDialogState] = useState({ open: false, mode: "delete", article: null });

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const approval = statusFilter === "all" ? undefined : statusFilter;
      const articleData = await getArticles({
        scope: "author",
        approval,
        search: search.trim() || undefined,
      });

      setArticles(articleData);
    } catch (fetchError) {
      setError(fetchError?.response?.data || "Không tải được danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const nextArticles = !keyword
      ? articles
      : articles.filter((article) =>
          [article.title, article.summary, article.categoryName, article.slug]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(keyword)),
        );

    return [...nextArticles].sort((articleA, articleB) => {
      const priorityDiff = getArticlePriority(articleA) - getArticlePriority(articleB);
      if (priorityDiff !== 0) return priorityDiff;

      const timeA = new Date(articleA.updatedAt || articleA.publishedAt || articleA.createdAt || 0).getTime();
      const timeB = new Date(articleB.updatedAt || articleB.publishedAt || articleB.createdAt || 0).getTime();

      return timeB - timeA;
    });
  }, [articles, search]);

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

  const handleDialogConfirm = async () => {
    if (!dialogState.article) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      if (dialogState.mode === "restore") {
        await restoreArticle(dialogState.article.id);
      } else {
        await deleteArticle(dialogState.article.id);
      }

      setDialogState({ open: false, mode: "delete", article: null });
      await loadPageData();
    } catch (actionRequestError) {
      setActionError(actionRequestError?.response?.data || "Không thực hiện được thao tác.");
    } finally {
      setActionLoading(false);
    }
  };

  const editorState = { canGoBack: true, from: `${location.pathname}${location.search}` };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Quản lý bài viết</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Lễ tân tạo bài, gửi duyệt, xem bài và quản lý các bài đã vào thùng rác.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadPageData}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200"
            >
              <RefreshCw className="size-4" />
              Làm mới
            </button>
            <button
              type="button"
              onClick={() => navigate("/receptionist/posts/new", { state: editorState })}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100"
            >
              <Plus className="size-4" />
              Tạo bài viết
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
                    loadPageData();
                  }
                }}
                placeholder="Tìm theo tiêu đề, mô tả, slug..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              {statusOptions.map((option) => (
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
                  {["Bài viết", "Danh mục", "Slug", "Ngày hiển thị", "Trạng thái", "Tác vụ"].map((header) => (
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
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Chưa có bài viết nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
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
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">
                        {article.categoryName || "-"}
                      </td>
                      <td className="px-4 py-4 align-top text-xs font-semibold text-slate-500 break-all">
                        {article.slug || "-"}
                      </td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">
                        {formatPublishedText(article)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusBadgeClass(article)}`}>
                          {getStatusBadge(article)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          {canShowApprovedActions(article) ? (
                            <>
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
                                onClick={() => navigate(`/receptionist/posts/${article.id}/edit`, { state: editorState })}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"
                              >
                                <Pencil className="size-4" />
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => openActionDialog("delete", article)}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600"
                              >
                                <Trash2 className="size-4" />
                                Thùng rác
                              </button>
                            </>
                          ) : article.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => openActionDialog("restore", article)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600"
                            >
                              <RotateCcw className="size-4" />
                              Khôi phục
                            </button>
                          ) : (
                            <span className="inline-flex items-center rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                              Chờ admin duyệt
                            </span>
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
        onConfirm={handleDialogConfirm}
      />
    </>
  );
};

export default ReceptionistContentManagementPage;
