import React from "react";
import { Calendar, CreditCard, ShieldCheck, ChevronRight } from "lucide-react";
import SupportHero from "../../components/user/support/SupportHero";
import CategoryCard from "../../components/user/support/CategoryCard";
import LiveChatBox from "../../components/user/support/LiveChatBox";
import FAQAccordion from "../../components/user/support/FAQAccordion";

const UserCustomerSupportPage = () => {
  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen">
      <SupportHero />

      {/* Categories */}
      <div className="mb-16">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-8">
          Browse by Category
        </h4>
        <div className="grid grid-cols-3 gap-8">
          <CategoryCard
            icon={Calendar}
            title="Booking & Reservation"
            desc="Rescheduling, cancellations, and checking booking status."
          />
          <CategoryCard
            icon={CreditCard}
            title="Payment & Refunds"
            desc="Payment methods, refund timelines, and invoice requests."
          />
          <CategoryCard
            icon={ShieldCheck}
            title="Account & Security"
            desc="Password reset, profile settings, and account data privacy."
          />
        </div>
      </div>

      <LiveChatBox />

      {/* Popular Questions */}
      <FAQAccordion />

      <footer className="mt-20 text-center text-[10px] font-bold text-gray-300">
        © 2024 TravelEase Inc. All rights reserved. Professional Travel
        Services.
      </footer>
    </div>
  );
};

export default UserCustomerSupportPage;
