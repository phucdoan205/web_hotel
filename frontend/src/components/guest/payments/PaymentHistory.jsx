const PaymentHistory = ({ transactions }) => {
  const statusColors = {
    COMPLETED: "bg-emerald-50 text-emerald-500",
    PROCESSING: "bg-orange-50 text-orange-400",
    FAILED: "bg-slate-100 text-slate-400",
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-900">Payment History</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-50 text-[10px] font-black rounded-xl text-gray-400 uppercase tracking-widest">
            Filter
          </button>
          <button className="px-4 py-2 bg-gray-50 text-[10px] font-black rounded-xl text-gray-400 uppercase tracking-widest">
            Export CSV
          </button>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <tr>
            <th className="px-8 py-5">Date</th>
            <th className="px-8 py-5">Transaction ID</th>
            <th className="px-8 py-5">Description</th>
            <th className="px-8 py-5 text-center">Amount</th>
            <th className="px-8 py-5 text-center">Status</th>
            <th className="px-8 py-5 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((t, idx) => (
            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5 text-[11px] font-bold text-gray-700">
                {t.date}
              </td>
              <td className="px-8 py-5 text-[11px] font-bold text-gray-400 tracking-tight">
                {t.id}
              </td>
              <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-[11px] font-black text-gray-900">
                    {t.desc}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5 text-[11px] font-black text-gray-900 text-center">
                ${t.amount}
              </td>
              <td className="px-8 py-5 text-center">
                <span
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[t.status]}`}
                >
                  {t.status}
                </span>
              </td>
              <td className="px-8 py-5 text-center">
                <button className="p-2 text-gray-300 hover:text-[#0085FF] transition-colors">
                  📥
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
