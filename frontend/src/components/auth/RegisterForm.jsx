import React from "react";
import { useRegister } from "../../hooks/useRegister";
import { Link, NavLink } from "react-router-dom";

const RegisterForm = () => {
  const { formData, errors, isLoading, handleChange, handleSubmit } =
    useRegister();

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 text-blue-600 text-xl font-bold mb-10">
          <span className="text-2xl">✈️</span> TravelEase
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Create an account
        </h2>
        <p className="text-slate-500 mb-8">
          Join us to explore the world with ease and exclusive travel deals.
        </p>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+62 812 345 6789"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-slate-600">
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms and Conditions
              </a>
            </label>
          </div>
          <NavLink to="/login">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-blue-100 transition-all uppercase tracking-wide">
              Sign Up
            </button>
          </NavLink>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-bold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
