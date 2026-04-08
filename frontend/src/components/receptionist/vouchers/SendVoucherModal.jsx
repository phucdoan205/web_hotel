import React, { useEffect, useState } from "react";
import VoucherEmailPreview from "./VoucherEmailPreview";

const SendVoucherModal = ({ vouchers = [], initialVoucher = null, onClose, onSend }) => {
  const [selectedId, setSelectedId] = useState(initialVoucher ? initialVoucher.id : (vouchers[0]?.id ?? null));
  const [mode, setMode] = useState("email");
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialVoucher) {
      setSelectedId(initialVoucher.id);
    }
  }, [initialVoucher]);

  const selected = vouchers.find((voucher) => voucher.id === selectedId) || null;

  const performSend = async () => {
    if (!selected) return;

    try {
      if (mode === "email") {
        const list = recipients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (list.length === 0) {
          setError("Vui lòng nhập ít nhất 1 email.");
          return;
        }

        await onSend({ voucherId: selected.id, recipients: list, message });
      } else {
        const sendDate = date ? new Date(date) : new Date();
        await onSend({ voucherId: selected.id, date: sendDate.toISOString(), message });
      }

      onClose();
    } catch (e) {
      console.error(e);
      setError("Gửi email thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <h3 className="text-lg font-black mb-3">Gửi voucher</h3>

        <div className="space-y-4">
          {error && <div className="text-sm text-rose-600 font-bold px-2">{error}</div>}

          <div>
            <label className="text-xs font-bold text-gray-400">Chọn voucher</label>
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full p-3 rounded-2xl bg-gray-50 mt-1"
            >
              {vouchers.map((voucher) => (
                <option key={voucher.id} value={voucher.id}>
                  {voucher.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400">Hình thức gửi</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" checked={mode === "email"} onChange={() => setMode("email")} />
                Gửi cho email cụ thể
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={mode === "by_date"} onChange={() => setMode("by_date")} />
                Gửi theo ngày sinh
              </label>
            </div>
          </div>

          {mode === "email" && (
            <div>
              <label className="text-xs font-bold text-gray-400">Danh sách email</label>
              <input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full p-3 rounded-2xl bg-gray-50 mt-1"
                placeholder="a@b.com, c@d.com"
              />
            </div>
          )}

          {mode === "by_date" && (
            <div>
              <label className="text-xs font-bold text-gray-400">Chọn ngày sinh</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-2xl bg-gray-50 mt-1"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400">Lời nhắn</label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-2xl bg-gray-50 mt-1"
              placeholder="Nhập lời nhắn gửi tới khách hàng"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400">Xem trước email</label>
            <div className="mt-2">
              <VoucherEmailPreview
                voucher={selected}
                message={message}
                recipientsPreview={
                  mode === "email"
                    ? recipients.split(",").map((item) => item.trim()).filter(Boolean)
                    : []
                }
                onSend={() => {}}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-2xl bg-white border">
              Hủy
            </button>
            <button
              onClick={() => setShowConfirmSend(true)}
              className="px-4 py-2 rounded-2xl bg-[#0085FF] text-white font-black"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>

      {showConfirmSend && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <h4 className="text-lg font-black mb-3">Xác nhận gửi</h4>
            <p className="text-sm text-gray-600">Bạn có chắc muốn gửi voucher này không?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowConfirmSend(false)} className="px-4 py-2 rounded-2xl bg-white border">
                Không
              </button>
              <button
                onClick={() => {
                  setShowConfirmSend(false);
                  performSend();
                }}
                className="px-4 py-2 rounded-2xl bg-[#0085FF] text-white font-black"
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendVoucherModal;
