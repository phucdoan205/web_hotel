import React, { useEffect, useRef } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useLogin } from "../../hooks/useLogin";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const LoginForm = () => {
  const googleButtonRef = useRef(null);
  const {
    formData,
    showPassword,
    setShowPassword,
    errorMessage,
    isLoading,
    isGoogleLoading,
    handleChange,
    handleSubmit,
    handleGoogleCredential,
  } = useLogin();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) {
      return undefined;
    }

    const initializeGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            handleGoogleCredential(response.credential);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 380,
        text: "signin_with",
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return undefined;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogleButton);
      return () => existingScript.removeEventListener("load", initializeGoogleButton);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initializeGoogleButton);
    document.body.appendChild(script);

    return () => script.removeEventListener("load", initializeGoogleButton);
  }, [handleGoogleCredential]);

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Đăng nhập - TravelEase
        </h2>
        <p className="text-slate-500 mb-8">
          Đăng nhập bằng email và mật khẩu, hoặc tiếp tục bằng tài khoản Google.
        </p>

        {errorMessage ? (
          <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-400"
                placeholder="Nhập email của bạn"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
              Mật khẩu
            </label>
            <input
              name="password"
              value={formData.password}
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
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label htmlFor="remember" className="text-sm text-slate-600">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập bằng Email"}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-2 text-slate-500">
              Hoặc tiếp tục với Google
            </span>
          </div>
        </div>

        <div className="mt-6">
          {GOOGLE_CLIENT_ID ? (
            <div className="flex flex-col items-center gap-3">
              <div ref={googleButtonRef} className="min-h-11" />
              {isGoogleLoading ? (
                <p className="text-sm font-medium text-slate-500">
                  Đang đăng nhập bằng Google...
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              Đăng nhập Google chưa được cấu hình. Vui lòng đặt `VITE_GOOGLE_CLIENT_ID` trong biến môi trường frontend trước.
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Bạn chưa có tài khoản? {" "}
          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
