import React, { useState } from "react";
import { UserPlus } from "lucide-react";
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
    vouchers,
    filteredVouchers,
    loading,
    error,
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
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedForSend, setSelectedForSend] = useState(null);
  const [pendingCreate, setPendingCreate] = useState(null);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [showInvalidDate, setShowInvalidDate] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onSave = async (payload) => {
    try {
      if (!editing) {
        if (payload.validFrom && payload.validTo && new Date(payload.validFrom) > new Date(payload.validTo)) {
          setShowInvalidDate(true);
          return;
        }

        setPendingCreate(payload);
        setShowConfirmCreate(true);
        return;
      }

      await update(editing.id, payload);
      setShowForm(false);
    } catch (e) {
      console.error(e);
      setErrorMessage("Có lỗi xảy ra.");
    }
  };

  const onEdit = (voucher) => {
    setViewVoucher(voucher);
    setShowView(true);
  };

  const onToggle = async (voucher) => {
    try {
      await remove(voucher.id);
    } catch (e) {
      console.error(e);
      setErrorMessage("Cập nhật trạng thái thất bại.");
    }
  };

  const onOpenSend = (voucher = null) => {
    setSelectedForSend(voucher);
    setShowSendModal(true);
  };

  const handleSendRequest = async (payload) => {
    try {
      if (payload.recipients) {
        await sendToUsers({
          voucherId: payload.voucherId,
          recipients: payload.recipients,
          message: payload.message,
        });
      } else {
        await sendToBirthdays({
          voucherId: payload.voucherId,
          date: payload.date,
          message: payload.message,
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý voucher</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Tạo, chỉnh sửa và gửi voucher tới khách hàng.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onOpenSend(null)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Gửi voucher
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#0085FF] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
          >
            <UserPlus size={16} strokeWidth={3} /> Thêm voucher
          </button>
        </div>
      </div>

      <VoucherFilters
        search={search}
        setSearch={setSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </div>
      )}

      <VoucherTable data={filteredVouchers} onEdit={onEdit} onToggle={onToggle} />

      <div className="px-4 flex justify-between items-center">
        <p className="text-[11px] font-bold text-gray-400">
          {loading
            ? "Đang tải danh sách voucher..."
            : `Tổng ${vouchers.length} voucher trong database, hiển thị ${filteredVouchers.length} kết quả`}
        </p>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
            <h3 className="text-lg font-black mb-3">Tạo voucher mới</h3>
            <VoucherForm
              initial={{ code: generateCode() }}
              onSubmit={onSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {showConfirmCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <h4 className="text-lg font-black mb-3">Xác nhận tạo</h4>
            <p className="text-sm text-gray-600">Bạn có muốn tạo voucher này không?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowConfirmCreate(false);
                  setPendingCreate(null);
                }}
                className="px-4 py-2 rounded-2xl bg-white border"
              >
                Không
              </button>
              <button
                onClick={async () => {
                  setShowConfirmCreate(false);
                  try {
                    await create(pendingCreate);
                    setShowForm(false);
                  } catch (e) {
                    console.error(e);
                    setErrorMessage("Tạo voucher thất bại.");
                  } finally {
                    setPendingCreate(null);
                  }
                }}
                className="px-4 py-2 rounded-2xl bg-[#0085FF] text-white font-black"
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvalidDate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg text-center">
            <h4 className="text-lg font-black mb-3">Thời gian không hợp lệ</h4>
            <p className="text-sm text-gray-600">Ngày bắt đầu phải nhỏ hơn ngày kết thúc.</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowInvalidDate(false)}
                className="px-6 py-2 rounded-2xl bg-[#0085FF] text-white font-black"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showView && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-black mb-3">Xem voucher</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Mã:</strong> {viewVoucher?.code}</div>
              <div><strong>Loại:</strong> {viewVoucher?.discountType} - {viewVoucher?.discountValue}</div>
              <div>
                <strong>Thời hạn:</strong> {viewVoucher?.validFrom ? new Date(viewVoucher.validFrom).toLocaleDateString() : "-"} - {viewVoucher?.validTo ? new Date(viewVoucher.validTo).toLocaleDateString() : "-"}
              </div>
              <div><strong>Giới hạn sử dụng:</strong> {viewVoucher?.usageLimit ?? "-"}</div>
              <div><strong>Loại hiển thị:</strong> {viewVoucher?.isPrivate ? "Riêng" : "Công khai"}</div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowView(false)} className="px-6 py-2 rounded-2xl bg-white border">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg text-center">
            <h4 className="text-lg font-black mb-3">Thông báo</h4>
            <p className="text-sm text-gray-600">{errorMessage}</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-6 py-2 rounded-2xl bg-[#0085FF] text-white font-black"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showSendModal && (
        <SendVoucherModal
          vouchers={vouchers}
          initialVoucher={selectedForSend}
          onClose={() => {
            setShowSendModal(false);
            setSelectedForSend(null);
          }}
          onSend={handleSendRequest}
        />
      )}
    </div>
  );
};

export default ReceptionistVoucherPage;
