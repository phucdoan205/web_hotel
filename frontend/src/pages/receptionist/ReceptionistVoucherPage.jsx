import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import useVoucherData from "../../hooks/useVoucherData";
import VoucherFilters from "../../components/receptionist/vouchers/VoucherFilters";
import VoucherTable from "../../components/receptionist/vouchers/VoucherTable";
import VoucherForm from "../../components/receptionist/vouchers/VoucherForm";
import SendVoucherModal from "../../components/receptionist/vouchers/SendVoucherModal";
import { hasPermission } from "../../utils/permissions";

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
    toggleActive,
    sendToUsers,
    sendToBirthdays,
    generateCode,
  } = useVoucherData();

  const canViewVouchers = hasPermission("VIEW_VOUCHERS");
  const canCreateVoucher = hasPermission("CREATE_VOUCHERS");
  const canEditVoucher = hasPermission("EDIT_VOUCHERS");
  const canDeleteVoucher = hasPermission("DELETE_VOUCHERS");
  const canEnableVoucher = hasPermission("ENABLE_VOUCHER");
  const canDisableVoucher = hasPermission("DISABLE_VOUCHER");
  const canSendVoucher = hasPermission("SEND_VOUCHER");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showView, setShowView] = useState(false);
  const [viewVoucher, setViewVoucher] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedForSend, setSelectedForSend] = useState(null);
  const [pendingCreate, setPendingCreate] = useState(null);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [showInvalidDate, setShowInvalidDate] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const openCreate = () => {
    if (!canCreateVoucher) {
      return;
    }

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
      closeForm();
    } catch (saveError) {
      console.error(saveError);
      setErrorMessage("Có lỗi xảy ra.");
    }
  };

  const onView = (voucher) => {
    if (!canViewVouchers) {
      return;
    }

    setViewVoucher(voucher);
    setShowView(true);
  };

  const onEdit = (voucher) => {
    if (!canEditVoucher) {
      return;
    }

    setEditing(voucher);
    setShowView(false);
    setShowForm(true);
  };

  const onDelete = (voucher) => {
    if (!canDeleteVoucher) {
      return;
    }

    setSelectedForDelete(voucher);
    setShowConfirmDelete(true);
  };

  const onToggle = async (voucher) => {
    const canToggle =
      (voucher.isActive && canDisableVoucher) || (!voucher.isActive && canEnableVoucher);

    if (!canToggle) {
      return;
    }

    try {
      await toggleActive(voucher.id);
    } catch (toggleError) {
      console.error(toggleError);
      setErrorMessage("Cập nhật trạng thái thất bại.");
    }
  };

  const onOpenSend = (voucher = null) => {
    if (!canSendVoucher) {
      return;
    }

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
    } catch (sendError) {
      console.error(sendError);
      throw sendError;
    }
  };

  if (!canViewVouchers) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Không có quyền truy cập voucher</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Tài khoản hiện tại chưa được cấp quyền xem danh sách voucher.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#F9FAFB] p-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Quản lý voucher</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Tạo, chỉnh sửa và gửi voucher tới khách hàng.
          </p>
        </div>

        <div className="flex gap-3">
          {canSendVoucher ? (
            <button
              onClick={() => onOpenSend(null)}
              className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-3 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50"
            >
              Gửi voucher
            </button>
          ) : null}

          {canCreateVoucher ? (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-2xl bg-[#0085FF] px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-600"
            >
              <UserPlus size={16} strokeWidth={3} /> Thêm voucher
            </button>
          ) : null}
        </div>
      </div>

      <VoucherFilters
        search={search}
        setSearch={setSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
          {error}
        </div>
      ) : null}

      <VoucherTable
        data={filteredVouchers}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onSend={onOpenSend}
        canView={canViewVouchers}
        canEdit={canEditVoucher}
        canDelete={canDeleteVoucher}
        canSend={canSendVoucher}
        canEnable={canEnableVoucher}
        canDisable={canDisableVoucher}
      />

      <div className="flex items-center justify-between px-4">
        <p className="text-[11px] font-bold text-gray-400">
          {loading
            ? "Đang tải danh sách voucher..."
            : `Tổng ${vouchers.length} voucher trong database, hiển thị ${filteredVouchers.length} kết quả`}
        </p>
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-6">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6">
            <h3 className="mb-3 text-lg font-black">
              {editing ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
            </h3>
            <VoucherForm
              initial={editing ? editing : { code: generateCode() }}
              onSubmit={onSave}
              onCancel={closeForm}
            />
          </div>
        </div>
      ) : null}

      {showConfirmCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h4 className="mb-3 text-lg font-black">Xác nhận tạo</h4>
            <p className="text-sm text-gray-600">Bạn có muốn tạo voucher này không?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowConfirmCreate(false);
                  setPendingCreate(null);
                }}
                className="rounded-2xl border bg-white px-4 py-2"
              >
                Không
              </button>
              <button
                onClick={async () => {
                  setShowConfirmCreate(false);
                  try {
                    await create(pendingCreate);
                    closeForm();
                  } catch (createError) {
                    console.error(createError);
                    setErrorMessage("Tạo voucher thất bại.");
                  } finally {
                    setPendingCreate(null);
                  }
                }}
                className="rounded-2xl bg-[#0085FF] px-4 py-2 font-black text-white"
              >
                Có
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showConfirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h4 className="mb-3 text-lg font-black">Xác nhận xóa</h4>
            <p className="text-sm text-gray-600">
              Bạn có muốn xóa voucher <strong>{selectedForDelete?.code}</strong> không?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedForDelete(null);
                }}
                className="rounded-2xl border bg-white px-4 py-2"
              >
                Không
              </button>
              <button
                onClick={async () => {
                  setShowConfirmDelete(false);
                  try {
                    await remove(selectedForDelete.id);
                    if (viewVoucher?.id === selectedForDelete.id) {
                      setShowView(false);
                      setViewVoucher(null);
                    }
                  } catch (deleteError) {
                    console.error(deleteError);
                    setErrorMessage("Xóa voucher thất bại.");
                  } finally {
                    setSelectedForDelete(null);
                  }
                }}
                className="rounded-2xl bg-rose-600 px-4 py-2 font-black text-white"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showInvalidDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <h4 className="mb-3 text-lg font-black">Thời gian không hợp lệ</h4>
            <p className="text-sm text-gray-600">Ngày bắt đầu phải nhỏ hơn ngày kết thúc.</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowInvalidDate(false)}
                className="rounded-2xl bg-[#0085FF] px-6 py-2 font-black text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showView ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
            <h3 className="mb-3 text-lg font-black">Xem voucher</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Mã:</strong> {viewVoucher?.code}</div>
              <div><strong>Loại:</strong> {viewVoucher?.discountType} - {viewVoucher?.discountValue}</div>
              <div>
                <strong>Thời hạn:</strong> {viewVoucher?.validFrom ? new Date(viewVoucher.validFrom).toLocaleDateString() : "-"} - {viewVoucher?.validTo ? new Date(viewVoucher.validTo).toLocaleDateString() : "-"}
              </div>
              <div><strong>Giới hạn sử dụng:</strong> {viewVoucher?.usageLimit ?? "-"}</div>
              <div><strong>Loại hiển thị:</strong> {viewVoucher?.isPrivate ? "Riêng" : "Công khai"}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {canSendVoucher ? (
                <button
                  onClick={() => onOpenSend(viewVoucher)}
                  className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2 font-bold text-indigo-600"
                >
                  Gửi voucher
                </button>
              ) : null}
              {canEditVoucher ? (
                <button
                  onClick={() => onEdit(viewVoucher)}
                  className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 font-bold text-sky-600"
                >
                  Sửa voucher
                </button>
              ) : null}
              {canDeleteVoucher ? (
                <button
                  onClick={() => onDelete(viewVoucher)}
                  className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 font-bold text-rose-600"
                >
                  Xóa voucher
                </button>
              ) : null}
              <button onClick={() => setShowView(false)} className="rounded-2xl border bg-white px-6 py-2">
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <h4 className="mb-3 text-lg font-black">Thông báo</h4>
            <p className="text-sm text-gray-600">{errorMessage}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setErrorMessage(null)}
                className="rounded-2xl bg-[#0085FF] px-6 py-2 font-black text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSendModal ? (
        <SendVoucherModal
          vouchers={vouchers}
          initialVoucher={selectedForSend}
          onClose={() => {
            setShowSendModal(false);
            setSelectedForSend(null);
          }}
          onSend={handleSendRequest}
        />
      ) : null}
    </div>
  );
};

export default ReceptionistVoucherPage;
