import React from "react";
import { Mail, Phone, Share2 } from "lucide-react";

const ContactSidebar = () => {
  const contactMethods = [
    {
      icon: <Mail size={18} />,
      title: "Email Us",
      value: "support@travelease.com",
      isBlue: true,
    },
    {
      icon: <Phone size={18} />,
      title: "24/7 Hotline",
      value: "+1 (800) TRAVEL-ES",
      isBlue: false,
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-full">
      <h3 className="text-[14px] font-black text-gray-900 mb-8 uppercase tracking-tight">
        Other ways to reach us
      </h3>

      <div className="space-y-8">
        {contactMethods.map((method, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="size-10 bg-blue-50 text-[#0085FF] rounded-xl flex items-center justify-center shrink-0">
              {method.icon}
            </div>
            <div>
              <p className="text-[12px] font-black text-gray-900">
                {method.title}
              </p>
              <p
                className={`text-[10px] font-bold break-all ${method.isBlue ? "text-[#0085FF]" : "text-gray-400"}`}
              >
                {method.value}
              </p>
            </div>
          </div>
        ))}

        {/* Social Media Section */}
        <div className="flex items-start gap-4 border-t border-gray-50 pt-8">
          <div className="size-10 bg-blue-50 text-[#0085FF] rounded-xl flex items-center justify-center shrink-0">
            <Share2 size={18} />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-900">Social Media</p>
            <div className="flex gap-3 mt-3">
              {["f", "t"].map((social) => (
                <button
                  key={social}
                  className="size-8 bg-gray-50 hover:bg-blue-50 hover:text-[#0085FF] rounded-lg text-gray-400 flex items-center justify-center text-[12px] font-black transition-colors"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSidebar;
