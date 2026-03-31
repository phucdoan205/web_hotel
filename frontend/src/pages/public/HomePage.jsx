import React from "react";
import Hero from "../../components/home/Hero";
import FeaturedHotels from "../../components/home/FeaturedHotels";
import Destinations from "../../components/home/Destinations";
import Testimonials from "../../components/home/Testimonials";

const HomePage = () => {
  return (
    <div className="bg-slate-50/30">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Popular Destinations (Bạn có thể clone cấu trúc FeaturedHotels) */}
      <Destinations />

      {/* 3. Featured Hotels */}
      <FeaturedHotels />

      {/* 4. Exclusive Offers (Banner quảng cáo) */}
      <section className="bg-blue-50 py-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl flex gap-6 items-center shadow-sm">
            <div className="w-32 h-32 bg-slate-200 rounded-lg overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-blue-500 text-xs font-bold uppercase">
                Limited Period
              </span>
              <h3 className="text-xl font-bold mt-1">30% OFF Spa treatments</h3>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">
                Claim Now
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl flex gap-6 items-center shadow-sm">
            <div className="w-32 h-32 bg-slate-200 rounded-lg overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-blue-500 text-xs font-bold uppercase">
                Family Special
              </span>
              <h3 className="text-xl font-bold mt-1">
                Free Breakfast for Kids
              </h3>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">
                Claim Now
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* 5. Testimonials */}
      <Testimonials />
    </div>
  );
};

export default HomePage;
