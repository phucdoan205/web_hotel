import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutGrid, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  MoreVertical,
  Loader2,
  FolderOpen
} from "lucide-react";
import { getCategories, createCategory } from "../../api/admin/articleCategoriesApi";

const AdminArticleCategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["article-categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["article-categories"]);
      setIsModalOpen(false);
      setNewCategoryName("");
      setMessage({ type: "success", text: "Đã tạo danh mục mới thành công!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: error.response?.data || "Có lỗi xảy ra khi tạo danh mục." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createMutation.mutate({ name: newCategoryName.trim() });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý danh mục</h1>
          <p className="text-sm font-medium text-slate-500">
            Tạo và quản lý các nhóm bài viết cho hệ thống tin tức.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1F649C] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#164e7a] hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold ${
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tên danh mục</th>
                  <th className="px-6 py-4">Số bài viết</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">#{cat.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1F649C]">
                          <LayoutGrid size={20} />
                        </div>
                        <span className="text-sm font-black text-slate-700">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                        -- bài viết
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-[#1F649C] hover:shadow-sm">
                          <Edit2 size={16} />
                        </button>
                        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500 hover:shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black tracking-tight text-slate-900">Tạo danh mục mới</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Tên danh mục nên ngắn gọn và súc tích.</p>
            
            <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tên danh mục</label>
                <input
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="VD: Tin tức khách sạn, Khuyến mãi..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#1F649C] focus:bg-white"
                />
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || !newCategoryName.trim()}
                  className="flex-[2] rounded-2xl bg-[#1F649C] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#164e7a] disabled:opacity-50 disabled:shadow-none"
                >
                  {createMutation.isLoading ? <Loader2 className="mx-auto animate-spin" size={20} /> : "Xác nhận tạo"}
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
