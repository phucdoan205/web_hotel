import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CreditCard,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import paymentMethodsApi from "../../../api/user/paymentMethodsApi";
import { toast } from "react-hot-toast";

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    provider: "Visa",
    last4Digits: "",
    expiryDate: "",
    cardHolderName: "",
    isDefault: false
  });

  const isDark = document.documentElement.classList.contains('dark-theme');

  const loadMethods = async () => {
    try {
      const data = await paymentMethodsApi.getMyMethods();
      setMethods(data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải phương thức thanh toán.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.last4Digits.length !== 4) {
      toast.error("Vui lòng nhập 4 số cuối của thẻ.");
      return;
    }
    setIsSaving(true);
    try {
      await paymentMethodsApi.createMethod(formData);
      toast.success("Đã thêm phương thức thanh toán.");
      setIsAdding(false);
      setFormData({
        provider: "Visa",
        last4Digits: "",
        expiryDate: "",
        cardHolderName: "",
        isDefault: false
      });
      loadMethods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm phương thức thanh toán.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phương thức thanh toán này?")) return;
    try {
      await paymentMethodsApi.deleteMethod(id);
      toast.success("Đã xóa phương thức thanh toán.");
      loadMethods();
    } catch (err) {
      toast.error("Không thể xóa phương thức thanh toán.");
    }
  };

  if (isLoading) return <div className={`p-20 text-center font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Đang tải...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Phương thức thanh toán</h1>
      <p className="text-slate-500 mb-12">Quản lý các thẻ tín dụng, thẻ ghi nợ và các phương thức thanh toán đã lưu của bạn.</p>

      <div className="space-y-6">
        {/* Methods List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <div 
              key={method.id}
              className={`relative group border p-6 rounded-2xl transition-all hover:shadow-lg ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/50 hover:border-blue-500/50' 
                  : 'border-slate-100 bg-white hover:border-blue-100'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <CreditCard className="size-6" />
                  </div>
                  <div>
                    <p className={`font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {method.provider} •••• {method.last4Digits}
                    </p>
                    <p className="text-xs font-bold text-slate-500">Hết hạn: {method.expiryDate || "--/--"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(method.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/10">
                <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{method.cardHolderName || "CHỦ THẺ"}</p>
                {method.isDefault && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-green-500 uppercase">
                    <CheckCircle2 className="size-3.5" />
                    Mặc định
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add New Button */}
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className={`flex flex-col items-center justify-center border-2 border-dashed p-8 rounded-2xl transition-all group ${
                isDark 
                  ? 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50' 
                  : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <div className={`size-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                isDark ? 'bg-slate-800 text-slate-400 group-hover:text-blue-400' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600'
              }`}>
                <Plus className="size-6" />
              </div>
              <p className={`font-bold text-sm ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-900'}`}>Thêm thẻ mới</p>
            </button>
          )}
        </div>

        {/* Add Form */}
        {isAdding && (
          <form 
            onSubmit={handleCreate} 
            className={`p-8 rounded-3xl border animate-in slide-in-from-top-4 duration-500 ${
              isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="size-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Plus className="size-5" />
              </div>
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Thông tin thẻ mới</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loại thẻ</label>
                <select 
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className={`w-full p-3 rounded-xl border font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Visa">Visa</option>
                  <option value="MasterCard">MasterCard</option>
                  <option value="JCB">JCB</option>
                  <option value="American Express">Amex</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>4 số cuối</label>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="1234"
                  value={formData.last4Digits}
                  onChange={(e) => setFormData({...formData, last4Digits: e.target.value})}
                  className={`w-full p-3 rounded-xl border font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`} 
                />
              </div>
              <div>
                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ngày hết hạn (MM/YY)</label>
                <input 
                  type="text" 
                  placeholder="12/28"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className={`w-full p-3 rounded-xl border font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`} 
                />
              </div>
              <div>
                <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tên trên thẻ</label>
                <input 
                  type="text" 
                  placeholder="NGUYEN VAN A"
                  value={formData.cardHolderName}
                  onChange={(e) => setFormData({...formData, cardHolderName: e.target.value.toUpperCase()})}
                  className={`w-full p-3 rounded-xl border font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`} 
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <input 
                type="checkbox" 
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="size-4 rounded accent-blue-600"
              />
              <label htmlFor="isDefault" className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Đặt làm mặc định</label>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Xác nhận thêm"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <button 
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang tài khoản
        </button>


      </div>
    </div>
  );
};

export default PaymentMethodsPage;
