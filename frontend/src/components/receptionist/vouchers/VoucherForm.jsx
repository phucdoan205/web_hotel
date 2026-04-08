import React, { useEffect, useState } from "react";
import { generateCode } from "../../../hooks/useVoucherData";
import { RefreshCw } from "lucide-react";

const VoucherForm = ({ initial = {}, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: 0,
    minBookingValue: null,
    validFrom: "",
    validTo: "",
    usageLimit: null,
    isPrivate: false,
    ...initial,
  });

  useEffect(() => {
    if (!initial || !initial.code) {
      setForm((s) => ({ ...s, code: generateCode() }));
    }
  }, []);

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-gray-400">Mã Voucher</label>
          <div className="flex items-center gap-2 mt-1">
            <input value={form.code} readOnly className="flex-1 p-3 rounded-2xl bg-gray-50 text-sm font-bold" />
            <button type="button" onClick={() => onChange('code', generateCode())} className="p-2 bg-white rounded-xl border">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400">Loại ưu đãi</label>
          <select value={form.discountType} onChange={(e) => onChange('discountType', e.target.value)} className="w-full p-3 rounded-2xl bg-gray-50 text-sm font-bold mt-1">
            <option value="PERCENT">Phần trăm</option>
            <option value="AMOUNT">Số tiền</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400">Giá trị ưu đãi</label>
          <input type="number" value={form.discountValue} onChange={(e) => onChange('discountValue', e.target.value)} className="w-full p-3 rounded-2xl bg-gray-50 text-sm font-bold mt-1" />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400">Giá trị tối thiểu</label>
          <input type="number" value={form.minBookingValue ?? ''} onChange={(e) => onChange('minBookingValue', e.target.value || null)} className="w-full p-3 rounded-2xl bg-gray-50 text-sm font-bold mt-1" />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400">Bắt đầu</label>
          <input type="date" value={form.validFrom ? form.validFrom.split('T')[0] : form.validFrom} onChange={(e) => onChange('validFrom', e.target.value)} className="w-full p-3 rounded-2xl bg-gray-50 text-sm font-bold mt-1" />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400">Kết thúc</label>
          <input type="date" value={form.validTo ? form.validTo.split('T')[0] : form.validTo} onChange={(e) => onChange('validTo', e.target.value)} className="w-full p-3 rounded-2xl bg-gray-50 text-sm font-bold mt-1" />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400">Giới hạn sử dụng</label>
          <input type="number" value={form.usageLimit ?? ''} onChange={(e) => onChange('usageLimit', e.target.value || null)} className="w-full p-3 rounded-2xl bg-gray-50 text-sm font-bold mt-1" />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400">Loại hiển thị</label>
          <div className="mt-1">
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" checked={form.isPrivate} onChange={(e) => onChange('isPrivate', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm font-bold">Riêng (chỉ người được chỉ định)</span>
            </label>
          </div>
        </div>

        {/* Private checkbox added above. Sending handled separately. */}
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-2xl bg-white border">Hủy</button>
        <button type="submit" className="px-6 py-2 rounded-2xl bg-[#0085FF] text-white font-black">Lưu</button>
      </div>
    </form>
  );
};

export default VoucherForm;
