const StatsCards = () => {
  const stats = [
    { label: "Total Bookings", value: "12", icon: "🛌", bgColor: "bg-blue-50" },
    {
      label: "Active Vouchers",
      value: "4",
      icon: "🎫",
      bgColor: "bg-orange-50",
    },
    {
      label: "Loyalty Points",
      value: "2,450 pts",
      icon: "⭐",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm"
        >
          <div
            className={`${stat.bgColor} size-12 rounded-2xl flex items-center justify-center text-xl`}
          >
            {stat.icon}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {stat.label}
            </p>
            <p className="text-xl font-black text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
