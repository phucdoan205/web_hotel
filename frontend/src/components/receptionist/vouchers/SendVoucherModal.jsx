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
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl p-6 w-full max-w-5xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
        <h3 className="text-lg font-black mb-6">Gửi voucher</h3>

        <div className="flex gap-8 flex-1 overflow-hidden">
          {/* ==================== BÊN TRÁI: FORM ==================== */}
          <div className="flex-[5] overflow-y-auto pr-2">
            <div className="space-y-5">
              {error && (
                <div className="text-sm text-rose-600 font-bold px-2">{error}</div>
              )}

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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={mode === "email"} onChange={() => setMode("email")} />
                    Gửi cho email cụ thể
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={mode === "by_date"} onChange={() => setMode("by_date")} />
                    Gửi theo ngày sinh
                  </label>
                </div>
              </div>

              {mode === "email" && (
                <>
                  {/* Nhập email thủ công */}
                  <div>
                    <label className="text-xs font-bold text-gray-400">Thêm email thủ công</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addEmail()}
                        className="flex-1 p-3 rounded-2xl bg-gray-50"
                        placeholder="example@gmail.com"
                      />
                      <button
                        onClick={addEmail}
                        className="px-6 py-3 rounded-2xl bg-gray-800 text-white hover:bg-black"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  {/* Import Excel */}
                  <div>
                    <label className="text-xs font-bold text-gray-400">Import từ file Excel</label>
                    <div className="mt-1">
                      <label className="cursor-pointer inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-2xl transition-colors">
                        Chọn file Excel
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileImport}
                          disabled={importing}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hỗ trợ .xlsx, .xls - Tự động quét email</p>
                  </div>

                  {/* Danh sách email đã thêm */}
                  {recipients.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-gray-400 mb-2 block">
                        Danh sách người nhận ({recipients.length})
                      </label>
                      <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-3 bg-gray-50 border rounded-2xl">
                        {recipients.map((email) => (
                          <div
                            key={email}
                            className="flex items-center bg-white px-3 py-1.5 rounded-xl border text-sm"
                          >
                            {email}
                            <button
                              onClick={() => removeEmail(email)}
                              className="ml-2 text-red-500 hover:text-red-700 text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
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
                <label className="text-xs font-bold text-gray-400">Nội dung email</label>
                <RichEmailEditor value={message} onChange={setMessage} />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-white border font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => setShowConfirmSend(true)}
                  disabled={mode === "email" && recipients.length === 0}
                  className="px-6 py-2.5 rounded-2xl bg-[#0085FF] text-white font-black disabled:opacity-50"
                >
                  Gửi
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
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