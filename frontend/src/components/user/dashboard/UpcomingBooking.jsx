const UpcomingBooking = () => (
  <section className="mb-10">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-blue-500">📅</span>
      <h2 className="text-sm font-black text-gray-900 uppercase">
        Upcoming Booking
      </h2>
    </div>
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex gap-6 shadow-sm">
      <img
        src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
        alt="Hotel"
        className="w-44 h-36 rounded-3xl object-cover"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">
              Confirmed
            </span>
            <h3 className="text-lg font-black text-gray-900 mt-2">
              Grand Hyatt Saigon
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Oct 20 - Oct 22, 2023 • 2 Adults, 1 Room
            </p>
          </div>
          <span className="text-xl font-black text-[#0085FF]">$180.00</span>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-[#0085FF] text-white py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100">
            View Details
          </button>
          <button className="flex-1 bg-white border border-gray-100 text-gray-900 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-gray-50">
            Manage
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default UpcomingBooking;
