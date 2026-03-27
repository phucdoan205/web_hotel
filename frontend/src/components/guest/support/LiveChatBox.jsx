import { MessageSquare, Mail, Phone, Share2 } from "lucide-react";
import ContactSidebar from "./ContactSidebar";

const LiveChatBox = () => (
  <div className="grid grid-cols-3 gap-8 mb-16">
    {/* Live Chat */}
    <div className="col-span-2 bg-[#0085FF] rounded-[2.5rem] p-12 text-white flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl shadow-blue-100">
      <MessageSquare
        size={48}
        className="mb-6 opacity-80"
        fill="currentColor"
      />
      <h2 className="text-2xl font-black mb-3">
        Instant Support via Live Chat
      </h2>
      <p className="text-blue-100 text-[13px] font-medium mb-8 max-w-sm">
        Get connected with our customer service agents in less than 2 minutes.
        Available 24/7.
      </p>
      <button className="bg-white text-[#0085FF] px-10 py-4 rounded-2xl text-[12px] font-black flex items-center gap-3 hover:bg-blue-50 transition-colors">
        <MessageSquare size={16} fill="currentColor" />
        Start Live Chat
      </button>
    </div>

    {/* Other ways to reach */}
    <ContactSidebar />
  </div>
);

export default LiveChatBox;
