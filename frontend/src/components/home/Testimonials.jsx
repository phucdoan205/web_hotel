import React from "react";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Sarah Jenkins",
    role: "Traveler from USA",
    content:
      "The booking process was so seamless, and the hotel exceeded our expectations! Traveloka made our trip stress-free.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    rating: 5,
  },
  {
    name: "Akira Tanaka",
    role: "Family trip from Japan",
    content:
      "Excellent customer support when I needed to change my dates. They made everything so easy and friendly.",
    avatar: "https://i.pravatar.cc/150?u=akira",
    rating: 5,
  },
  {
    name: "Samy Chen",
    role: "Soloist from Singapore",
    content:
      'Found the best deals on this platform. The "Exclusive Offers" section is truly a game changer for budget travelers!',
    avatar: "https://i.pravatar.cc/150?u=samy",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Trusted by Millions of Travelers
          </h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative hover:shadow-xl transition-shadow duration-300"
            >
              <Quote className="absolute top-6 right-6 text-blue-100 w-12 h-12" />

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-14 h-14 rounded-full border-2 border-blue-100"
                />
                <div>
                  <h4 className="font-bold text-slate-800">{rev.name}</h4>
                  <p className="text-slate-400 text-xs">{rev.role}</p>
                </div>
              </div>

              <p className="text-slate-600 italic leading-relaxed mb-6">
                "{rev.content}"
              </p>

              <div className="flex gap-1">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill="#fbbf24"
                    className="text-amber-400"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
