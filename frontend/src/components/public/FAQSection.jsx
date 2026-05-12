import React, { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const FAQSection = ({ isDark }) => {
  const [activeCategory, setActiveCategory] = useState("membership");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { id: "membership", label: "Hạng thành viên" },
    { id: "benefits", label: "Đặc quyền thành viên" },
  ];

  const faqs = {
    membership: [
      {
        question: "Chương trình Thành viên là gì?",
        answer: "Chương trình Thành viên là hệ thống ưu đãi dành riêng cho khách hàng thân thiết của chúng tôi, nơi bạn có thể tích lũy điểm từ mỗi lần lưu trú và đổi lấy các đặc quyền cao cấp."
      },
      {
        question: "Làm thế nào để thăng hạng?",
        answer: "Bạn thăng hạng bằng cách tích lũy điểm thông qua việc đặt phòng và sử dụng dịch vụ tại khách sạn. Mỗi hạng (Bronze, Iron, Gold, Diamond) yêu cầu một số điểm tối thiểu nhất định."
      },
      {
        question: "Làm thế nào để duy trì hạng?",
        answer: "Hạng thành viên được duy trì dựa trên số điểm bạn tích lũy trong vòng 12 tháng gần nhất. Nếu số điểm không đạt mức tối thiểu của hạng hiện tại, hệ thống sẽ tự động điều chỉnh về hạng tương ứng."
      },
      {
        question: "Tôi có thể lên thẳng hạng Diamond nếu hiện tại tôi là thành viên Bronze không?",
        answer: "Có, chỉ cần bạn tích lũy đủ 10,000 điểm, hệ thống sẽ ngay lập tức nâng hạng của bạn lên Diamond mà không cần qua các hạng trung gian."
      }
    ],
    benefits: [
      {
        question: "Số tiền chi tiêu của tôi được tính như thế nào?",
        answer: "Mỗi 1,000 VNĐ chi tiêu cho tiền phòng và dịch vụ sẽ được quy đổi thành 1 điểm thưởng trong hệ thống của chúng tôi."
      },
      {
        question: "Nếu tôi hủy đơn hàng thì sao?",
        answer: "Khi hủy đơn hàng, số điểm thưởng dự kiến nhận được từ đơn hàng đó sẽ bị trừ khỏi tài khoản của bạn."
      },
      {
        question: "Tôi đã thanh toán nhưng hạng thành viên chưa cập nhật. Vì sao?",
        answer: "Điểm thưởng thường được cập nhật sau khi bạn hoàn tất thủ tục check-out. Nếu sau 24h kể từ khi trả phòng vẫn chưa thấy điểm, vui lòng liên hệ bộ phận hỗ trợ."
      },
      {
        question: "Tiêu chí thành viên mới sẽ ảnh hưởng đến hạng hiện tại như thế nào?",
        answer: "Các tiêu chí mới luôn được thiết kế để mang lại lợi ích tốt hơn cho khách hàng. Hạng hiện tại của bạn sẽ luôn được bảo lưu hoặc nâng cấp nếu thỏa mãn điều kiện mới."
      }
    ]
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className={`text-2xl font-black mb-8 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Câu hỏi thường gặp
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setOpenIndex(null);
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : isDark 
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-200 shadow-sm'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        {faqs[activeCategory].map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`border-b last:border-0 transition-colors ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              } ${isOpen ? (isDark ? 'bg-slate-800/30' : 'bg-slate-50/50') : ''}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className={`text-lg font-bold transition-colors ${
                  isOpen 
                    ? (isDark ? 'text-orange-400' : 'text-orange-600') 
                    : (isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900')
                }`}>
                  {faq.question}
                </span>
                <ChevronDown className={`size-5 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-orange-500' : 'text-slate-400'
                }`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className={`px-8 pb-8 text-base leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Support Link */}
      <div className="mt-8 text-center">
        <Link 
          to="/support/help-center"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors"
        >
          <MessageCircle className="size-4" />
          Trung tâm Hỗ trợ Hotel
        </Link>
      </div>
    </div>
  );
};

export default FAQSection;
