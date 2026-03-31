import React from "react";
import { Search } from "lucide-react";

const SupportHero = () => (
  <div className="text-center py-16 bg-gradient-to-b from-blue-50/50 to-transparent">
    <h1 className="text-4xl font-black text-gray-900 mb-4">
      How can we help you today?
    </h1>
    <p className="text-[14px] font-bold text-gray-400 mb-10">
      Search for FAQs, guides, or contact our support team 24/7.
    </p>

    <div className="max-w-2xl mx-auto relative">
      <Search
        className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"
        size={20}
      />
      <input
        type="text"
        placeholder="Describe your issue (e.g. refund, check-in, baggage)"
        className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-[13px] font-bold"
      />
    </div>
  </div>
);

export default SupportHero;
