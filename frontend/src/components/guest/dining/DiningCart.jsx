const DiningCart = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
        <span className="text-[#0085FF]">🧺</span> Your Order
      </h3>
      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
        2 Items
      </span>
    </div>

    <div className="space-y-6 mb-8">
      {/* Item 1 */}
      <div className="flex gap-4">
        <img src="https://file.hstatic.net/200000700229/article/dui-ga-chien-nuoc-mam-1_e3f91a9dcf3f4d01a8db555af50e9287.jpg" className="size-16 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="flex justify-between">
            <h5 className="text-[11px] font-black text-gray-900">
              Salmon Power Bowl
            </h5>
            <span className="text-[11px] font-black">$24.00</span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 mt-0.5 italic">
            No onions please
          </p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
              <button className="text-gray-400 hover:text-gray-900">-</button>
              <span className="text-[11px] font-black">1</span>
              <button className="text-gray-400 hover:text-gray-900">+</button>
            </div>
            <button className="text-rose-500 text-[9px] font-black uppercase">
              Remove
            </button>
          </div>
        </div>
      </div>
      {/* ... Thêm các item khác ... */}
    </div>

    {/* Summary */}
    <div className="space-y-3 border-t border-dashed border-gray-100 pt-6">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-gray-400">Subtotal</span>
        <span className="text-gray-900">$38.00</span>
      </div>
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-gray-400">Service Charge (10%)</span>
        <span className="text-gray-900">$3.80</span>
      </div>
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-emerald-500 italic">Gold Discount</span>
        <span className="text-emerald-500">-$3.00</span>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <span className="text-[13px] font-black text-gray-900">
          Total Amount
        </span>
        <span className="text-xl font-black text-[#0085FF]">$38.80</span>
      </div>
    </div>

    <button className="w-full mt-8 py-4 bg-[#0085FF] text-white rounded-2xl text-[11px] font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
      🚀 Place Order to Room 402
    </button>
  </div>
);

export default DiningCart;

