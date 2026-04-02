const CategoryCard = ({ icon, title, desc }) => {
  const Icon = icon;
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="size-12 bg-blue-50 text-[#0085FF] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0085FF] group-hover:text-white transition-colors">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <h3 className="text-[15px] font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-[11px] font-bold text-gray-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

export default CategoryCard;
