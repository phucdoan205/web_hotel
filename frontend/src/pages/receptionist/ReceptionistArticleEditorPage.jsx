import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Eraser,
  Highlighter,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MapPin,
  Minus,
  Plus,
  Quote,
  Strikethrough,
  Tag,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/client";
import { createArticle, updateArticle, uploadArticleImages } from "../../api/articles/articleApi";

const emptyForm = {
  title: "",
  summary: "",
  content: "",
  categoryId: "",
  attractionId: "",
  tags: [],
  thumbnailUrl: "",
  galleryUrls: [],
};

const emptyCategoryForm = {
  name: "",
};

const textFormats = [
  { value: "p", label: "Normal" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
];

const fontFamilies = [
  { value: "Arial, sans-serif", label: "Sans Serif" },
  { value: "Georgia, serif", label: "Serif" },
  { value: "'Courier New', monospace", label: "Monospace" },
  { value: "'Times New Roman', serif", label: "Classic" },
];

const ToolbarButton = ({ children, onClick, title, disabled = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="h-8 w-px bg-gray-200" />;

const ReceptionistArticleEditorPage = ({ scope = "author", basePath = "/admin/articles" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);
  const coverInputRef = useRef(null);
  const contentImageInputRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const [attractions, setAttractions] = useState([]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [error, setError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingArticle, setEditingArticle] = useState(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [blockFormat, setBlockFormat] = useState("p");
  const [fontFamily, setFontFamily] = useState(fontFamilies[0].value);

  const goBack = useCallback(() => {
    if (location.state?.canGoBack) {
      navigate(-1);
      return;
    }
    navigate(basePath);
  }, [location.state, navigate]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedSelectionRef.current) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedSelectionRef.current);
  };

  const syncEditorContent = useCallback(() => {
    setFormData((current) => ({
      ...current,
      content: editorRef.current?.innerHTML ?? "",
    }));
  }, []);

  const applyCommand = useCallback((command, value = null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    syncEditorContent();
  }, [syncEditorContent]);

  const updateToolbarState = useCallback(() => {
    if (!editorRef.current) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const anchorNode = selection.anchorNode;
    const element = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
    const block = element?.closest("h1, h2, h3, p, div, blockquote");
    const computed = element ? window.getComputedStyle(element) : null;

    setBlockFormat(block?.tagName?.toLowerCase() === "div" ? "p" : block?.tagName?.toLowerCase() || "p");
    setFontFamily(computed?.fontFamily || fontFamilies[0].value);
  }, []);

  const loadEditorData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [categoryResponse, attractionResponse, articleResponse] = await Promise.all([
        apiClient.get("/ArticleCategories"),
        apiClient.get("/Attractions/public", { params: { pageSize: 1000 } }),
        isEditMode
          ? apiClient.get(`/Articles/${id}`, { params: { scope } })
          : Promise.resolve({ data: null }),
      ]);

      setCategories(categoryResponse.data ?? []);
      // Attractions API returns a PagedResponse with an 'items' property
      setAttractions(attractionResponse.data?.items ?? attractionResponse.data ?? []);

      if (!isEditMode || !articleResponse.data) {
        setEditingArticle(null);
        setFormData(emptyForm);
        setRemoveThumbnail(false);
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
        return;
      }

      const detail = articleResponse.data;
      const nextContent = detail.content ?? "";

      setEditingArticle(detail);
      setFormData({
        title: detail.title ?? "",
        summary: detail.summary ?? "",
        content: nextContent,
        categoryId: detail.categoryId ? String(detail.categoryId) : "",
        attractionId: detail.attractionId ? String(detail.attractionId) : "",
        tags: detail.tags ?? [],
        thumbnailUrl: detail.thumbnailUrl ?? "",
        galleryUrls: detail.galleryUrls ?? [],
      });
      setRemoveThumbnail(false);

      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = nextContent;
          updateToolbarState();
        }
      });
    } catch (fetchError) {
      setError(fetchError?.response?.data || "Không tải được dữ liệu bài viết.");
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode, updateToolbarState]);

  useEffect(() => {
    loadEditorData();
  }, [loadEditorData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleBlockFormatChange = (event) => {
    const value = event.target.value;
    setBlockFormat(value);
    applyCommand("formatBlock", value === "p" ? "<p>" : `<${value}>`);
  };

  const handleFontFamilyChange = (event) => {
    const value = event.target.value;
    setFontFamily(value);
    applyCommand("fontName", value);
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

  const handleCoverUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploadingCover(true);
    setError("");

    try {
      const urls = await uploadArticleImages(files, formData.title.trim());
      if (!urls.length) {
        throw new Error("Không tải được ảnh.");
      }

      setFormData((current) => ({
        ...current,
        thumbnailUrl: urls[0],
        galleryUrls: urls.slice(1),
      }));
      setRemoveThumbnail(false);
    } catch (uploadError) {
      setError(uploadError?.response?.data || uploadError?.message || "Không tải được ảnh.");
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  };

  const handleRemoveCover = () => {
    setFormData((current) => ({
      ...current,
      thumbnailUrl: "",
      galleryUrls: [],
    }));
    setRemoveThumbnail(Boolean(editingArticle?.thumbnailUrl));
  };

  const insertHtmlAtCaret = (html) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    saveSelection();
    syncEditorContent();
  };

  const handleContentImageUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploadingContentImage(true);
    setError("");

    try {
      const urls = await uploadArticleImages(files, formData.title.trim());
      if (!urls.length) {
        throw new Error("Không tải được ảnh nội dung.");
      }

      const html = urls
        .map(
          (url) =>
            `<p><img src="${url}" alt="article-content" style="max-width:100%;border-radius:16px;margin:16px 0;" /></p>`,
        )
        .join("");

      insertHtmlAtCaret(html);
    } catch (uploadError) {
      setError(uploadError?.response?.data || uploadError?.message || "Không tải được ảnh nội dung.");
    } finally {
      setUploadingContentImage(false);
      event.target.value = "";
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt("Nhập link cần chèn");
    if (!url) {
      return;
    }

    applyCommand("createLink", url);
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
        attractionId: formData.attractionId ? Number(formData.attractionId) : "",
        tags: (formData.tags ?? []).join(", "),
        thumbnailUrl: formData.thumbnailUrl || "",
        galleryUrls: formData.galleryUrls || [],
        removeThumbnail,
      };

      if (isEditMode) {
        await updateArticle(id, payload);
      } else {
        await createArticle(payload);
      }

      navigate(basePath);
    } catch (submitError) {
      setError(submitError?.response?.data || "Không lưu được bài viết.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-gray-200"
          >
            <ArrowLeft className="size-4" />
            Trở về
          </button>
          <h1 className="mt-4 text-3xl font-black text-gray-900">
            {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {isEditMode ? "Cập nhật đầy đủ nội dung, ảnh nền và bố cục bài viết." : "Soạn bài viết với thanh công cụ đầy đủ và ảnh hiển thị tách riêng."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-600"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="article-editor-form"
            disabled={submitting || uploadingCover || uploadingContentImage || creatingCategory}
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Lưu bài viết"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
          {String(error)}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[2rem] bg-white px-6 py-16 text-center text-sm font-semibold text-gray-400 shadow-sm ring-1 ring-gray-100">
          Đang tải bài viết...
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100">
          <form id="article-editor-form" onSubmit={handleSubmit} className="grid gap-6 overflow-x-hidden p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-700">Tiêu đề</span>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-700">Mô tả ngắn</span>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-gray-200 bg-slate-50">
                  <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-3 py-3">
                    <select
                      value={blockFormat}
                      onChange={handleBlockFormatChange}
                      onMouseDown={saveSelection}
                      className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                    >
                      {textFormats.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={fontFamily}
                      onChange={handleFontFamilyChange}
                      onMouseDown={saveSelection}
                      className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                    >
                      {fontFamilies.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <ToolbarDivider />

                    <ToolbarButton title="Canh trái" onClick={() => applyCommand("justifyLeft")}>
                      <AlignLeft className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Canh giữa" onClick={() => applyCommand("justifyCenter")}>
                      <AlignCenter className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Canh phải" onClick={() => applyCommand("justifyRight")}>
                      <AlignRight className="size-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton title="Chữ đậm" onClick={() => applyCommand("bold")}>
                      <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Chữ nghiêng" onClick={() => applyCommand("italic")}>
                      <Italic className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Gạch chân" onClick={() => applyCommand("underline")}>
                      <Underline className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Gạch ngang" onClick={() => applyCommand("strikeThrough")}>
                      <Strikethrough className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Màu chữ" onClick={() => applyCommand("foreColor", "#1d4ed8")}>
                      <span className="text-sm font-black text-blue-700">A</span>
                    </ToolbarButton>
                    <ToolbarButton title="Tô nền chữ" onClick={() => applyCommand("hiliteColor", "#fef08a")}>
                      <Highlighter className="size-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton title="Danh sách chấm" onClick={() => applyCommand("insertUnorderedList")}>
                      <List className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Danh sách số" onClick={() => applyCommand("insertOrderedList")}>
                      <ListOrdered className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Chèn link" onClick={handleInsertLink}>
                      <LinkIcon className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      title="Chèn ảnh vào nội dung"
                      onClick={() => contentImageInputRef.current?.click()}
                      disabled={uploadingContentImage}
                    >
                      <ImagePlus className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Blockquote" onClick={() => applyCommand("formatBlock", "<blockquote>")}>
                      <Quote className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Đường kẻ ngang" onClick={() => applyCommand("insertHorizontalRule")}>
                      <Minus className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Xóa format" onClick={() => applyCommand("removeFormat")}>
                      <Eraser className="size-4" />
                    </ToolbarButton>

                    <input
                      ref={contentImageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleContentImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncEditorContent}
                    onMouseUp={() => {
                      saveSelection();
                      updateToolbarState();
                    }}
                    onKeyUp={() => {
                      saveSelection();
                      updateToolbarState();
                    }}
                    onFocus={() => {
                      saveSelection();
                      updateToolbarState();
                    }}
                    className="min-h-[460px] max-w-full overflow-x-hidden px-5 py-4 text-base leading-8 text-slate-700 outline-none [overflow-wrap:anywhere]"
                  />
                </div>
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

              <div className="space-y-3 rounded-[1.5rem] bg-white p-4 ring-1 ring-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Địa điểm liên quan</span>
                  <MapPin className="size-4 text-sky-500" />
                </div>

                <select
                  name="attractionId"
                  value={formData.attractionId}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Không gắn địa điểm</option>
                  {attractions.map((attraction) => (
                    <option key={attraction.id} value={attraction.id}>
                      {attraction.name}
                    </option>
                  ))}
                </select>
                <p className="px-1 text-[10px] font-medium text-slate-400">
                  Gắn địa điểm giúp người đọc dễ dàng tìm thấy vị trí được nhắc tới trong bài viết.
                </p>
              </div>

              <div className="space-y-3 rounded-[1.5rem] bg-white p-4 ring-1 ring-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Tags</span>
                  <Tag className="size-4 text-sky-500" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(formData.tags ?? []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-gray-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index),
                          }));
                        }}
                        className="rounded-full p-0.5 hover:bg-slate-200 hover:text-rose-500 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập tag rồi nhấn Enter..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (value && !(formData.tags ?? []).includes(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            tags: [...(prev.tags ?? []), value],
                          }));
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                  <p className="mt-2 px-1 text-[10px] font-medium text-slate-400">
                    Gõ tên tag và nhấn phím Enter để thêm. Bạn có thể thêm nhiều tag để bài viết dễ được tìm thấy hơn.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-gray-100">
                <p className="text-sm font-bold text-slate-700">Ảnh bài viết</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Bạn có thể chọn nhiều ảnh cùng lúc. Ảnh đầu tiên sẽ được dùng làm ảnh nền bên ngoài bài viết.
                </p>

                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                >
                  {uploadingCover ? "Đang tải ảnh..." : "Chọn ảnh bài viết"}
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCoverUpload}
                  className="hidden"
                />

                {formData.thumbnailUrl ? (
                  <div className="mt-4 space-y-3">
                    <div className="overflow-hidden rounded-[1.5rem] border border-gray-100">
                      <img
                        src={formData.thumbnailUrl}
                        alt="Ảnh nền bài viết"
                        className="h-48 w-full object-cover"
                      />
                      <div className="flex items-center justify-between gap-3 bg-slate-50 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">Ảnh nền hiện tại</p>
                          <p className="truncate text-xs font-medium text-slate-500">
                            {formData.thumbnailUrl.split("/").pop()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCover}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                          Xóa tất cả ảnh
                        </button>
                      </div>
                    </div>

                    {formData.galleryUrls?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {formData.galleryUrls.map((url, idx) => (
                          <div key={idx} className="relative aspect-video overflow-hidden rounded-xl border border-gray-100">
                            <img src={url} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <img
                    src="https://placehold.co/600x400/e2e8f0/64748b?text=Gallery"
                    alt="Xem trước ảnh"
                    className="mt-4 h-44 w-full rounded-[1.5rem] object-cover ring-1 ring-gray-200"
                  />
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReceptionistArticleEditorPage;
