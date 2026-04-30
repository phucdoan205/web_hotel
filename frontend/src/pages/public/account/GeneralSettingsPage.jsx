import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  User,
  Lock,
  CreditCard,
  History,
  Globe,
  Moon,
  Sun,
  ArrowLeft,
  Settings as SettingsIcon,
  Pencil
} from "lucide-react";

const GeneralSettingsPage = () => {
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState(null);

  const [settings, setSettings] = useState({
    language: localStorage.getItem("app-lang") || "vi",
    theme: localStorage.getItem("app-theme") || "light",
  });

  const sidebarItems = [
    { label: "Thông tin cá nhân", icon: User, active: false, path: "/profile/personal-info" },
    { label: "Cài đặt bảo mật", icon: Lock, active: false, path: "/profile/security" },
    { label: "Cài đặt chung", icon: SettingsIcon, active: true, path: "/profile/settings" },
    { label: "Phương thức thanh toán", icon: CreditCard, active: false, path: "#" },
  ];

  const handleSaveSettings = (field) => {
    if (field === 'language') {
      localStorage.setItem("app-lang", settings.language);
      window.alert("Đã thay đổi ngôn ngữ thành công.");
    } else {
      localStorage.setItem("app-theme", settings.theme);
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
      window.alert("Đã thay đổi giao diện thành công.");
    }
    setEditingField(null);
  };

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-[#0f172a] text-white' : 'bg-white'}`}>
      {/* Breadcrumb */}
      <div className={`py-6 border-b ${settings.theme === 'dark' ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-100'}`}>
        <div className="mx-auto max-w-7xl px-4 flex items-center gap-2 text-[#006ce4] text-sm font-medium">
          <Link to="/profile" className="hover:underline">Tài khoản</Link>
          <ChevronRight className="size-3 text-slate-400" />
          <span className={`font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Cài đặt chung</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className={`border rounded-lg overflow-hidden shadow-sm ${settings.theme === 'dark' ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-200'}`}>
              {sidebarItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors border-b last:border-0 ${settings.theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                    } ${item.active ? "text-[#006ce4] font-bold" : (settings.theme === 'dark' ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50")
                    }`}
                >
                  <item.icon className={`size-5 ${item.active ? "text-[#006ce4]" : "text-slate-500"}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className={`text-3xl font-black mb-2 ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Cài đặt chung</h1>
            <p className="text-slate-500 mb-12">Cá nhân hóa tài khoản để phù hợp với nhu cầu của bạn.</p>

            <div className={`space-y-0 border-t ${settings.theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
              {/* Language Row */}
              <div className={`py-8 border-b ${settings.theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-1/3">
                    <p className={`text-sm font-bold mb-1 ${settings.theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>Ngôn ngữ</p>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Globe className="size-4" />
                      <span className="text-xs">Chọn ngôn ngữ hiển thị</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    {editingField === 'language' ? (
                      <div className="flex gap-4">
                        <label className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-all ${settings.language === 'vi'
                          ? 'border-[#006ce4] bg-sky-50'
                          : (settings.theme === 'dark' ? 'border-slate-700 bg-[#0f172a]' : 'border-slate-200 hover:bg-slate-50')
                          }`}>
                          <input type="radio" name="lang" value="vi" checked={settings.language === 'vi'} onChange={() => setSettings({ ...settings, language: 'vi' })} className="hidden" />
                          <span className={`text-sm font-bold ${settings.language === 'vi' ? 'text-[#006ce4]' : ''}`}>Tiếng Việt</span>
                        </label>
                        <label className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-all ${settings.language === 'en'
                          ? 'border-[#006ce4] bg-sky-50'
                          : (settings.theme === 'dark' ? 'border-slate-700 bg-[#0f172a]' : 'border-slate-200 hover:bg-slate-50')
                          }`}>
                          <input type="radio" name="lang" value="en" checked={settings.language === 'en'} onChange={() => setSettings({ ...settings, language: 'en' })} className="hidden" />
                          <span className={`text-sm font-bold ${settings.language === 'en' ? 'text-[#006ce4]' : ''}`}>English</span>
                        </label>
                      </div>
                    ) : (
                      <p className={`text-sm ${settings.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
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
                    <button onClick={() => handleSaveSettings('language')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md">Lưu</button>
                  </div>
                )}
              </div>

              {/* Appearance Row */}
              <div className={`py-8 border-b ${settings.theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-1/3">
                    <p className={`text-sm font-bold mb-1 ${settings.theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>Giao diện</p>
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
                          : 'border-slate-200 hover:bg-slate-50'
                          }`}>
                          <input type="radio" name="theme" value="light" checked={settings.theme === 'light'} onChange={() => setSettings({ ...settings, theme: 'light' })} className="hidden" />
                          <Sun className={`size-5 ${settings.theme === 'light' ? 'text-[#006ce4]' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${settings.theme === 'light' ? 'text-[#006ce4]' : 'text-slate-900'}`}>Giao diện sáng</span>
                        </label>
                        <label className={`flex items-center gap-4 p-3 border rounded-md cursor-pointer transition-all flex-1 ${settings.theme === 'dark'
                          ? 'border-[#006ce4] bg-slate-800'
                          : (settings.theme === 'dark' ? 'border-slate-700 bg-[#0f172a]' : 'border-slate-200 hover:bg-slate-50')
                          }`}>
                          <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={() => setSettings({ ...settings, theme: 'dark' })} className="hidden" />
                          <Moon className={`size-5 ${settings.theme === 'dark' ? 'text-white' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Giao diện tối</span>
                        </label>
                      </div>
                    ) : (
                      <p className={`text-sm ${settings.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
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
                    <button onClick={() => handleSaveSettings('theme')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md">Lưu</button>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-12">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-sm font-bold text-[#006ce4] hover:underline"
              >
                <ArrowLeft className="size-4" />
                Quay lại trang tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
