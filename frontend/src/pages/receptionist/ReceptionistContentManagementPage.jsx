import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Type,
  X,
} from "lucide-react";
import apiClient from "../../api/client";
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
  uploadArticleImages,
} from "../../api/articles/articleApi";

const emptyForm = {
  title: "",
  summary: "",
  content: "",
  categoryId: "",
  tags: "",
  thumbnailUrl: "",
};

const emptyCategoryForm = {
  name: "",
};

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa duyệt" },
  { value: "approved", label: "Đã duyệt" },
];

const getStatusBadge = (article) => {
  if (article.isDeleted) {
    return "Đã ẩn";
  }

  return article.isApproved ? "Đã duyệt" : "Chưa duyệt";
};

const formatPublishedText = (article) => {
  if (!article.publishedAt) {
    return "Chờ admin duyệt";
  }

  return new Date(article.publishedAt).toLocaleString("vi-VN");
};

const ToolbarButton = ({ children, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
  >
    {children}
  </button>
);

const ReceptionistContentManagementPage = () => {
  const editorRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [uploadedImages, setUploadedImages] = useState([]);

  const loadPageData = async () => {
    setLoading(true);
    setError("");

    try {
      const approval = statusFilter === "all" ? undefined : statusFilter;
      const [articleData, categoryData] = await Promise.all([
        getArticles({
          scope: "author",
          approval,
          search: search.trim() || undefined,
        }),
        apiClient.get("/ArticleCategories"),
      ]);

      setArticles(articleData);
      setCategories(categoryData.data ?? []);
    } catch (fetchError) {
      setError(
        fetchError?.response?.data ||
          "Không tải được danh sách bài viết của lễ tân.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [statusFilter]);

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return articles;
    }

    return articles.filter((article) =>
      [article.title, article.summary, article.categoryName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [articles, search]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingArticle(null);
    setModalOpen(false);
    setShowCategoryForm(false);
    setCategoryForm(emptyCategoryForm);
    setUploadedImages([]);

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = async (article) => {
    setError("");

    try {
      const detail = await apiClient.get(`/Articles/${article.id}`, {
        params: { scope: "author" },
      });

      const nextContent = detail.data.content ?? "";

      setEditingArticle(detail.data);
      setFormData({
        title: detail.data.title ?? "",
        summary: detail.data.summary ?? "",
        content: nextContent,
        categoryId: detail.data.categoryId ? String(detail.data.categoryId) : "",
        tags: (detail.data.tags ?? []).join(", "),
        thumbnailUrl: detail.data.thumbnailUrl ?? "",
      });
      setUploadedImages(detail.data.thumbnailUrl ? [detail.data.thumbnailUrl] : []);
      setModalOpen(true);

      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = nextContent;
        }
      });
    } catch {
      setError("Không tải được chi tiết bài viết.");
    }
  };

  const syncEditorContent = () => {
    setFormData((current) => ({
      ...current,
      content: editorRef.current?.innerHTML ?? "",
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const applyCommand = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploadingImages(true);
    setError("");

    try {
      const urls = await uploadArticleImages(files, formData.title.trim());
      if (urls.length === 0) {
        throw new Error("Không tải được ảnh bài viết.");
      }

      setUploadedImages((current) => {
        const next = [...current, ...urls];
        return Array.from(new Set(next));
      });

      setFormData((current) => ({
        ...current,
        thumbnailUrl: current.thumbnailUrl || urls[0],
      }));

      urls.forEach((url) => {
        applyCommand(
          "insertHTML",
          `<p><img src="${url}" alt="Ảnh bài viết" style="max-width:100%;border-radius:18px;display:block;margin:12px 0;" /></p>`,
        );
      });
    } catch (uploadError) {
      setError(
        uploadError?.response?.data ||
          uploadError?.message ||
          "Không tải được ảnh bài viết.",
      );
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      return;
    }

    setCreatingCategory(true);
    setError("");

    try {
      const response = await apiClient.post("/ArticleCategories", {
        name: categoryForm.name.trim(),
      });

      const createdCategory = response.data;
      setCategories((current) => [...current, createdCategory]);
      setFormData((current) => ({
        ...current,
        categoryId: String(createdCategory.id),
      }));
      setCategoryForm(emptyCategoryForm);
      setShowCategoryForm(false);
    } catch (createError) {
      setError(createError?.response?.data || "Không tạo được danh mục.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    syncEditorContent();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: editorRef.current?.innerHTML?.trim() || "",
        categoryId: formData.categoryId ? Number(formData.categoryId) : "",
        tags: formData.tags.trim(),
        thumbnailUrl: formData.thumbnailUrl || uploadedImages[0] || "",
      };

      if (editingArticle) {
        await updateArticle(editingArticle.id, payload);
      } else {
        await createArticle(payload);
      }

      resetForm();
      await loadPageData();
    } catch (submitError) {
      setError(submitError?.response?.data || "Không lưu được bài viết.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (article) => {
    const confirmed = window.confirm(
      article.isApproved
        ? "Bài viết đã duyệt sẽ được xóa mềm. Tiếp tục?"
        : "Bài viết chưa duyệt sẽ bị xóa vĩnh viễn. Tiếp tục?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteArticle(article.id);
      await loadPageData();
    } catch (deleteError) {
      setError(deleteError?.response?.data || "Không xóa được bài viết.");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Quản lý bài viết</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Lễ tân được tạo, sửa và xóa bài viết. Khi sửa bài đã duyệt, bài sẽ quay lại trạng thái chờ duyệt.
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
              onClick={openCreateModal}
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
                placeholder="Tìm theo tiêu đề, mô tả, danh mục..."
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
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Bài viết", "Danh mục", "Ngày hiển thị", "Trạng thái", "Tác vụ"].map((header) => (
                    <th key={header} className="px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Đang tải bài viết...
                    </td>
                  </tr>
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Chưa có bài viết nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={article.thumbnailUrl || "https://placehold.co/120x120/e2e8f0/64748b?text=News"}
                            alt={article.title}
                            className="size-14 rounded-2xl object-cover ring-1 ring-gray-100"
                          />
                          <div>
                            <p className="text-sm font-black text-slate-900">{article.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">
                              {article.summary || "Chưa có mô tả ngắn."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {article.categoryName || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {formatPublishedText(article)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-600">
                          {getStatusBadge(article)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(article)}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
                          >
                            <Pencil className="size-4" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(article)}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600"
                          >
                            <Trash2 className="size-4" />
                            Xóa
                          </button>
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

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {editingArticle ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                </h2>
              </div>
              <button type="button" onClick={resetForm} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Tiêu đề</span>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Mô tả ngắn</span>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={3}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </label>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-gray-200 bg-slate-50 p-3">
                    <ToolbarButton title="Chữ đậm" onClick={() => applyCommand("bold")}>
                      <strong>B</strong>
                    </ToolbarButton>
                    <ToolbarButton title="Chữ nghiêng" onClick={() => applyCommand("italic")}>
                      <em>I</em>
                    </ToolbarButton>
                    <ToolbarButton title="Tiêu đề lớn" onClick={() => applyCommand("formatBlock", "<h2>")}>
                      <Type className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Chữ màu xanh" onClick={() => applyCommand("foreColor", "#0284c7")}>
                      <Palette className="size-4 text-sky-600" />
                    </ToolbarButton>
                    <ToolbarButton title="Chữ màu đỏ" onClick={() => applyCommand("foreColor", "#dc2626")}>
                      <Palette className="size-4 text-rose-600" />
                    </ToolbarButton>
                    <ToolbarButton title="Cỡ chữ lớn" onClick={() => applyCommand("fontSize", "5")}>
                      A+
                    </ToolbarButton>
                    <ToolbarButton title="Cỡ chữ vừa" onClick={() => applyCommand("fontSize", "3")}>
                      A
                    </ToolbarButton>
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                      <ImagePlus className="size-4" />
                      {uploadingImages ? "Đang tải ảnh..." : "Chèn ảnh"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncEditorContent}
                    className="min-h-[420px] rounded-[1.75rem] border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 text-slate-700 outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-[1.75rem] border border-dashed border-gray-200 bg-slate-50 p-5">
                <div className="space-y-3 rounded-[1.5rem] bg-white p-4 ring-1 ring-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Danh mục</span>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm((current) => !current)}
                      className="inline-flex items-center gap-1 rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-600"
                    >
                      <Plus className="size-3.5" />
                      Tạo danh mục
                    </button>
                  </div>

                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {showCategoryForm ? (
                    <div className="space-y-3 border-t border-gray-100 pt-3">
                      <input
                        value={categoryForm.name}
                        onChange={(event) => setCategoryForm({ name: event.target.value })}
                        placeholder="Nhập tên danh mục mới"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory}
                        className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                      >
                        {creatingCategory ? "Đang tạo..." : "Lưu danh mục"}
                      </button>
                    </div>
                  ) : null}
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Tags</span>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="tin tức, ưu đãi, sự kiện"
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </label>

                <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-gray-100">
                  <p className="text-sm font-bold text-slate-700">Ảnh bài viết</p>

                  <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                    <ImagePlus className="size-4" />
                    {uploadingImages ? "Đang tải ảnh..." : "Chọn nhiều ảnh"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {uploadedImages.length > 0 ? (
                    <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                      {uploadedImages.map((url, index) => (
                        <button
                          key={`${url}-${index}`}
                          type="button"
                          onClick={() =>
                            setFormData((current) => ({
                              ...current,
                              thumbnailUrl: url,
                            }))
                          }
                          className={`w-full overflow-hidden rounded-2xl text-left ring-2 transition ${
                            formData.thumbnailUrl === url ? "ring-sky-400" : "ring-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3 bg-slate-50 p-3">
                            <img
                              src={url}
                              alt={`Ảnh bài viết ${index + 1}`}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-800">
                                Ảnh bài viết {index + 1}
                              </p>
                              <p className="truncate text-xs font-medium text-slate-500">
                                {url.split("/").pop()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <img
                      src="https://placehold.co/600x400/e2e8f0/64748b?text=News"
                      alt="Xem trước bài viết"
                      className="mt-4 h-44 w-full rounded-[1.5rem] object-cover ring-1 ring-gray-200"
                    />
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImages || creatingCategory}
                    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {submitting ? "Đang lưu..." : editingArticle ? "Lưu thay đổi" : "Tạo bài viết"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ReceptionistContentManagementPage;
