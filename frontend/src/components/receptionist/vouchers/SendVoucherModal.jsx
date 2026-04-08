import React, { useEffect, useState } from "react";
import VoucherEmailPreview from "./VoucherEmailPreview";

const SendVoucherModal = ({ vouchers = [], initialVoucher = null, onClose, onSend }) => {
  const [selectedId, setSelectedId] = useState(initialVoucher ? initialVoucher.id : (vouchers[0]?.id ?? null));
  const [mode, setMode] = useState("email"); // "email" or "by_date"
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (initialVoucher) setSelectedId(initialVoucher.id);
  }, [initialVoucher]);

  const selected = vouchers.find((v) => v.id === selectedId) || null;

  const handleSend = async () => {
    if (!selected) return;
    if (mode === "email") {
      const list = recipients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length === 0) {
        alert("Vui lòng nhập ít nhất 1 email");
        return;
      }
      await onSend({ voucherId: selected.id, recipients: list, message });
    } else {
      const d = date ? new Date(date) : new Date();
      await onSend({ voucherId: selected.id, date: d.toISOString(), message });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <h3 className="text-lg font-black mb-3">Gửi Voucher</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-400">Chọn Voucher</label>
            <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))} className="w-full p-3 rounded-2xl bg-gray-50 mt-1">
              {vouchers.map((v) => (
                <option key={v.id} value={v.id}>{v.code}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400">Hình thức gửi</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2"><input type="radio" checked={mode === "email"} onChange={() => setMode("email")} /> Gửi cho email cụ thể</label>
              <label className="flex items-center gap-2"><input type="radio" checked={mode === "by_date"} onChange={() => setMode("by_date")} /> Gửi theo ngày sinh</label>
            </div>
          </div>

          {mode === "email" && (
            <div>
              <label className="text-xs font-bold text-gray-400">Danh sách email (phân cách bằng dấu phẩy)</label>
              <input value={recipients} onChange={(e) => setRecipients(e.target.value)} className="w-full p-3 rounded-2xl bg-gray-50 mt-1" placeholder="a@b.com, c@d.com" />
            </div>
          )}

          {mode === "by_date" && (
            <div>
              <label className="text-xs font-bold text-gray-400">Chọn ngày sinh (day/month)</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-2xl bg-gray-50 mt-1" />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400">Lời chúc (tuỳ chọn)</label>
            <input value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 rounded-2xl bg-gray-50 mt-1" placeholder="Lời chúc (tùy chọn)" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400">Xem trước</label>
            <div className="mt-2">
              <VoucherEmailPreview voucher={selected} message={message} recipientsPreview={mode === "email" ? recipients.split(",").map(s => s.trim()).filter(Boolean) : []} onSend={() => {}} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-2xl bg-white border">Hủy</button>
            <button onClick={handleSend} className="px-4 py-2 rounded-2xl bg-[#0085FF] text-white font-black">Gửi</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendVoucherModal;
