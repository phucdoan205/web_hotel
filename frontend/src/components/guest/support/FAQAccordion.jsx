import React from "react";
import { ChevronRight } from "lucide-react";

const FAQAccordion = () => {
  const faqs = [
    "How do I request a refund for my flight?",
    "Can I change the date of my hotel booking?",
    "Where can I find my e-ticket?",
    "What is the baggage allowance for my trip?",
  ];

  return (
    <div className="max-w-3xl mx-auto text-center mt-16">
      <h4 className="text-[13px] font-black text-gray-900 mb-8 uppercase tracking-widest opacity-80">
        Popular Questions
      </h4>

      <div className="space-y-3 mb-10">
        {faqs.map((question, idx) => (
          <button
            key={idx}
            className="w-full bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center 
                       hover:border-blue-200 hover:shadow-sm transition-all group active:scale-[0.99]"
          >
            <span className="text-[12px] font-bold text-gray-600 group-hover:text-gray-900 text-left">
              {question}
            </span>
            <ChevronRight
              size={18}
              className="text-gray-300 group-hover:text-[#0085FF] transition-transform group-hover:translate-x-1"
            />
          </button>
        ))}
      </div>

      <button className="text-[11px] font-black text-[#0085FF] hover:text-blue-700 uppercase tracking-widest transition-colors">
        View All FAQs
      </button>
    </div>
  );
};

export default FAQAccordion;
