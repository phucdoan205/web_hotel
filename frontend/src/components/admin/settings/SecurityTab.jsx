import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Smartphone,
  Monitor,
  X,
} from "lucide-react";
import { changeMyPassword } from "../../../api/admin/profileApi";

const SecurityTab = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loginSessions = [
    {
      id: 1,
      device: 'MacBook Pro 14"',
      browser: "Chrome - San Francisco, US",
      status: "Active now",
      icon: <Monitor className="size-5" />,
    },
    {
      id: 2,
      device: "iPhone 15 Pro",
      browser: "Safari - Jakarta, ID",
      status: "2 hours ago",
      icon: <Smartphone className="size-5" />,
    },
    {
      id: 3,
      device: "Windows PC",
      browser: "Firefox - London, UK",
      status: "Oct 12, 2023",
      icon: <Monitor className="size-5" />,
    },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Mat khau moi phai co it nhat 6 ky tu." });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Xac nhan mat khau moi khong khop." });
      return;
    }

    setIsSubmitting(true);

    try {
      await changeMyPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage({ type: "success", text: "Doi mat khau thanh cong." });
    } catch (error) {
      const responseMessage = error.response?.data;
      setMessage({
        type: "error",
        text:
          typeof responseMessage === "string" && responseMessage.trim()
            ? responseMessage
            : "Khong the doi mat khau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 animate-in fade-in duration-500">
      <div className="space-y-6 xl:col-span-8">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Lock className="size-4" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight text-gray-900">
              Change Password
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message.text ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  message.type === "error"
                    ? "border border-red-100 bg-red-50 text-red-600"
                    : "border border-emerald-100 bg-emerald-50 text-emerald-700"
                }`}
              >
                {message.text}
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Nhap mat khau hien tai"
                className="w-full rounded-2xl border border-transparent bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-blue-100 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nhap mat khau moi"
                  className="w-full rounded-2xl border border-transparent bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-blue-100 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhap lai mat khau moi"
                  className="w-full rounded-2xl border border-transparent bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-blue-100 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-blue-500 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Dang cap nhat..." : "Cap nhat mat khau"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-fit rounded-2xl bg-blue-50 p-3 text-blue-600">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-black text-gray-900">
                  Two-Factor Authentication (2FA)
                </h3>
                <p className="max-w-md text-xs font-bold leading-relaxed text-gray-400">
                  Giu nguyen khu vuc nang cao bao mat de sau nay co the mo rong them 2FA neu can.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-emerald-600">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Status: Planned
                  </span>
                </div>
              </div>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" disabled />
              <div className="h-6 w-12 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
        </section>
      </div>

      <div className="space-y-6 xl:col-span-4">
        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Login Sessions
            </h4>
            <button className="text-[10px] font-black uppercase tracking-wider text-blue-500 hover:underline">
              Log out all
            </button>
          </div>

          <div className="space-y-4">
            {loginSessions.map((session) => (
              <div
                key={session.id}
                className="group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gray-50 p-2.5 text-gray-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-500">
                    {session.icon}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-gray-900">
                      {session.device}
                    </h5>
                    <p className="text-[10px] font-bold text-gray-400">
                      {session.browser}
                    </p>
                    {session.status === "Active now" ? (
                      <span className="text-[9px] font-black uppercase tracking-tighter text-blue-500">
                        Active Now
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-tighter text-gray-300">
                        {session.status}
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-1 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full rounded-2xl border border-gray-100 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all hover:bg-gray-50">
            View Login History
          </button>
        </section>

        <div className="group relative overflow-hidden rounded-[2rem] bg-blue-500 p-8 text-white shadow-xl shadow-blue-100">
          <div className="relative z-10">
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              Security Score
            </h4>
            <div className="mb-6 flex items-end gap-2">
              <span className="text-5xl font-black">85</span>
              <span className="mb-1 text-xl font-black text-white/50">/ 100</span>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[85%] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
            </div>

            <p className="mb-6 text-xs font-bold leading-relaxed text-white/80">
              Thong tin ho so va avatar da tach rieng, vi vay khu vuc nay tap trung vao mat khau.
            </p>

            <button className="w-full rounded-2xl bg-white py-3 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-50">
              Improve Security
            </button>
          </div>

          <ShieldCheck className="absolute -bottom-4 -right-4 size-32 -rotate-12 text-white/10 transition-transform duration-700 group-hover:rotate-0" />
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
