import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  FolderOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { 
  getMemberships, 
  createMembership, 
  updateMembership, 
  deleteMembership 
} from "../../api/admin/membershipApi";

const AdminMembershipPage = () => {
  const [modalState, setModalState] = useState({ open: false, mode: "create", membership: null });
  const [formData, setFormData] = useState({ tierName: "", minPoints: "", discountPercent: "", description: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const itemsPerPage = 7;
  const queryClient = useQueryClient();

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["memberships"],
    queryFn: getMemberships,
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const createMutation = useMutation({
    mutationFn: createMembership,
    onSuccess: () => {
      queryClient.invalidateQueries(["memberships"]);
      closeModal();
      showMessage("success", "Đã tạo hạng thành viên mới thành công!");
    },
    onError: (error) => {
      showMessage("error", error.response?.data || "Có lỗi xảy ra khi tạo hạng thành viên.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateMembership(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["memberships"]);
      closeModal();
      showMessage("success", "Đã cập nhật hạng thành viên thành công!");
    },
    onError: (error) => {
      showMessage("error", error.response?.data || "Có lỗi xảy ra khi cập nhật hạng thành viên.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMembership,
    onSuccess: () => {
      queryClient.invalidateQueries(["memberships"]);
      showMessage("success", "Đã xóa hạng thành viên thành công!");
    },
    onError: (error) => {
      alert(error.response?.data || "Không thể xóa hạng thành viên này.");
    }
  });

  const sortedMemberships = useMemo(() => {
    const sorted = [...memberships].sort((a, b) => {
      const valA = a.minPoints || 0;
      const valB = b.minPoints || 0;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
    return sorted;
  }, [memberships, sortOrder]);

  const paginatedMemberships = useMemo(() => {
    return sortedMemberships.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedMemberships, currentPage]);

  const openCreateModal = () => {
    setModalState({ open: true, mode: "create", membership: null });
    setFormData({ tierName: "", minPoints: "", discountPercent: "", description: "" });
  };

  const openEditModal = (membership) => {
    setModalState({ open: true, mode: "edit", membership });
    setFormData({ 
      tierName: membership.tierName, 
      minPoints: membership.minPoints ?? "", 
      discountPercent: membership.discountPercent ?? "", 
      description: membership.description ?? "" 
    });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "create", membership: null });
    setFormData({ tierName: "", minPoints: "", discountPercent: "", description: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tierName.trim()) return;

    const payload = {
      ...formData,
      minPoints: formData.minPoints === "" ? null : parseInt(formData.minPoints),
      discountPercent: formData.discountPercent === "" ? null : parseFloat(formData.discountPercent),
    };

    if (modalState.mode === "create") {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ 
        id: modalState.membership.id, 
        payload 
      });
    }
  };

  const handleDelete = (membership) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hạng thành viên "${membership.tierName}"?`)) {
      deleteMutation.mutate(membership.id);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý hạng thành viên</h1>
          <p className="text-sm font-medium text-slate-500">
            Thiết lập các cấp độ thành viên, điểm tích lũy và ưu đãi giảm giá.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1F649C] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#164e7a] hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Thêm hạng mới
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold animate-in fade-in slide-in-from-top-1 duration-200 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
        }`}>
          {message.text}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : !memberships?.length ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-400">
            <div className="rounded-full bg-slate-50 p-6">
              <FolderOpen size={48} className="text-slate-300" />
            </div>
            <p className="font-bold">Chưa có hạng thành viên nào được tạo</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Tên hạng</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={toggleSortOrder}>
                      <div className="flex items-center gap-1">
                        Điểm tối thiểu
                        {sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      </div>
                    </th>
                    <th className="px-6 py-4">Giảm giá (%)</th>
                    <th className="px-6 py-4">Mô tả</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMemberships.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-700">{m.tierName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-500">{m.minPoints?.toLocaleString() || 0} điểm</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                          {m.discountPercent || 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500 line-clamp-1 max-w-[200px]">{m.description || "---"}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(m)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-[#1F649C] hover:shadow-sm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(m)}
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

            {sortedMemberships.length > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="text-xs font-bold text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedMemberships.length)} trong tổng số {sortedMemberships.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.ceil(sortedMemberships.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
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
                    disabled={currentPage === Math.ceil(sortedMemberships.length / itemsPerPage)}
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

      {modalState.open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              {modalState.mode === "create" ? "Tạo hạng thành viên" : "Chỉnh sửa hạng thành viên"}
            </h2>
            
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tên hạng</label>
                <input
                  autoFocus
                  type="text"
                  value={formData.tierName}
                  onChange={(e) => setFormData(prev => ({ ...prev, tierName: e.target.value }))}
                  placeholder="VD: Đồng, Bạc, Vàng, Kim cương..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#1F649C] focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Điểm tối thiểu</label>
                  <input
                    type="number"
                    value={formData.minPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, minPoints: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#1F649C] focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Giảm giá (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#1F649C] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#1F649C] focus:bg-white min-h-[100px]"
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
                  disabled={createMutation.isLoading || updateMutation.isLoading || !formData.tierName.trim()}
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

export default AdminMembershipPage;
