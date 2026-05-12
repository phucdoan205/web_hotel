import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Save,
  Strikethrough,
  Trash2,
  Type,
  Underline,
  Upload,
  X,
  MapPin,
  Map,
  Compass,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getAttraction, createAttraction, updateAttraction, uploadImages } from "../../api/admin/attractionsApi";

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

const fontSizes = [
  { value: "1", label: "10" },
  { value: "2", label: "12" },
  { value: "3", label: "14" },
  { value: "4", label: "16" },
  { value: "5", label: "18" },
  { value: "6", label: "24" },
  { value: "7", label: "32" },
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

const emptyForm = {
  name: "",
  category: "",
  distanceKm: "",
  address: "",
  mapEmbedLink: "",
  latitude: "",
  longitude: "",
  isActive: true,
  description: "",
  imageUrl: "",
  images: [],
};

const AdminAttractionEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [blockFormat, setBlockFormat] = useState("p");
  const [fontFamily, setFontFamily] = useState(fontFamilies[0].value);
  const [fontSize, setFontSize] = useState("4");

  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const contentImageInputRef = useRef(null);
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);

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
      description: editorRef.current?.innerHTML ?? "",
    }));
  }, []);

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
    const currentFontSize = parseFloat(computed?.fontSize || "16");
    const closestFontSize = fontSizes.reduce((closest, option) => {
      const optionSize = Number(option.label);
      return Math.abs(optionSize - currentFontSize) < Math.abs(Number(closest.label) - currentFontSize)
        ? option
        : closest;
    }, fontSizes[3]);

    setBlockFormat(block?.tagName?.toLowerCase() === "div" ? "p" : block?.tagName?.toLowerCase() || "p");
    setFontFamily(computed?.fontFamily || fontFamilies[0].value);
    setFontSize(closestFontSize.value);
  }, []);

  const applyCommand = useCallback((command, value = null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    syncEditorContent();
    updateToolbarState();
  }, [syncEditorContent, updateToolbarState]);

  const loadData = useCallback(async () => {
    try {
      if (isEditMode) {
        const attraction = await getAttraction(id);
        setFormData({
          name: attraction.name || "",
          category: attraction.category || "",
          distanceKm: attraction.distanceKm !== null ? String(attraction.distanceKm) : "",
          address: attraction.address || "",
          mapEmbedLink: attraction.mapEmbedLink || "",
          latitude: attraction.latitude !== null ? String(attraction.latitude) : "",
          longitude: attraction.longitude !== null ? String(attraction.longitude) : "",
          isActive: attraction.isActive,
          description: attraction.description || "",
          imageUrl: attraction.imageUrl || "",
          images: attraction.images || [],
        });

        requestAnimationFrame(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = attraction.description || "";
            updateToolbarState();
          }
        });
      } else {
        setFormData(emptyForm);
        requestAnimationFrame(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = "";
          }
        });
      }
    } catch (error) {
      toast.error("Không tải được dữ liệu địa điểm.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode, updateToolbarState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
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

  const handleFontSizeChange = (event) => {
    const value = event.target.value;
    setFontSize(value);
    applyCommand("fontSize", value);
  };

  const handleInsertLink = () => {
    const url = window.prompt("Nhập link cần chèn");
    if (!url) {
      return;
    }
    applyCommand("createLink", url);
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSubmitting(true);
      const urls = await uploadImages([file], formData.name);
      if (urls.length > 0) {
        setFormData((current) => ({ ...current, imageUrl: urls[0] }));
        toast.success("Tải ảnh đại diện thành công.");
      }
    } catch (error) {
      toast.error("Không thể tải ảnh lên.");
    } finally {
      setSubmitting(false);
      event.target.value = "";
    }
  };

  const insertHtmlAtCaret = (html) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    saveSelection();
    syncEditorContent();
    updateToolbarState();
  };

  const handleContentImageUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    try {
      setSubmitting(true);
      const urls = await uploadImages(files, formData.name);
      if (!urls.length) throw new Error("Không tải được ảnh.");

      const html = urls
        .map((url) => `<p><img src="${url}" alt="attraction-content" style="max-width:100%;border-radius:16px;margin:16px 0;" /></p>`)
        .join("");

      insertHtmlAtCaret(html);
      toast.success("Đã chèn ảnh vào mô tả.");
    } catch (error) {
      toast.error("Không thể tải ảnh lên mô tả.");
    } finally {
      setSubmitting(false);
      event.target.value = "";
    }
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    try {
      setSubmitting(true);
      const urls = await uploadImages(files, formData.name);
      setFormData((current) => ({
        ...current,
        images: [...current.images, ...urls],
      }));
      toast.success(`Đã tải lên ${urls.length} ảnh.`);
    } catch (error) {
      toast.error("Không thể tải ảnh lên.");
    } finally {
      setSubmitting(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    syncEditorContent();

    const payload = {
      ...formData,
      description: editorRef.current?.innerHTML?.trim() || "",
      distanceKm: formData.distanceKm ? Number(formData.distanceKm) : null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
    };

    try {
      if (isEditMode) {
        await updateAttraction(id, payload);
        toast.success("Cập nhật địa điểm thành công.");
      } else {
        await createAttraction(payload);
        toast.success("Tạo địa điểm thành công.");
      }
      navigate("/admin/attractions");
    } catch (error) {
      toast.error(error.response?.data?.message || typeof error.response?.data === 'string' ? error.response?.data : "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-10 px-6 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/admin/attractions")}
            className="group mb-4 flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-sky-600"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Quay lại danh sách
          </button>
          <h1 className="text-3xl font-black text-slate-900">
            {isEditMode ? "Chỉnh sửa địa điểm" : "Tạo địa điểm mới"}
          </h1>
          <p className="mt-2 font-medium text-slate-500">
            Thiết lập thông tin chi tiết, hình ảnh và mô tả cho điểm đến.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 hover:shadow-xl disabled:opacity-50"
          >
            {submitting ? (
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="size-4" />
            )}
            {isEditMode ? "Lưu thay đổi" : "Lưu địa điểm"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="ml-1 text-sm font-bold text-slate-700">Tên địa điểm</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: VinWonders, Suối Tiên..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="ml-1 text-sm font-bold text-slate-700">Địa chỉ</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ cụ thể"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-slate-700">Danh mục</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="VD: Khu vui chơi, Thiên nhiên..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-slate-700">Khoảng cách (km)</label>
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    name="distanceKm"
                    type="number"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-5 text-sm font-bold outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="ml-1 text-sm font-bold text-slate-700">Google Maps Embed Link</label>
                <div className="relative">
                  <Map className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    name="mapEmbedLink"
                    value={formData.mapEmbedLink}
                    onChange={handleChange}
                    placeholder="Dán mã nhúng iframe của Google Maps"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  />
                </div>
                <p className="ml-1 text-[11px] font-medium text-slate-400">
                  Hệ thống tự lấy tọa độ kinh độ và vĩ độ từ link Google Maps nếu có.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Type className="size-4 text-sky-500" />
                Mô tả chi tiết
              </label>
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

                  <select
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    onMouseDown={saveSelection}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                    title="Cỡ chữ"
                  >
                    {fontSizes.map((item) => (
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
                    disabled={submitting}
                  >
                    <ImageIcon className="size-4" />
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
                  data-placeholder="Nhập mô tả chi tiết địa điểm..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <ImageIcon className="size-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Bộ sưu tập ảnh</h2>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={galleryInputRef}
                onChange={handleGalleryUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {formData.images.map((url, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-3xl border border-slate-100 ring-4 ring-white shadow-sm"
                >
                  <img
                    src={url}
                    alt={`Gallery ${index}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="rounded-xl bg-white/20 p-3 text-white backdrop-blur-md transition hover:bg-rose-500"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-500"
              >
                <Upload className="mb-2 size-6" />
                <span className="text-xs font-bold">Tải ảnh lên</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-400">Trạng thái</h3>

            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-700">Hiển thị địa điểm</span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  formData.isActive ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block size-6 rounded-full bg-white transition ${
                    formData.isActive ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-400">Ảnh đại diện</h3>

            <div className="space-y-4">
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl border-2 border-slate-100 ring-4 ring-white shadow-sm transition hover:border-sky-400"
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Thumbnail"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 text-slate-300">
                    <ImageIcon className="mb-2 size-10" />
                    <span className="text-xs font-bold text-slate-400">Chưa có ảnh đại diện</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                  <div className="rounded-xl bg-white/80 p-3 text-sky-600 backdrop-blur-sm">
                    <Upload className="size-6" />
                  </div>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={thumbnailInputRef}
                onChange={handleThumbnailUpload}
                className="hidden"
              />

              {formData.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, imageUrl: "" }))}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600"
                >
                  <X className="size-3.5" />
                  Xóa ảnh đại diện
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          cursor: text;
        }
        blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default AdminAttractionEditorPage;
