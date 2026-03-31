import React from "react";
import { PlusCircle } from "lucide-react";

const ProductCard = ({ product, onAdd }) => {
  return (
    <div className="bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="rounded-[1.5rem] overflow-hidden h-44 mb-4 bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="space-y-2 px-1">
        <h3 className="text-sm font-black text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[#0085FF] text-base font-black">
          {product.price.toLocaleString()} VND
        </p>
        <button
          onClick={() => onAdd(product)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-white border border-blue-100 rounded-xl text-[10px] font-black text-[#0085FF] hover:bg-blue-50 transition-colors uppercase tracking-wider"
        >
          <PlusCircle size={14} /> Thêm vào đơn
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
