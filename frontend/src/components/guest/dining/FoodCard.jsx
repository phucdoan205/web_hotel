const FoodCard = ({ item }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
    <div className="relative h-48 overflow-hidden">
      <img
        src={item.img}
        alt={item.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
        <span className="text-orange-400 text-[10px]">★</span>
        <span className="text-[10px] font-black text-gray-900">
          {item.rating}
        </span>
      </div>
    </div>
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[13px] font-black text-gray-900 leading-tight">
          {item.name}
        </h4>
        <span className="text-[#0085FF] text-[13px] font-black">
          ${item.price.toFixed(2)}
        </span>
      </div>
      <p className="text-[10px] font-bold text-gray-400 mb-5 line-clamp-2">
        {item.desc}
      </p>
      <button className="w-full py-2.5 bg-blue-50 text-[#0085FF] text-[10px] font-black rounded-xl hover:bg-[#0085FF] hover:text-white transition-colors flex items-center justify-center gap-2">
        <span>+</span> Add to Cart
      </button>
    </div>
  </div>
);
export default FoodCard;
