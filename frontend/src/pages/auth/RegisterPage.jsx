import React from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import { useRegister } from "../../hooks/useRegister";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const { formData, errors, isLoading, handleChange, handleSubmit } =
    useRegister();

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join us to explore the world with ease."
      image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
      badgeText="Premium Destinations"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="fullName"
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
        />
        <input
          name="email"
          onChange={handleChange}
          placeholder="Email Address"
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
          />
          <input
            name="confirmPassword"
            type="password"
            onChange={handleChange}
            placeholder="Confirm"
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-[10px]">{errors.confirmPassword}</p>
        )}

        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            name="agreeTerms"
            type="checkbox"
            onChange={handleChange}
            className="rounded text-blue-500"
          />
          I agree to the{" "}
          <span className="text-blue-500 font-bold">Terms and Conditions</span>
        </label>

        <Link to ="/login"
          disabled={isLoading}
          className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all flex justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Sign Up"
          )}
        </Link>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
