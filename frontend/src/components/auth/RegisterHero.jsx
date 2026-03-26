import React from "react";

const RegisterHero = () => {
  return (
    <div
      className="hidden lg:flex flex-col justify-center w-1/2 bg-cover bg-center p-16 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000')`,
      }}
    >
      {/* Overlay xanh biển nhẹ để hòa hợp với concept du lịch */}
      <div className="absolute inset-0 bg-blue-900/10"></div>

      <div className="relative z-10 text-white">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
            <span className="text-white">⭐</span>
          </div>
          <span className="uppercase tracking-widest text-sm font-semibold">
            Premium Destinations
          </span>
        </div>

        <h1 className="text-5xl font-extrabold leading-tight mb-6">
          Your next adventure starts right here.
        </h1>

        <p className="text-lg opacity-90 max-w-md leading-relaxed">
          Discover thousands of hand-picked hotels and flights at the best
          prices. We've helped over 2 million travelers find their dream
          vacation.
        </p>
      </div>
    </div>
  );
};

export default RegisterHero;
