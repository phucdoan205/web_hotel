import React from "react";
import FoodHero from "../../components/food/FoodHero";
import FoodCategories from "../../components/food/FoodCategories";
import FoodCard from "../../components/food/FoodCard";

const dummyFoods = [
  {
    id: 1,
    name: "Premium Sushi Omakase",
    hotel: "Grand Hyatt Jakarta",
    price: 450000,
    rating: 4.9,
    image: "https://cdn-icons-png.flaticon.com/512/2252/2252912.png",
  }, // Thay URL bằng ảnh thật
  {
    id: 2,
    name: "Signature BBQ Beef Ribs",
    hotel: "Marriott Hotel",
    price: 275000,
    rating: 4.7,
    image: "https://cdn-icons-png.flaticon.com/512/3448/3448099.png",
  },
  {
    id: 3,
    name: "Luxury Afternoon Tea",
    hotel: "The Ritz-Carlton",
    price: 180000,
    rating: 4.8,
    image: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
  },
  {
    id: 4,
    name: "Australian Wagyu Steak",
    hotel: "Hilton Garden Inn",
    price: 520000,
    rating: 4.6,
    image: "https://cdn-icons-png.flaticon.com/512/1037/1037704.png",
  },
];

const FoodPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-10 py-6">
        <FoodHero />
        <FoodCategories />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {dummyFoods.map((food) => (
            <FoodCard key={food.id} item={food} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodPage;
