import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../../hooks/useLogin";

const LoginForm = () => {
  const {
    formData,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  } = useLogin();

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Login – TravelEase
        </h2>
        <p className="text-slate-500 mb-8">
          Welcome back! Please login to your account to continue your journey.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
              Email or Phone
            </label>
            <input
              name="identifier"
              onChange={handleChange}
              type="text"
              className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-400"
              placeholder="Enter your email"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
              Password
            </label>
            <input
              name="password"
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-slate-300"
            />
            <label htmlFor="remember" className="text-sm text-slate-600">
              Remember me
            </label>
          </div>
          <button className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
            Login
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-2 text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            <span className="text-sm font-medium">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all">
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              className="w-5 h-5"
              alt="Facebook"
            />
            <span className="text-sm font-medium">Facebook</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
