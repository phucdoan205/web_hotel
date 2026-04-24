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
          Khám phá chỗ nghỉ sang trọng tiếp theo của bạn
        </h1>
        <p className="text-lg opacity-90 max-w-md">
          Hàng nghìn du khách tìm thấy ưu đãi tốt nhất cho khách sạn và
          chuyến bay mỗi ngày.
        </p>
      </div>
    </div>
  );
};

export default AuthHero;
