import React from "react";
import { Plus } from "lucide-react";

const AddCardButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-[320px] h-[190px] border-2 border-dashed border-gray-200 rounded-[1.5rem] 
                 flex flex-col items-center justify-center gap-3 text-gray-300 
                 hover:border-[#0085FF] hover:text-[#0085FF] hover:bg-blue-50/30 
                 transition-all duration-300 cursor-pointer bg-white/50 group"
    >
      {/* Biểu tượng dấu cộng nằm trong vòng tròn */}
      <div
        className="size-12 bg-gray-50 rounded-full flex items-center justify-center 
                      group-hover:bg-white group-hover:shadow-md transition-all"
      >
        <Plus size={24} strokeWidth={3} />
      </div>

      {/* Nhãn văn bản in hoa */}
      <p className="text-[10px] font-black uppercase tracking-[0.15em]">
        Add another card
      </p>
    </button>
  );
};

export default AddCardButton;
