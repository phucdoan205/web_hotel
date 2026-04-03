import React from "react";
import {
  Lock,
  ShieldCheck,
  Smartphone,
  Monitor,
  ChevronRight,
  X,
} from "lucide-react";

const SecurityTab = () => {
  const loginSessions = [
    {
      id: 1,
      device: 'MacBook Pro 14"',
      browser: "Chrome • San Francisco, US",
      status: "Active now",
      icon: <Monitor className="size-5" />,
    },
    {
      id: 2,
      device: "iPhone 15 Pro",
      browser: "Safari • Jakarta, ID",
      status: "2 hours ago",
      icon: <Smartphone className="size-5" />,
    },
    {
      id: 3,
      device: "Windows PC",
      browser: "Firefox • London, UK",
      status: "Oct 12, 2023",
      icon: <Monitor className="size-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Cột trái: Password & 2FA (8/12) */}
      <div className="xl:col-span-8 space-y-6">
        {/* Change Password Section */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Lock className="size-4" />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
              Change Password
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100">
                Update Password
              </button>
            </div>
          </div>
        </section>

        {/* Two-Factor Authentication */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl h-fit">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 mb-1">
                  Two-Factor Authentication (2FA)
                </h3>
                <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-md">
                  Add an extra layer of security to your account by requiring a
                  code from your mobile device.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Status: Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </section>
      </div>

      {/* Cột phải: Sessions & Score (4/12) */}
      <div className="xl:col-span-4 space-y-6">
        {/* Login Sessions */}
        <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Login Sessions
            </h4>
            <button className="text-[10px] font-black text-blue-500 uppercase tracking-wider hover:underline">
              Log out all
            </button>
          </div>

          <div className="space-y-4">
            {loginSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
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
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">
                        Active Now
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                        {session.status}
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">
            View Login History
          </button>
        </section>

        {/* Security Score Widget */}
        <div className="bg-blue-500 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em] mb-4">
              Security Score
            </h4>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black">85</span>
              <span className="text-xl font-black text-white/50 mb-1">
                / 100
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-white rounded-full w-[85%] shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
            </div>

            <p className="text-xs font-bold text-white/80 leading-relaxed mb-6">
              Your account is well protected, but you can still improve by
              linking a recovery email.
            </p>

            <button className="w-full py-3 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
              Improve Security
            </button>
          </div>

          {/* Decorative background icon */}
          <ShieldCheck className="absolute -right-4 -bottom-4 size-32 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
