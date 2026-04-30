import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, MapPin, Search, UsersRound, Minus, Plus, ChevronDown } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import vi from "date-fns/locale/vi";
import { format } from "date-fns";

registerLocale("vi", vi);

const CustomDateInput = React.forwardRef(({ value, onClick, startDate, endDate }, ref) => (
  <div
    className="flex w-full cursor-pointer items-center bg-transparent text-sm font-semibold text-slate-900 outline-none"
    onClick={onClick}
    ref={ref}
  >
    <span className="truncate">
      {startDate ? format(startDate, "EEEE, dd 'thg' MM yyyy", { locale: vi }) : "Chọn ngày"}
    </span>
    <span className="mx-2 text-slate-400">-</span>
    <span className="truncate">
      {endDate ? format(endDate, "EEEE, dd 'thg' MM yyyy", { locale: vi }) : "Chọn ngày"}
    </span>
  </div>
));

const HorizontalSearchFilter = ({
  filters,
  onChange,
  onSubmit,
  isSearching,
}) => {
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowGuestPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGuestChange = (field, value) => {
    if (value < 0) return;
    if (field === "adults" && value < 1) return;
    onChange(field, value);
  };

  const toDateInputValue = (dateObj) => {
    if (!dateObj) return "";
    const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  };

  const handleDateChange = (field, dateValue) => {
    if (!dateValue) {
      onChange(field, "");
      return;
    }
    const timePortion = field === "checkIn" ? "T14:00" : "T12:00";
    onChange(field, `${dateValue}${timePortion}`);
  };

  const startDate = filters.checkIn ? new Date(filters.checkIn) : null;
  const endDate = filters.checkOut ? new Date(filters.checkOut) : null;

  return (
    <div className="relative mx-auto w-full rounded-2xl bg-white p-2 shadow-2xl md:rounded-[2rem] md:p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowGuestPopup(false);
          onSubmit(e);
        }}
        className="flex flex-col gap-2 lg:flex-row lg:items-end"
      >


        {/* Dates */}
        <div className="flex-[1.5] rounded-xl border border-slate-200 bg-white px-4 py-2 transition-all focus-within:border-[#0194f3] focus-within:ring-2 focus-within:ring-[#0194f3]/20 md:py-3">
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Ngày nhận phòng và trả phòng
          </label>
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="shrink-0 text-slate-400" />
            <div className="flex flex-1 items-center">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  const [start, end] = update;
                  handleDateChange("checkIn", start ? toDateInputValue(start) : "");
                  handleDateChange("checkOut", end ? toDateInputValue(end) : "");
                }}
                monthsShown={2}
                minDate={new Date()}
                customInput={<CustomDateInput startDate={startDate} endDate={endDate} />}
                className="w-full"
                wrapperClassName="w-full"
              />
            </div>
          </div>
        </div>

        {/* Guests & Rooms */}
        <div className="relative flex-1" ref={popupRef}>
          <div
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 transition-all hover:border-[#0194f3] md:py-3"
            onClick={() => setShowGuestPopup(!showGuestPopup)}
          >
            <label className="mb-1 block text-xs font-bold text-slate-500">
              Khách và Phòng
            </label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UsersRound size={18} className="shrink-0 text-slate-400" />
                <span className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {filters.adults || 1} người lớn, {filters.children || 0} trẻ em
                </span>
              </div>
              <ChevronDown size={16} className={`shrink-0 text-[#0194f3] transition-transform ${showGuestPopup ? "rotate-180" : ""}`} />
            </div>
          </div>

          {/* Guest Popup */}
          {showGuestPopup && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Người lớn</p>
                    <p className="text-xs text-slate-500">Từ 13 tuổi trở lên</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleGuestChange("adults", (filters.adults || 1) - 1)}
                      className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-[#0194f3] transition hover:bg-blue-100 disabled:opacity-50"
                      disabled={(filters.adults || 1) <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold text-slate-900">{filters.adults || 1}</span>
                    <button
                      type="button"
                      onClick={() => handleGuestChange("adults", (filters.adults || 1) + 1)}
                      className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-[#0194f3] transition hover:bg-blue-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Trẻ em</p>
                    <p className="text-xs text-slate-500">Dưới 13 tuổi</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleGuestChange("children", (filters.children || 0) - 1)}
                      className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-[#0194f3] transition hover:bg-blue-100 disabled:opacity-50"
                      disabled={(filters.children || 0) <= 0}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold text-slate-900">{filters.children || 0}</span>
                    <button
                      type="button"
                      onClick={() => handleGuestChange("children", (filters.children || 0) + 1)}
                      className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-[#0194f3] transition hover:bg-blue-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-3 text-right">
                <button
                  type="button"
                  onClick={() => setShowGuestPopup(false)}
                  className="text-sm font-bold text-[#0194f3] hover:underline"
                >
                  Xong
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSearching}
          className="flex min-h-[58px] min-w-[120px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0194f3] px-6 text-base font-bold text-white shadow-lg shadow-[#0194f3]/30 transition hover:bg-[#017bc0] disabled:cursor-not-allowed disabled:opacity-70 md:rounded-2xl md:px-8"
        >
          <Search size={20} />
          {isSearching ? "Tìm..." : "Tìm kiếm"}
        </button>
      </form>
    </div>
  );
};

export default HorizontalSearchFilter;
