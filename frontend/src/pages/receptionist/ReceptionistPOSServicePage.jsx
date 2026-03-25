import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import POSCategoryTab from "../../components/receptionist/POS/POSCategoryTab";
import ProductGrid from "../../components/receptionist/POS/ProductGrid";
import POSCart from "../../components/receptionist/POS/POSCart";
import { MOCK_PRODUCTS } from "../../constants/ProductMockData";

const ReceptionistPOSServicePage = () => {
  const [activeTab, setActiveTab] = useState("Food");
  const { cartItems, addToCart, removeFromCart, updateQuantity, total } =
    useCart();

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Dịch vụ POS
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Order món ăn và dịch vụ cho khách.
          </p>
        </header>

        {/* Gọi Component Tab */}
        <div className="mb-8">
          <POSCategoryTab activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Gọi Component Lưới sản phẩm */}
        <ProductGrid
          products={MOCK_PRODUCTS}
          activeTab={activeTab}
          onAddToCart={addToCart}
        />
      </div>

      {/* Sidebar giỏ hàng bên phải */}
      <POSCart
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQuantity}
        total={total}
      />
    </div>
  );
};

export default ReceptionistPOSServicePage;
