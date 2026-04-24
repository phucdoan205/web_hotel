import React, { useState } from "react";
import { Lock, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";
import { changeMyPassword } from "../../../api/admin/profileApi";

const SecuritySection = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      setMessage({ type: "error", text: "Xac nhan mat khau khong khop." });
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
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm xl:col-span-2">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0085FF]">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-gray-900">
              Bao mat tai khoan
            </h3>
            <p className="mt-1 text-xs font-medium text-gray-400">
              Doi mat khau cho tai khoan nguoi dung cua ban.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message.text ? (
            <div
              className={`rounded-2xl px-5 py-4 text-sm font-semibold ${
                message.type === "error"
                  ? "border border-red-100 bg-red-50 text-red-600"
                  : "border border-emerald-100 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div>
            <label className="ml-1 mb-2 block text-[10px] font-black uppercase text-gray-400">
              Mat khau hien tai
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Nhap mat khau hien tai"
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="ml-1 mb-2 block text-[10px] font-black uppercase text-gray-400">
                Mat khau moi
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Toi thieu 6 ky tu"
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="ml-1 mb-2 block text-[10px] font-black uppercase text-gray-400">
                Xac nhan mat khau
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhap lai mat khau"
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#0085FF] px-8 py-3 text-[11px] font-black uppercase text-white shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Dang cap nhat..." : "Doi mat khau"}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-[#0085FF] to-cyan-400 p-8 text-white shadow-xl shadow-blue-100">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white/20">
            <ShieldCheck size={28} />
          </div>
          <h4 className="mb-2 text-lg font-black">Bao ve tai khoan</h4>
          <p className="mb-6 text-xs font-medium leading-relaxed text-white/80">
            Email duoc khoa khong cho chinh sua. Neu can thay doi email, admin can ho tro bang quy trinh rieng.
          </p>
          <div className="rounded-2xl bg-white/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em]">
            Ho so va avatar duoc quan ly tai tab Ho so
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-[10px] font-black uppercase text-gray-400">
            Goi y bao mat
          </h4>
          <div className="space-y-4">
            {[
              { title: "Doi mat khau dinh ky", icon: <RefreshCw size={16} /> },
              { title: "Khong chia se ma xac thuc", icon: <Smartphone size={16} /> },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-gray-700">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
