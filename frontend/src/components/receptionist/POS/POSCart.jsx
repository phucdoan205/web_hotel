import React from "react";
import { Trash2, Minus, Plus, CreditCard } from "lucide-react";

const POSCart = ({ items, onRemove, onUpdateQty, total }) => {
  return (
    <div className="w-96 bg-white border-l border-gray-100 flex flex-col h-full shadow-xl">
      <div className="p-6 border-b border-gray-50">
        <h2 className="text-xl font-black text-gray-900">Chi tiết đơn hàng</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-300 font-bold uppercase text-[10px] tracking-widest">
            Chưa có sản phẩm nào
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100/50"
            >
              <div className="size-16 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <p className="text-xs font-black text-gray-800 truncate">
                  {item.name}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 p-1">
                    <button
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="p-1 hover:text-blue-500"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-[10px] font-black w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="p-1 hover:text-blue-500"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-rose-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-gray-50 bg-white space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Tổng cộng
          </span>
          <span className="text-2xl font-black text-gray-900">
            {total.toLocaleString()} VND
          </span>
        </div>
        <button className="w-full bg-[#0085FF] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
          <CreditCard size={18} /> Thanh toán / Ký phòng
        </button>
      </div>
    </div>
  );
};

export default POSCart;
