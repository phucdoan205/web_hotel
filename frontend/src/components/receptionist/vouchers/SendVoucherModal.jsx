import React, { useEffect, useState } from "react";
import VoucherEmailPreview from "./VoucherEmailPreview";
import RichEmailEditor from "./RichMailEditor";
import * as XLSX from "xlsx";
import { getVietnamDateKey, toVietnamStartOfDayISOString } from "../../../utils/vietnamTime";

const SendVoucherModal = ({ vouchers = [], initialVoucher = null, onClose, onSend }) => {
  const [selectedId, setSelectedId] = useState(initialVoucher ? initialVoucher.id : (vouchers[0]?.id ?? null));
  const [mode, setMode] = useState("email");
  const [recipients, setRecipients] = useState([]);           // Dùng array để dễ quản lý
  const [newEmail, setNewEmail] = useState("");               // Nhập tay
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(getVietnamDateKey());
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (initialVoucher) {
      setSelectedId(initialVoucher.id);
    }
  }, [initialVoucher]);

  const selected = vouchers.find((voucher) => voucher.id === selectedId) || null;

  // Thêm email thủ công
  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (recipients.includes(email)) {
      setError("Email này đã tồn tại.");
      return;
    }
    setRecipients([...recipients, email]);
    setNewEmail("");
    setError(null);
  };

  // Xóa email
  const removeEmail = (emailToRemove) => {
    setRecipients(recipients.filter((email) => email !== emailToRemove));
  };

  // Import Excel
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const emails = new Set();
        jsonData.forEach((row) => {
          row.forEach((cell) => {
            if (typeof cell === "string") {
              const trimmed = cell.trim().toLowerCase();
              if (trimmed.includes("@") && trimmed.includes(".")) {
                emails.add(trimmed);
              }
            }
          });
        });

        const newEmails = Array.from(emails).filter(email => !recipients.includes(email));

        if (newEmails.length === 0) {
          setError("Không tìm thấy email mới hợp lệ trong file Excel.");
        } else {
          setRecipients(prev => [...prev, ...newEmails]);
        }
      } catch (err) {
        console.error(err);
        setError("Import file Excel thất bại.");
      } finally {
        setImporting(false);
        e.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const performSend = async () => {
    if (!selected) return;

    try {
      if (mode === "email") {
        if (recipients.length === 0) {
          setError("Vui lòng nhập ít nhất 1 email.");
          return;
        }

        await onSend({
          voucherId: selected.id,
          recipients,           // Truyền array
          message,
        });
      } else {
        await onSend({
          voucherId: selected.id,
          date: date ? toVietnamStartOfDayISOString(date) : toVietnamStartOfDayISOString(),
          message,
        });
      }

      onClose();
    } catch (e) {
      console.error(e);
      setError("Gửi email thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/35 flex items-center justify-center p-2 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 w-full max-w-7xl mx-auto max-h-[95vh] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black">Gửi voucher</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-10 flex-1 overflow-hidden">
          {/* ==================== BÊN TRÁI: FORM ==================== */}
          <div className="flex-[6] overflow-y-auto pr-4 scrollbar-hide">
            <div className="space-y-5">
              {error && (
                <div className="text-sm text-rose-600 font-bold px-2">{error}</div>
              )}

              <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Chọn voucher</label>
                  <select
                    value={selectedId ?? ""}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    className="w-full p-4 rounded-2xl bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                  >
                    {vouchers.map((voucher) => (
                      <option key={voucher.id} value={voucher.id}>
                        {voucher.code} - {voucher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Hình thức gửi</label>
                    <div className="flex bg-white p-1 rounded-2xl border shadow-sm">
                      <button
                        onClick={() => setMode("email")}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === "email" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Email cụ thể
                      </button>
                      <button
                        onClick={() => setMode("by_date")}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === "by_date" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Theo ngày sinh
                      </button>
                    </div>
                  </div>

                  {mode === "by_date" && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-white border shadow-sm font-bold text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {mode === "email" && (
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Thêm email</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addEmail()}
                          className="flex-1 p-3.5 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                          placeholder="nhập email..."
                        />
                        <button
                          onClick={addEmail}
                          className="px-6 rounded-2xl bg-gray-900 text-white hover:bg-black font-bold text-xs"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Import Excel</label>
                      <label className="cursor-pointer flex items-center justify-center gap-3 w-full p-3.5 bg-blue-50 border-2 border-dashed border-blue-200 hover:bg-blue-100/50 text-blue-600 font-bold rounded-2xl transition-all text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Chọn file .xlsx / .xls
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileImport}
                          disabled={importing}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {recipients.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Người nhận ({recipients.length})</label>
                        <button onClick={() => setRecipients([])} className="text-[10px] font-black text-rose-500 hover:underline">Xóa tất cả</button>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        {recipients.map((email) => (
                          <div key={email} className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-[13px] font-medium shadow-sm">
                            {email}
                            <button onClick={() => removeEmail(email)} className="ml-2 text-rose-500 hover:scale-125 transition-transform">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Nội dung email tùy chỉnh</label>
                <div className="min-h-[300px]">
                  <RichEmailEditor value={message} onChange={setMessage} />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t mt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-white border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => setShowConfirmSend(true)}
                  disabled={mode === "email" && recipients.length === 0}
                  className="px-10 py-3 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  Gửi ngay
                </button>
              </div>
            </div>
          </div>

          {/* ==================== BÊN PHẢI: XEM TRƯỚC ==================== */}
          <div className="flex-[4] border-l pl-8 overflow-y-auto">
            <label className="text-xs font-bold text-gray-400 block mb-2">
              Xem trước email
            </label>
            <div className="sticky top-6">
              <VoucherEmailPreview
                voucher={selected}
                message={message}
                recipientsPreview={recipients}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmSend && (
        <div className="fixed inset-0 z-[10001] bg-black/40 flex items-center justify-center p-6 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <h4 className="text-lg font-black mb-3">Xác nhận gửi</h4>
            <p className="text-sm text-gray-600 mb-6">
              {mode === "email"
                ? `Gửi voucher cho ${recipients.length} email?`
                : "Gửi voucher theo ngày sinh?"}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowConfirmSend(false)}
                className="px-4 py-2 rounded-2xl bg-white border"
              >
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