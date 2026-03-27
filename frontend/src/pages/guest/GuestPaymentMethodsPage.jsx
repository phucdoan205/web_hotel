import React from "react";
import CreditCard from "../../components/guest/payments/CreditCard";
import PaymentHistory from "../../components/guest/payments/PaymentHistory";
import AddCardButton from "../../components/guest/payments/AddCardButton";

const GuestPaymentMethodsPage = () => {
  const transactions = [
    {
      date: "Oct 24, 2023",
      id: "#TR-8921-001",
      desc: "Ritz-Carlton Jakarta - 2 Nights",
      amount: "342.00",
      status: "COMPLETED",
      icon: "🏨",
    },
    {
      date: "Oct 21, 2023",
      id: "#TR-8921-002",
      desc: "Flight to Singapore (SIN)",
      amount: "120.50",
      status: "COMPLETED",
      icon: "✈️",
    },
    {
      date: "Oct 18, 2023",
      id: "#TR-8921-003",
      desc: "Car Rental - Airport Pickup",
      amount: "45.00",
      status: "PROCESSING",
      icon: "🚗",
    },
    {
      date: "Oct 15, 2023",
      id: "#TR-8921-004",
      desc: "Universal Studios Tickets",
      amount: "188.00",
      status: "FAILED",
      icon: "🎟️",
    },
  ];

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Payment Methods
          </h1>
          <p className="text-[13px] font-bold text-gray-400">
            Manage your saved cards and view transaction history
          </p>
        </div>
        <button className="bg-[#FF5C1A] text-white px-6 py-3 rounded-2xl text-[11px] font-black flex items-center gap-2 hover:bg-[#e65016] shadow-lg shadow-orange-100">
          + Add New Method
        </button>
      </div>

      {/* Saved Cards Section */}
      <div className="mb-12">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">
          Saved Cards <span className="ml-2 text-gray-200">DEFAULT: VISA</span>
        </h3>
        <div className="flex gap-8">
          <CreditCard
            type="VISA"
            last4="4242"
            holder="TRAVELOKA USER"
            expiry="12/26"
          />
          <CreditCard
            type="MasterCard"
            last4="8888"
            holder="TRAVELOKA USER"
            expiry="09/25"
          />

          {/* Add card placeholder */}
          <AddCardButton
            onClick={() => alert("Add card functionality coming soon!")}
          />
        </div>
      </div>

      {/* History Section */}
      <PaymentHistory transactions={transactions} />
    </div>
  );
};

export default GuestPaymentMethodsPage;
