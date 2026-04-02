import React from "react";
import { Wifi } from "lucide-react";

const CreditCard = ({ type, last4, holder, expiry, isDefault }) => {
  const isVisa = type.toLowerCase() === "visa";

  return (
    <div
      className={`relative w-[320px] h-[190px] rounded-[1.5rem] p-6 text-white shadow-lg overflow-hidden ${
        isVisa ? "bg-[#1A1F26]" : "bg-[#2D336B]"
      }`}
    >
      {isDefault && (
        <div className="absolute left-5 top-5 text-[9px] font-black bg-white/15 px-2 py-1 rounded-lg">
          DEFAULT
        </div>
      )}
      {/* Chip & Contactless Icon */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-xl font-bold italic tracking-wider">
          {isVisa ? "VISA" : "MasterCard"}
        </div>
        <Wifi className="rotate-90 opacity-60" size={20} />
      </div>

      <div className="mb-6">
        <p className="text-[10px] uppercase opacity-60 tracking-widest mb-1 font-black">
          Card Number
        </p>
        <p className="text-lg tracking-[0.2em] font-medium">
          **** **** **** {last4}
        </p>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] uppercase opacity-60 font-black mb-1">
            Card Holder
          </p>
          <p className="text-[11px] font-black uppercase tracking-tight">
            {holder}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase opacity-60 font-black mb-1">
            Expires
          </p>
          <p className="text-[11px] font-black">{expiry}</p>
        </div>
      </div>

      {/* Background patterns */}
      <div className="absolute -right-4 -bottom-4 size-24 bg-white/5 rounded-full blur-2xl" />
    </div>
  );
};

export default CreditCard;
