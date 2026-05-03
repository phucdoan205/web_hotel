import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Globe,
  Moon,
  Sun,
  ArrowLeft,
} from "lucide-react";

const GeneralSettingsPage = () => {
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState(null);

  const [settings, setSettings] = useState({
    language: localStorage.getItem("app-lang") || "vi",
    theme: localStorage.getItem("app-theme") || "light",
  });

  const isDark = document.documentElement.classList.contains('dark-theme');

  const handleSaveSettings = (field) => {
    if (field === 'language') {
      localStorage.setItem("app-lang", settings.language);
      toast.success("Đã thay đổi ngôn ngữ thành công.");
    } else {
      localStorage.setItem("app-theme", settings.theme);
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
      toast.success("Đã thay đổi giao diện thành công.");
    }
    setEditingField(null);
  };

  return (
    <div>
      <h1 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Cài đặt chung</h1>
      <p className="text-slate-500 mb-12">Cá nhân hóa tài khoản để phù hợp với nhu cầu của bạn.</p>

      <div className={`space-y-0 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        {/* Language Row */}
        <div className={`py-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-1/3">
              <p className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Ngôn ngữ</p>
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="size-4" />
                <span className="text-xs">Chọn ngôn ngữ hiển thị</span>
              </div>
            </div>
            <div className="flex-1">
              {editingField === 'language' ? (
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-all ${settings.language === 'vi'
                    ? 'border-[#006ce4] bg-sky-50/20'
                    : (isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50')
                    }`}>
                    <input type="radio" name="lang" value="vi" checked={settings.language === 'vi'} onChange={() => setSettings({ ...settings, language: 'vi' })} className="hidden" />
                    <span className={`text-sm font-bold ${settings.language === 'vi' ? 'text-[#006ce4]' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>Tiếng Việt</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-all ${settings.language === 'en'
                    ? 'border-[#006ce4] bg-sky-50/20'
                    : (isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50')
                    }`}>
                    <input type="radio" name="lang" value="en" checked={settings.language === 'en'} onChange={() => setSettings({ ...settings, language: 'en' })} className="hidden" />
                    <span className={`text-sm font-bold ${settings.language === 'en' ? 'text-[#006ce4]' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>English</span>
                  </label>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {settings.language === 'vi' ? 'Tiếng Việt' : 'English'}
                </p>
              )}
            </div>
            {editingField !== 'language' ? (
              <button onClick={() => setEditingField('language')} className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
            ) : (
              <button onClick={() => setEditingField(null)} className="text-sm font-bold text-[#006ce4] hover:underline">Hủy</button>
            )}
          </div>
          {editingField === 'language' && (
            <div className="flex justify-end mt-4">
              <button onClick={() => handleSaveSettings('language')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-[#005bb8] transition-colors">Lưu</button>
            </div>
          )}
        </div>

        {/* Appearance Row */}
        <div className={`py-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-1/3">
              <p className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Giao diện</p>
              <div className="flex items-center gap-2 text-slate-400">
                {settings.theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
                <span className="text-xs">Chế độ sáng / tối</span>
              </div>
            </div>
            <div className="flex-1">
              {editingField === 'theme' ? (
                <div className="flex gap-4">
                  <label className={`flex items-center gap-4 p-3 border rounded-md cursor-pointer transition-all flex-1 ${settings.theme === 'light'
                    ? 'border-[#006ce4] bg-sky-50'
                    : (isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50')
                    }`}>
                    <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={() => setSettings({ ...settings, theme: 'light' })} className="hidden" />
                    <Sun className={`size-5 ${settings.theme === 'light' ? 'text-[#006ce4]' : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold ${settings.theme === 'light' ? 'text-[#006ce4]' : (isDark ? 'text-slate-400' : 'text-slate-900')}`}>Giao diện sáng</span>
                  </label>
                  <label className={`flex items-center gap-4 p-3 border rounded-md cursor-pointer transition-all flex-1 ${settings.theme === 'dark'
                    ? 'border-[#006ce4] bg-slate-700'
                    : (isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50')
                    }`}>
                    <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={() => setSettings({ ...settings, theme: 'dark' })} className="hidden" />
                    <Moon className={`size-5 ${settings.theme === 'dark' ? 'text-white' : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold ${settings.theme === 'dark' ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-900')}`}>Giao diện tối</span>
                  </label>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {settings.theme === 'light' ? 'Giao diện sáng (Mặc định)' : 'Giao diện tối (Xanh & Đen)'}
                </p>
              )}
            </div>
            {editingField !== 'theme' ? (
              <button onClick={() => setEditingField('theme')} className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
            ) : (
              <button onClick={() => setEditingField(null)} className="text-sm font-bold text-[#006ce4] hover:underline">Hủy</button>
            )}
          </div>
          {editingField === 'theme' && (
            <div className="flex justify-end mt-4">
              <button onClick={() => handleSaveSettings('theme')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-[#005bb8] transition-colors">Lưu</button>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-12">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-sm font-bold text-[#006ce4] hover:underline group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang tài khoản
        </button>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
