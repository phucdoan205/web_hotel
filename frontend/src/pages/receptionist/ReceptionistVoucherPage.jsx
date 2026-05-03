import React, { useState } from "react";
import { UserPlus, Ticket, Calendar, Copy, CheckCircle2, Info, ReceiptText, X } from "lucide-react";
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
  const [isDescExpanded, setIsDescExpanded] = useState(false);

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
    setIsDescExpanded(false);
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setShowView(false)}
              className="absolute right-6 top-6 rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-100 bg-slate-50/50 p-8">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-100">
                  <Ticket size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {viewVoucher?.name || "Chi tiết Voucher"}
                </h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100 px-8 py-6">
              <div className="grid grid-cols-[180px_1fr] py-5">
                <span className="text-sm font-bold text-slate-400">Giá trị ưu đãi</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Giảm {viewVoucher?.discountType === "PERCENT" ? `${viewVoucher?.discountValue}%` : `${viewVoucher?.discountValue?.toLocaleString()} VND`}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Cho đơn từ {viewVoucher?.minBookingValue ? `${viewVoucher.minBookingValue.toLocaleString()} VND` : "0 VND"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] py-5">
                <span className="text-sm font-bold text-slate-400">Thời gian hiệu lực</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <div className="size-1.5 rounded-full bg-slate-400" />
                    Bắt đầu ngày: {viewVoucher?.validFrom ? new Date(viewVoucher.validFrom).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <div className="size-1.5 rounded-full bg-slate-400" />
                    Hiệu lực tới: {viewVoucher?.validTo ? new Date(viewVoucher.validTo).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] py-5">
                <span className="text-sm font-bold text-slate-400">Mã ưu đãi</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black tracking-wider text-slate-900">{viewVoucher?.code}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewVoucher?.code);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600 transition hover:bg-orange-100"
                  >
                    <Copy size={14} />
                    Sao chép
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] py-5">
                <span className="text-sm font-bold text-slate-400">Mô tả</span>
                <div>
                  <p className={`text-sm font-medium leading-relaxed text-slate-600 ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
                    {viewVoucher?.description || "Không có mô tả cho voucher này."}
                  </p>
                  {viewVoucher?.description && viewVoucher.description.length > 150 && (
                    <button
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      {isDescExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                  )}
                </div>
              </div>
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
