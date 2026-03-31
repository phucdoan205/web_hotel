import React from "react";

const VoucherHero = () => (
  <div className="bg-[#0085FF] rounded-[2rem] p-10 text-white flex justify-between items-center relative overflow-hidden mb-8 shadow-lg shadow-blue-100">
    <div className="z-10 max-w-lg">
      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
        New User Special
      </span>
      <h2 className="text-3xl font-black mb-3">
        50% Off Your First Hotel Stay
      </h2>
      <p className="text-blue-50 text-[13px] font-medium leading-relaxed opacity-90">
        Welcome to our platform! Enjoy a massive discount on any booking made
        within your first 30 days.
      </p>
    </div>

    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl flex flex-col items-center gap-3 min-w-[220px]">
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-tighter opacity-60 mb-1">
          PROMO CODE
        </p>
        <p className="text-lg font-black tracking-widest">WELCOME50</p>
      </div>
      <button className="w-full bg-white text-[#0085FF] py-2.5 rounded-xl text-[11px] font-black hover:bg-blue-50 transition-colors uppercase">
        Copy
      </button>
    </div>
  </div>
);

export default VoucherHero;
