import React from "react";
import { QrCode } from "lucide-react";

const DetailQuickCheckIn = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
    <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-6">
      Quick Check-In
    </h4>

    {/* QR Code Placeholder */}
    <div className="bg-gray-50 p-6 rounded-[2rem] inline-block mb-6 border border-gray-100">
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <QrCode size={120} strokeWidth={1.5} className="text-gray-900" />
      </div>
    </div>

    <p className="text-[13px] font-black text-gray-900 mb-2">
      Show this QR to Reception
    </p>
    <p className="text-[11px] font-bold text-gray-400 leading-relaxed px-4">
      Present your ID along with this code for a faster check-in process.
    </p>
  </div>
);

export default DetailQuickCheckIn;
