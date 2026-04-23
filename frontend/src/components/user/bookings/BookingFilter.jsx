import React from "react";
import { Minus, Plus, Search } from "lucide-react";

const CounterControl = ({ label, value, min = 0, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
    </div>
    <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-11 w-11 items-center justify-center text-slate-500 transition hover:bg-slate-50"
      >
        <Minus size={16} />
      </button>
      <span className="flex h-11 min-w-[52px] items-center justify-center border-x border-slate-200 text-sm font-semibold text-slate-800">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center text-slate-500 transition hover:bg-slate-50"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
);

const BookingFilter = ({
  filters,
  onChange,
  onSubmit,
  onClear,
  isSearching,
  numberOfNights,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
    >
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Nhận phòng
          </span>
          <input
            type="datetime-local"
            value={filters.checkIn}
            onChange={(event) => onChange("checkIn", event.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Trả phòng
          </span>
          <input
            type="datetime-local"
            value={filters.checkOut}
            onChange={(event) => onChange("checkOut", event.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700">
          {numberOfNights} ngày
        </div>

        <CounterControl
          label="Người lớn"
          value={filters.adults}
          min={1}
          onChange={(value) => onChange("adults", value)}
        />

        <CounterControl
          label="Trẻ em"
          value={filters.children}
          min={0}
          onChange={(value) => onChange("children", value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSearching}
        className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        <Search size={18} />
        {isSearching ? "Đang tìm phòng..." : "Tìm phòng"}
      </button>

      <button
        type="button"
        onClick={onClear}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        Xóa bộ lọc
      </button>
    </form>
  );
};

export default BookingFilter;
