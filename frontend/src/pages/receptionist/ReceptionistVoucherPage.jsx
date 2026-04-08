import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import useVoucherData from "../../hooks/useVoucherData";
import VoucherFilters from "../../components/receptionist/vouchers/VoucherFilters";
import VoucherTable from "../../components/receptionist/vouchers/VoucherTable";
import VoucherForm from "../../components/receptionist/vouchers/VoucherForm";

const ReceptionistVoucherPage = () => {
  const {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    filteredVouchers,
    create,
    update,
    remove,
    sendToUsers,
    sendToBirthdays,
    generateCode,
  } = useVoucherData();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showView, setShowView] = useState(false);
  const [viewVoucher, setViewVoucher] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onSave = async (payload) => {
    try {
      if (editing) {
        // editing removed in UI; keep update path if needed
        await update(editing.id, payload);
      } else {
        if (!window.confirm("Xác nhận tạo voucher?")) return;
        await create(payload);
      }
    } catch (e) {
      console.error(e);
      // keep minimal feedback
      window.alert("Có lỗi xảy ra");
    } finally {
      setShowForm(false);
    }
  };

  const onEdit = (v) => {
    // Open view-only modal
    setViewVoucher(v);
    setShowView(true);
  };

  const onToggle = async (v) => {
    try {
      await remove(v.id);
    } catch (e) {
      console.error(e);
      window.alert("Cập nhật trạng thái thất bại");
    }
  };

  // No top-level send UI (removed per requirements)

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Voucher</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Tạo, chỉnh sửa, xóa và gửi voucher tới khách hàng.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#0085FF] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
            <UserPlus size={16} strokeWidth={3} /> Thêm voucher
          </button>
        </div>
      </div>

      <VoucherFilters search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} />

      <VoucherTable data={filteredVouchers} onEdit={onEdit} onToggle={(v) => onToggle(v)} />

      <div className="px-4 flex justify-between items-center">
        <p className="text-[11px] font-bold text-gray-400">Hiển thị 1 đến {filteredVouchers.length} kết quả</p>
      </div>

      {/* Form Modal simple */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
            <h3 className="text-lg font-black mb-3">Tạo Voucher mới</h3>
            <VoucherForm initial={{ code: generateCode() }} onSubmit={onSave} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showView && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-black mb-3">Xem Voucher</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Mã:</strong> {viewVoucher?.code}</div>
              <div><strong>Loại:</strong> {viewVoucher?.discountType} - {viewVoucher?.discountValue}</div>
              <div><strong>Thời hạn:</strong> {viewVoucher?.validFrom ? new Date(viewVoucher.validFrom).toLocaleDateString() : '-'} - {viewVoucher?.validTo ? new Date(viewVoucher.validTo).toLocaleDateString() : '-'}</div>
              <div><strong>Giới hạn sử dụng:</strong> {viewVoucher?.usageLimit ?? '-'}</div>
              <div><strong>Loại hiển thị:</strong> {viewVoucher?.isPrivate ? 'Riêng' : 'Công khai'}</div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowView(false)} className="px-6 py-2 rounded-2xl bg-white border">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistVoucherPage;
