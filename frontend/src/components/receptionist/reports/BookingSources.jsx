import React from "react";

const BookingSources = () => {
  const sources = [
    { label: "OTA", value: "65%", color: "bg-[#0085FF]" },
    { label: "Direct", value: "25%", color: "bg-cyan-400" },
    { label: "Agency", value: "10%", color: "bg-blue-200" },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-black text-gray-900 mb-8">Booking Sources</h3>

      {/* Giả lập Chart bằng CSS */}
      <div className="relative size-48 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-[16px] border-[#0085FF] border-r-cyan-400 border-b-blue-200 rotate-45" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-black text-gray-900">142</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
        </div>
      </div>

      <div className="space-y-3 mt-auto">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${s.color}`} />
              <span className="text-[11px] font-bold text-gray-500">
                {s.label} ({s.value})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingSources;
