import React from "react";
import { AlignLeft } from "lucide-react";

const SpecialInstructions = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <AlignLeft size={14} className="text-gray-400" />
      <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-widest">
        Special Instructions
      </h4>
    </div>

    <textarea
      placeholder="Tell us if you have allergies or special requests..."
      className="w-full h-24 p-4 bg-gray-50 rounded-2xl border-none text-[11px] font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-100 outline-none resize-none leading-relaxed"
    ></textarea>

    <div className="mt-3 flex items-center gap-2">
      <div className="size-1.5 bg-orange-400 rounded-full"></div>
      <p className="text-[9px] font-bold text-gray-300 italic">
        Chef will do their best to accommodate your request.
      </p>
    </div>
  </div>
);

export default SpecialInstructions;
