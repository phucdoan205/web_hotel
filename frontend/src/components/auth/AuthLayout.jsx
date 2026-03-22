import React from "react";

const AuthLayout = ({ children, title, subtitle, image, badgeText }) => {
  return (
    <div className="flex min-h-screen w-full bg-white font-sans antialiased">
      {/* Bên trái: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-2 text-blue-500 mb-8 font-bold text-xl">
            <div className="p-1.5 bg-blue-500 rounded-lg text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            TravelEase
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
          <p className="text-slate-500 mb-8 text-sm">{subtitle}</p>
          {children}
        </div>
      </div>

      {/* Bên phải: Hình ảnh (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={image}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Auth Background"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-20 left-16 right-16 text-white">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold mb-4 inline-block tracking-widest uppercase">
            ★ {badgeText}
          </span>
          <h2 className="text-5xl font-bold leading-tight mb-6 text-white">
            Discover your next luxury stay.
          </h2>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
