import React from "react";
import ActivityHero from "../../components/activities/ActivityHero";
import ActivityFilters from "../../components/activities/ActivityFilters";
import ActivityCard from "../../components/activities/ActivityCard";

const dummyActivities = [
  {
    id: 1,
    tag: "Tours",
    duration: "4 Hours",
    rating: 4.9,
    reviews: 120,
    title: "Sunrise Hot Air Balloon Over Rice Fields",
    price: "189.000",
    oldPrice: "250.000",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500",
  },
  {
    id: 2,
    tag: "Attractions",
    duration: "Full Day",
    rating: 4.8,
    reviews: 540,
    title: "Bali Uluwatu Temple Sunset Tour",
    price: "45.000",
    oldPrice: "60.000",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=500",
  },
  {
    id: 3,
    tag: "Workshops",
    duration: "3 Hours",
    rating: 5.0,
    reviews: 210,
    title: "Authentic Sushi Making Class in Tokyo",
    price: "75.000",
    oldPrice: "90.000",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500",
  },
  {
    id: 4,
    tag: "Wellness",
    duration: "90 Mins",
    rating: 4.7,
    reviews: 85,
    title: "Mindfulness Yoga & Meditation Session",
    price: "29.000",
    oldPrice: "40.000",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
  },
];

const ActivityPage = () => {
  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <ActivityHero />

      <div className="max-w-7xl mx-auto px-10">
        <ActivityFilters />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            Activities Recommended for You
          </h2>
          <button className="text-blue-500 font-bold text-sm">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyActivities.map((act) => (
            <ActivityCard key={act.id} data={act} />
          ))}
        </div>

        {/* Popular Destinations for Activities Section */}
        <div className="mt-20">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Popular Destinations for Activities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {["Bali", "Kyoto", "Bangkok", "Paris", "Dubai", "Lombok"].map(
              (city) => (
                <div
                  key={city}
                  className="relative h-44 rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
                >
                  <img
                    src={`https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=300`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    alt={city}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                    <span className="text-white font-bold">{city}</span>
                    <span className="text-white/60 text-[10px]">
                      100+ Activities
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
