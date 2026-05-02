import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, RefreshCw, RotateCcw, Search, Trash2, Edit, MapPin, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArticleTrashDialog from "../../components/articles/ArticleTrashDialog";
import { approveArticle, deleteArticle, getArticles, hardDeleteArticle, restoreArticle } from "../../api/articles/articleApi";
import { hasPermission } from "../../utils/permissions";
import { formatPreservedApiDateTime } from "../../utils/vietnamTime";

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "approved", label: "Đã duyệt" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "deleted", label: "Thùng rác" },
];

const ArticleActionMenu = ({
  article,
  onApprove,
  onEdit,
  onAction,
  canEditContent,
  canPublishContent,
  canDeleteContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = () => setIsOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-9 items-center justify-center rounded-xl transition hover:bg-slate-100 text-slate-500"
      >
        <MoreVertical className="size-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => {
                window.open(`/articles/${article.slug || article.id}`, "_blank");
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-600 hover:bg-sky-50"
            >
              <Eye className="size-4" /> Xem bài viết
            </button>

            {canEditContent && (
              <button
                onClick={() => {
                  onEdit(article.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Edit className="size-4" /> Chỉnh sửa
              </button>
            )}

            {article.isDeleted ? (
              canDeleteContent && (
                <button
                  onClick={() => {
                    onAction("restore", article);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50"
                >
                  <RotateCcw className="size-4" /> Khôi phục
                </button>
              )
            ) : !article.isApproved ? (
              <>
                {canPublishContent && (
                  <button
                    onClick={() => {
                      onApprove(article.id);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="size-4" /> Duyệt bài
                  </button>
                )}
                {canDeleteContent && (
                  <button
                    onClick={() => {
                      onAction("hardDelete", article);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-4" /> Xóa vĩnh viễn
                  </button>
                )}
              </>
            ) : (
              canDeleteContent && (
                <button
                  onClick={() => {
                    onAction("delete", article);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="size-4" /> Thùng rác
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [dialogState, setDialogState] = useState({ open: false, mode: "delete", article: null });
  const canCreateContent = hasPermission("CREATE_CONTENT");
  const canEditContent = hasPermission("EDIT_CONTENT");
  const canDeleteContent = hasPermission("DELETE_CONTENT");
  const canPublishContent = hasPermission("PUBLISH_CONTENT");

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
    setCurrentPage(1);
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
              Bài chờ duyệt có thể được duyệt hoặc xóa hẳn. Bài đã duyệt sẽ hiển thị và có thể chuyển vào thùng rác.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreateContent ? (
              <button
                type="button"
                onClick={() => navigate("/admin/articles/new")}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm"
              >
                Tạo bài viết
              </button>
            ) : null}

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

        <div className="rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100">
          <div>
            <table className="min-w-full table-fixed text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[35%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Bài viết</th>
                  <th className="w-[10%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Tác giả</th>
                  <th className="w-[10%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Danh mục</th>
                  <th className="w-[10%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Địa điểm</th>
                  <th className="w-[10%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th className="w-[10%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Ngày hiển thị</th>
                  <th className="w-[15%] px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Đang tải bài viết...
                    </td>
                  </tr>
                ) : sortedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Không có bài viết phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  sortedArticles
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((article) => (
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
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">{article.authorName || "-"}</td>
                        <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">{article.categoryName || "-"}</td>
                        <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">
                          {article.attractionName ? (
                            <div className="flex items-center gap-1.5 text-sky-600">
                              <MapPin className="size-3.5" />
                              <span>{article.attractionName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusBadgeClass(article)}`}>
                            {getStatusLabel(article)}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-sm font-semibold text-slate-600">
                          {getDisplayTime(article) ? formatPreservedApiDateTime(getDisplayTime(article)) : "Chưa hiển thị"}
                        </td>
                        <td className="px-4 py-4 align-top text-right">
                          <ArticleActionMenu
                            article={article}
                            onApprove={handleApprove}
                            onEdit={(id) => navigate(`/admin/articles/${id}/edit`)}
                            onAction={openActionDialog}
                            canEditContent={canEditContent}
                            canPublishContent={canPublishContent}
                            canDeleteContent={canDeleteContent}
                          />
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && sortedArticles.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-slate-50/50 px-6 py-4">
              <div className="text-xs font-bold text-slate-500">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedArticles.length)} trong tổng số {sortedArticles.length} bài viết
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: Math.ceil(sortedArticles.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-sky-600 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === Math.ceil(sortedArticles.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
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
