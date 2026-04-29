const DetailPolicy = () => (
  <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-[2rem]">
    <h4 className="text-[11px] font-black uppercase text-orange-600 flex items-center gap-2 mb-3">
      ⚠️ Cancellation Policy
    </h4>
    <p className="text-[11px] font-bold text-orange-800 leading-relaxed">
      Free cancellation until{" "}
      <span className="underline">Oct 18, 2023, 14:00 PM</span>. After this
      time, cancellation fee of 1 night will apply.
    </p>
    <button className="mt-4 text-[10px] font-black text-orange-700 underline uppercase tracking-tighter">
      Read Full Policy
    </button>
  </div>
);

export default DetailPolicy;
