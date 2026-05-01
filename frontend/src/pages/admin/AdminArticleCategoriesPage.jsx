import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  FolderOpen,
  AlertCircle
} from "lucide-react";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategoryStatus 
} from "../../api/admin/articleCategoriesApi";

const AdminArticleCategoriesPage = () => {
  const [modalState, setModalState] = useState({ open: false, mode: "create", category: null });
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["article-categories"],
    queryFn: getCategories,
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["article-categories"]);
      closeModal();
      showMessage("success", "Đã tạo danh mục mới thành công!");
    },
    onError: (error) => {
      showMessage("error", error.response?.data || "Có lỗi xảy ra khi tạo danh mục.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["article-categories"]);
      closeModal();
      showMessage("success", "Đã cập nhật danh mục thành công!");
    },
    onError: (error) => {
      showMessage("error", error.response?.data || "Có lỗi xảy ra khi cập nhật danh mục.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["article-categories"]);
      showMessage("success", "Đã xóa danh mục thành công!");
    },
    onError: (error) => {
      // Logic requirement: show popup if cannot delete
      const errorMsg = error.response?.data || "Không thể xóa danh mục này.";
      alert(errorMsg);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleCategoryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["article-categories"]);
    },
    onError: (error) => {
      showMessage("error", "Không thể thay đổi trạng thái danh mục.");
    }
  });

  const openCreateModal = () => {
    setModalState({ open: true, mode: "create", category: null });
    setCategoryName("");
  };

  const openEditModal = (category) => {
    setModalState({ open: true, mode: "edit", category });
    setCategoryName(category.name);
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create", category: null });
    setCategoryName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (modalState.mode === "create") {
      createMutation.mutate({ name: categoryName.trim() });
    } else {
      updateMutation.mutate({ 
        id: modalState.category.id, 
        payload: { name: categoryName.trim() } 
      });
    }
  };

  const handleDelete = (category) => {
    if (category.articleCount > 0) {
      alert("Không thể xóa danh mục này vì vẫn còn bài viết đang sử dụng.");
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleToggleStatus = (category) => {
    const action = category.status ? "Ẩn" : "Hiện";
    if (window.confirm(`Xác nhận ${action} danh mục "${category.name}" trên bài viết?`)) {
      toggleStatusMutation.mutate(category.id);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý danh mục</h1>
          <p className="text-sm font-medium text-slate-500">
            Quản lý các nhóm bài viết cho hệ thống tin tức.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1F649C] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#164e7a] hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold animate-in fade-in slide-in-from-top-1 duration-200 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
        }`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : !categories?.length ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
            <div className="rounded-full bg-slate-50 p-6">
              <FolderOpen size={48} className="text-slate-300" />
            </div>
            <p className="font-bold">Chưa có danh mục nào được tạo</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Tên danh mục</th>
                    <th className="px-6 py-4 text-center">Ẩn / Hiện</th>
                    <th className="px-6 py-4 text-center">Số bài viết</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((cat) => (
                    <tr key={cat.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className={`text-sm font-black transition-opacity ${cat.status ? "text-slate-700" : "text-slate-400"}`}>
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={cat.status}
                              onChange={() => handleToggleStatus(cat)}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#1F649C] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                          cat.articleCount > 0 ? "bg-blue-50 text-[#1F649C]" : "bg-slate-100 text-slate-500"
                        }`}>
                          {cat.articleCount} bài viết
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(cat)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-[#1F649C] hover:shadow-sm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500 hover:shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {categories.length > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="text-xs font-bold text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, categories.length)} trong tổng số {categories.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.ceil(categories.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        currentPage === page
                          ? "bg-[#1F649C] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === Math.ceil(categories.length / itemsPerPage)}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modalState.open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              {modalState.mode === "create" ? "Tạo danh mục mới" : "Chỉnh sửa danh mục"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Tên danh mục nên ngắn gọn và súc tích.</p>
            
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tên danh mục</label>
                <input
                  autoFocus
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="VD: Tin tức khách sạn, Khuyến mãi..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#1F649C] focus:bg-white"
                />
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading || !categoryName.trim()}
                  className="flex-[2] rounded-2xl bg-[#1F649C] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#164e7a] disabled:opacity-50 disabled:shadow-none"
                >
                  {createMutation.isLoading || updateMutation.isLoading ? (
                    <Loader2 className="mx-auto animate-spin" size={20} />
                  ) : (
                    modalState.mode === "create" ? "Xác nhận tạo" : "Cập nhật"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticleCategoriesPage;
