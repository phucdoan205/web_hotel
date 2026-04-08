import React, { useState } from "react";
import { UserPlus, Gift } from "lucide-react";
import useVoucherData from "../../hooks/useVoucherData";
import VoucherFilters from "../../components/receptionist/vouchers/VoucherFilters";
import VoucherTable from "../../components/receptionist/vouchers/VoucherTable";
import VoucherForm from "../../components/receptionist/vouchers/VoucherForm";
import SendVoucherModal from "../../components/receptionist/vouchers/SendVoucherModal";

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
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedForSend, setSelectedForSend] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onSave = async (payload) => {
    try {
      if (editing) {
        await update(editing.id, payload);
        window.alert("Voucher cập nhật thành công");
      } else {
        await create(payload);
        window.alert("Voucher tạo thành công");
      }
    } catch (e) {
      console.error(e);
      window.alert("Có lỗi xảy ra");
    } finally {
      setShowForm(false);
    }
  };

  const onEdit = (v) => {
    setEditing(v);
    setShowForm(true);
  };

  const onDelete = async (v) => {
    if (!window.confirm("Bạn có chắc muốn xóa (soft delete) voucher này?")) return;
    try {
      await remove(v.id);
      window.alert("Voucher đã được xóa (soft delete).");
    } catch (e) {
      console.error(e);
      window.alert("Xóa thất bại");
    }
  };

  const onSend = (v) => {
    setSelectedForSend(v);
    setShowSendModal(true);
  };

  const handleSendRequest = async (payload) => {
    try {
      if (payload.recipients) {
        // send to specific emails
        await sendToUsers({ voucherId: payload.voucherId, recipients: payload.recipients, message: payload.message });
        window.alert("Gửi voucher qua email thành công.");
      } else {
        // send to birthdays (or specific date)
        await sendToBirthdays({ voucherId: payload.voucherId, date: payload.date, message: payload.message });
        window.alert("Gửi voucher theo ngày đã chọn thành công.");
      }
    } catch (e) {
      console.error(e);
      window.alert("Gửi thất bại");
    }
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Voucher</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Tạo, chỉnh sửa, xóa và gửi voucher tới khách hàng.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowSendModal(true)} className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            Gửi Voucher
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#0085FF] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
            <UserPlus size={16} strokeWidth={3} /> Thêm voucher
          </button>
        </div>
      </div>

      <VoucherFilters search={search} setSearch={setSearch} activeTab={activeTab} setActiveTab={setActiveTab} />

      <VoucherTable data={filteredVouchers} onEdit={onEdit} onDelete={onDelete} onSend={(v) => onSend(v)} />

      <div className="px-4 flex justify-between items-center">
        <p className="text-[11px] font-bold text-gray-400">Hiển thị 1 đến {filteredVouchers.length} kết quả</p>
      </div>

      {/* Form Modal simple */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
            <h3 className="text-lg font-black mb-3">{editing ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}</h3>
            <VoucherForm initial={editing ?? { code: generateCode() }} onSubmit={onSave} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showSendModal && (
        <SendVoucherModal
          vouchers={filteredVouchers}
          initialVoucher={selectedForSend}
          onClose={() => { setShowSendModal(false); setSelectedForSend(null); }}
          onSend={handleSendRequest}
        />
      )}
    </div>
  );
};

export default ReceptionistVoucherPage;
