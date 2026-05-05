import React from "react";
import { 
  LayoutGrid, 
  Car, 
  Utensils, 
  Sparkles, 
  CalendarDays, 
  MapPin, 
  Ticket,
  Coffee,
  Waves
} from "lucide-react";

const iconMap = {
  "di chuyển": Car,
  "đồ ăn & thức uống": Utensils,
  "spa": Sparkles,
  "sự kiện": CalendarDays,
  "tour du lịch": MapPin,
  "trải nghiệm": Ticket,
  "cà phê": Coffee,
  "hồ bơi": Waves,
};

const CategoryIcon = ({ name, iconUrl }) => {
  const [isError, setIsError] = React.useState(false);
  const IconComponent = iconMap[name?.toLowerCase()] || LayoutGrid;

  if (!iconUrl || isError) {
    return <IconComponent size={32} />;
  }

  return (
    <img
      src={iconUrl}
      alt={name}
      className="size-10 object-contain"
      onError={() => setIsError(true)}
    />
  );
};

const ServiceCategories = ({ categories, selectedCategoryId, onCategorySelect }) => {
  return (
    <div className="flex items-center justify-center gap-10 overflow-x-auto pb-6 no-scrollbar">
      <button
        onClick={() => onCategorySelect(null)}
        className={`flex flex-col items-center gap-3 min-w-[120px] transition-all ${
          selectedCategoryId === null ? "text-[#0194f3]" : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <div className={`flex size-20 items-center justify-center rounded-[28px] transition-all ${
          selectedCategoryId === null ? "bg-[#0194f3]/10 scale-110 shadow-md" : "bg-white shadow-sm ring-1 ring-slate-100"
        }`}>
          <LayoutGrid size={32} />
        </div>
        <span className="text-[13px] font-black uppercase tracking-tight text-center">Tất cả</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategorySelect(cat.id)}
          className={`flex flex-col items-center gap-3 min-w-[120px] transition-all ${
            selectedCategoryId === cat.id ? "text-[#0194f3]" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <div className={`flex size-20 items-center justify-center rounded-[28px] transition-all overflow-hidden ${
            selectedCategoryId === cat.id ? "bg-[#0194f3]/10 scale-110 shadow-md" : "bg-white shadow-sm ring-1 ring-slate-100"
          }`}>
            <CategoryIcon name={cat.name} iconUrl={cat.iconUrl} />
          </div>
          <span className="text-[13px] font-black uppercase tracking-tight text-center truncate w-full px-2">
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ServiceCategories;
