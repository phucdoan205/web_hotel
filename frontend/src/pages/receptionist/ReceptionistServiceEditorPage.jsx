import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Layers,
  Layout,
  Type,
  BadgeDollarSign,
  Package,
  Upload,
  Loader2
} from "lucide-react";
import { useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import servicesApi from "../../api/admin/servicesApi";
import toast from "react-hot-toast";

const QuillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

const QuillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "link",
];

const ReceptionistServiceEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    unit: "",
    status: true,
    description: "",
    thumbnailUrl: "",
    images: [],
  });

  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const cats = await servicesApi.getServiceCategories();
      setCategories(cats);

      if (isEditMode) {
        const service = await servicesApi.getServiceDetail(id);
        setFormData({
          name: service.name,
          categoryId: service.categoryId ? String(service.categoryId) : "",
          price: String(service.price),
          unit: service.unit,
          status: service.status,
          description: service.description,
          thumbnailUrl: service.thumbnailUrl || "",
          images: service.images || [],
        });
      }
    } catch (error) {
      toast.error("Không tải được dữ liệu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSubmitting(true);
      const urls = await servicesApi.uploadImages([file], formData.name);
      if (urls.length > 0) {
        setFormData(prev => ({ ...prev, thumbnailUrl: urls[0] }));
        toast.success("Tải ảnh đại diện thành công.");
      }
    } catch (error) {
      toast.error("Không thể tải ảnh lên.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setSubmitting(true);
      const urls = await servicesApi.uploadImages(files, formData.name);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
      toast.success(`Đã tải lên ${urls.length} ảnh.`);
    } catch (error) {
      toast.error("Không thể tải ảnh lên.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
      price: Number(formData.price),
    };

    try {
      if (isEditMode) {
        await servicesApi.updateService(id, payload);
        toast.success("Cập nhật dịch vụ thành công.");
      } else {
        await servicesApi.createService(payload);
        toast.success("Tạo dịch vụ thành công.");
      }
      navigate("/admin/pos");
    } catch (error) {
      toast.error(error.response?.data || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/admin/pos")}
            className="group mb-4 flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-sky-600"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Quay lại danh sách
          </button>
          <h1 className="text-3xl font-black text-slate-900">
            {isEditMode ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Thiết lập thông tin chi tiết, hình ảnh và mô tả cho dịch vụ của bạn.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 hover:shadow-xl disabled:opacity-50"
        >
          {submitting ? (
            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <Save className="size-4" />
          )}
          {isEditMode ? "Lưu thay đổi" : "Xuất bản dịch vụ"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tên dịch vụ</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Coca Cola, Massage chân..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Giá bán (VNĐ)</label>
                  <div className="relative">
                    <BadgeDollarSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-5 text-sm font-bold outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Đơn vị tính</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="VD: Lon, Chai, Giờ..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <Type className="size-4 text-sky-500" />
                  Mô tả chi tiết
                </label>
                <div className="quill-editor rounded-3xl border border-slate-200 overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={QuillModules}
                    formats={QuillFormats}
                    className="h-64"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium ml-1">
                  Mô tả chi tiết giúp khách hàng hiểu rõ hơn về dịch vụ bạn cung cấp.
                </p>
            </div>
          </div>

          <div className="space-y-6">
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
                <div key={index} className="group relative aspect-square overflow-hidden rounded-3xl border border-slate-100 ring-4 ring-white shadow-sm">
                  <img src={url} alt={`Gallery ${index}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
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

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-400">Thiết lập hiển thị</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Nhóm dịch vụ</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-bold outline-none transition focus:border-sky-400 focus:bg-white"
                  >
                    <option value="">Chọn nhóm...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-400">Ảnh đại diện</h3>
            
            <div className="space-y-4">
              <div 
                onClick={() => thumbnailInputRef.current?.click()}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl border-2 border-slate-100 ring-4 ring-white shadow-sm transition hover:border-sky-400"
              >
                {formData.thumbnailUrl ? (
                  <img src={formData.thumbnailUrl} alt="Thumbnail" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 text-slate-300">
                    <ImageIcon className="mb-2 size-10" />
                    <span className="text-xs font-bold text-slate-400">Chưa có ảnh nền</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
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
              
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .quill-editor .ql-toolbar {
          border: none !important;
          background: #f8fafc !important;
          padding: 12px !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .quill-editor .ql-container {
          border: none !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
        }
        .quill-editor .ql-editor {
          min-height: 200px !important;
          padding: 20px !important;
        }
        .quill-editor .ql-editor.ql-blank::before {
          left: 20px !important;
          font-style: normal !important;
          color: #94a3b8 !important;
          font-weight: 500 !important;
        }
      `}</style>
    </div>
  );
};

export default ReceptionistServiceEditorPage;
