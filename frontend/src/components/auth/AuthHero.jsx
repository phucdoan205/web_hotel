import React from "react";

const AuthHero = () => {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-1/2 bg-cover bg-center p-12 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000')`,
      }}
    >
      {/* Overlay để text rõ hơn */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10">
      </div>

      <div className="relative z-10 text-white">
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Discover your next luxury stay
        </h1>
        <p className="text-lg opacity-90 max-w-md">
          Join thousands of travelers finding the best deals on hotels and
          flights every day.
        </p>
      </div>
    </div>
  );
};

export default AuthHero;
