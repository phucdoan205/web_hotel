import React from "react";
import VoucherHero from "../../components/guest/vouchers/VoucherHero";
import VoucherCard from "../../components/guest/vouchers/VoucherCard";
import VoucherGuide from "../../components/guest/vouchers/VoucherGuide";
import VoucherTabs from "../../components/guest/vouchers/VoucherTabs";

const GuestVoucherPage = () => {
  const voucherList = [
    {
      title: "Luxury Resort Stay",
      discount: "25%",
      color: "blue",
      expiry: "Dec 31, 2024",
      desc: "Valid for all premium resorts in Bali and Phuket with no minimum stay.",
    },
    {
      title: "Fine Dining Experience",
      discount: "$50",
      color: "green",
      expiry: "Nov 15, 2024",
      desc: "Redeemable at participating hotel restaurants and bars worldwide.",
    },
    {
      title: "Flight + Hotel Bundle",
      discount: "10%",
      color: "orange",
      expiry: "Oct 20, 2024",
      desc: "Extra discount on your vacation packages across South East Asia.",
    },
    {
      title: "Spa Treatment Gift",
      discount: "FREE",
      color: "purple",
      expiry: "Jan 10, 2025",
      desc: "Complimentary 60-minute massage at any 'Heavenly Spa' location.",
    },
  ];

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <nav className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Home / Account Settings /{" "}
          <span className="text-gray-900">My Vouchers</span>
        </nav>
        <h1 className="text-2xl font-black text-gray-900 mb-1">My Vouchers</h1>
        <p className="text-[12px] font-bold text-gray-400">
          Manage and redeem your hotel and travel vouchers to save on your next
          trip.
        </p>
      </div>

      <VoucherHero />

      {/* Tabs Filter */}
      <VoucherTabs />

      {/* Grid Danh sách */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {voucherList.map((item, idx) => (
          <VoucherCard key={idx} data={item} />
        ))}
      </div>

      {/* Footer Guide */}
      <VoucherGuide />
    </div>
  );
};

export default GuestVoucherPage;
