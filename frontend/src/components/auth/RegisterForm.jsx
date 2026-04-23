import React from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";

const RegisterForm = () => {
  const {
    formData,
    errors,
    generalMessage,
    isLoading,
    handleChange,
    handleSubmit,
  } = useRegister();

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 text-blue-600 text-xl font-bold mb-10">
          <span className="text-2xl">✈</span> TravelEase
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-2">Tạo tài khoản</h2>
        <p className="text-slate-500 mb-8">
          Đăng ký để trải nghiệm dịch vụ khách sạn nhanh chóng và thuận tiện hơn.
        </p>

        {generalMessage ? (
          <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {generalMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Họ và tên
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              type="text"
              placeholder="Nhập họ và tên"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.fullName ? (
              <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.email ? (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Số điện thoại
            </label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              type="text"
              placeholder="Nhập số điện thoại"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.phoneNumber ? (
              <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {errors.confirmPassword ? (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              ) : null}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                Tôi đồng ý với{" "}
                <span className="text-blue-600">Điều khoản và Điều kiện</span>
              </label>
            </div>

            {errors.agreeTerms ? (
              <p className="text-sm text-red-600">{errors.agreeTerms}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-blue-100 transition-all uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Đăng nhập tại đây
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
