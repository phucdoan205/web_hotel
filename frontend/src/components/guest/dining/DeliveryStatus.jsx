import React from "react";
import { Truck } from "lucide-react";

const DeliveryStatus = () => (
  <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
    {/* Dải màu trang trí bên trái */}
    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-100"></div>

    <div className="flex items-center gap-4 ml-2">
      <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0085FF]">
        <Truck size={22} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
          Estimated Delivery
        </p>
        <p className="text-[13px] font-black text-gray-900 mt-0.5">
          25 - 35 mins <span className="text-gray-400 font-bold mx-1">to</span>{" "}
          Room 402
        </p>
      </div>
    </div>

    <div className="text-right border-l border-gray-50 pl-8">
      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
        Service Fee
      </p>
      <p className="text-[11px] font-black text-emerald-500 mt-0.5">
        Free for Gold Members
      </p>
    </div>
  </div>
);

export default DeliveryStatus;
