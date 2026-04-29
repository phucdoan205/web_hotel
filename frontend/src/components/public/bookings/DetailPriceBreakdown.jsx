const DetailPriceBreakdown = () => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
        Price Details
      </h4>
      <span className="bg-blue-100 text-[#0085FF] text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
        Paid
      </span>
    </div>
    <div className="space-y-4 border-b border-dashed border-gray-100 pb-6">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-gray-400">Deluxe King (2 nights)</span>
        <span className="text-gray-900">$450.00</span>
      </div>
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-gray-400">Taxes & Fees</span>
        <span className="text-gray-900">$45.00</span>
      </div>
    </div>
    <div className="flex justify-between items-center mt-6">
      <span className="text-sm font-black text-gray-900">Total Amount</span>
      <span className="text-xl font-black text-[#0085FF]">$495.00</span>
    </div>
    <div className="mt-6 flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-5 bg-blue-900 rounded-sm"></div>
        <span className="text-[10px] font-bold text-gray-400">
          Mastercard ending in 4421
        </span>
      </div>
      <button className="text-[#0085FF] text-[10px] font-black">Invoice</button>
    </div>
  </div>
);

export default DetailPriceBreakdown;
