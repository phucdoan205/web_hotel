import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, MapPin, Search, UsersRound, Minus, Plus, ChevronDown } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import vi from "date-fns/locale/vi";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="relative mx-auto w-full rounded-3xl bg-white p-3 shadow-2xl md:rounded-[2rem] md:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowGuestPopup(false);
          onSubmit(e);
        }}
        className="flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        {/* Dates */}
        <div className="flex-[1.5] rounded-2xl border border-slate-200 bg-white px-5 py-3 transition-all focus-within:border-[#0194f3] focus-within:ring-4 focus-within:ring-[#0194f3]/10">
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-400">
            Ngày nhận & trả phòng
          </label>
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="shrink-0 text-[#0194f3]" />
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
                monthsShown={window.innerWidth > 768 ? 2 : 1}
                minDate={new Date()}
                customInput={<CustomDateInput startDate={startDate} endDate={endDate} />}
                className="w-full"
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
              />
            </div>
          </div>
        </div>

        {/* Guests & Rooms */}
        <div className="relative flex-1" ref={popupRef}>
          <div
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-3 transition-all hover:border-[#0194f3]"
            onClick={() => setShowGuestPopup(!showGuestPopup)}
          >
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-400">
              Khách và Phòng
            </label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <UsersRound size={20} className="shrink-0 text-[#0194f3]" />
                <span className="text-sm font-bold text-slate-900 line-clamp-1">
                  {filters.adults || 1} người lớn, {filters.children || 0} trẻ em
                </span>
              </div>
              <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-300 ${showGuestPopup ? "rotate-180" : ""}`} />
            </div>
          </div>

          {/* Guest Popup */}
          <AnimatePresence>
            {showGuestPopup && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">Người lớn</p>
                      <p className="text-xs font-medium text-slate-400">Từ 13 tuổi trở lên</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleGuestChange("adults", (filters.adults || 1) - 1)}
                        className="flex size-9 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#0194f3] transition hover:bg-blue-50 disabled:opacity-30"
                        disabled={(filters.adults || 1) <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-4 text-center text-base font-black text-slate-900">{filters.adults || 1}</span>
                      <button
                        type="button"
                        onClick={() => handleGuestChange("adults", (filters.adults || 1) + 1)}
                        className="flex size-9 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#0194f3] transition hover:bg-blue-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">Trẻ em</p>
                      <p className="text-xs font-medium text-slate-400">Dưới 13 tuổi</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleGuestChange("children", (filters.children || 0) - 1)}
                        className="flex size-9 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#0194f3] transition hover:bg-blue-50 disabled:opacity-30"
                        disabled={(filters.children || 0) <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-4 text-center text-base font-black text-slate-900">{filters.children || 0}</span>
                      <button
                        type="button"
                        onClick={() => handleGuestChange("children", (filters.children || 0) + 1)}
                        className="flex size-9 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#0194f3] transition hover:bg-blue-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4 text-right">
                  <button
                    type="button"
                    onClick={() => setShowGuestPopup(false)}
                    className="rounded-lg px-4 py-2 text-sm font-black text-[#0194f3] transition hover:bg-blue-50"
                  >
                    Hoàn tất
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSearching}
          className="flex min-h-[64px] items-center justify-center gap-3 rounded-2xl bg-[#0194f3] px-10 text-base font-black text-white shadow-xl shadow-blue-200 transition-all hover:bg-[#017bc0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto"
        >
          <Search size={22} />
          {isSearching ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </form>
    </div>
  );
};

export default HorizontalSearchFilter;
