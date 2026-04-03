import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, activeTab, onAddToCart }) => {
  // Lọc sản phẩm theo danh mục đang chọn
  const filteredProducts = products.filter(
    (product) => product.category === activeTab,
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
        ))
      ) : (
        <div className="col-span-full py-20 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
            Không tìm thấy sản phẩm trong danh mục này
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
