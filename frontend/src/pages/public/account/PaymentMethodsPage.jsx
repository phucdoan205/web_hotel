import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Landmark,
  CreditCard as CardIcon
} from "lucide-react";
import paymentMethodsApi from "../../../api/user/paymentMethodsApi";
import { toast } from "react-hot-toast";

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    methodType: "Card",
    provider: "Visa",
    cardNumber: "",
    last4Digits: "",
    expiryDate: "",
    cardHolderName: "",
    isDefault: false
  });

  const getProviderLogo = (provider, type) => {
    const logos = {
      Visa: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/visa.svg",
      MasterCard: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/mastercard.svg",
      JCB: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/jcb.svg",
      "American Express": "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/amex.svg"
    };

    if (type === "Card" && logos[provider]) {
      return (
        <div className={`relative w-14 h-9 rounded-lg flex items-center justify-center overflow-hidden shadow-sm border transition-all ${
          provider === "Visa" ? "bg-[#1a1f71]" :
          provider === "MasterCard" ? "bg-[#212121]" :
          provider === "American Express" ? "bg-[#016fd0]" :
          "bg-slate-800"
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <img 
            src={logos[provider]} 
            alt={provider} 
            className="h-6 w-10 object-contain brightness-110 contrast-125"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://cdn-icons-png.flaticon.com/512/179/179457.png";
            }}
          />
        </div>
      );
    }
    
    if (type === "Bank") {
      return (
        <div className="w-14 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm border border-emerald-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <Building2 className="size-5 text-white" />
        </div>
      );
    }

    return (
      <div className="w-14 h-9 rounded-lg bg-slate-200 flex items-center justify-center border border-slate-300">
        <CardIcon className="size-5 text-slate-500" />
      </div>
    );
  };

  const getProviderColor = (provider, type) => {
    if (type === "Bank") return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
    
    const colors = {
      Visa: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      MasterCard: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      JCB: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      "American Express": "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
    };
    return colors[provider] || "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  };

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

  const resetForm = () => {
    setFormData({
      methodType: "Card",
      provider: "Visa",
      cardNumber: "",
      last4Digits: "",
      expiryDate: "",
      cardHolderName: "",
      isDefault: false
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.methodType === "Card" && formData.cardNumber.length < 12) {
      toast.error("Vui lòng nhập đầy đủ số thẻ.");
      return;
    }
    
    const submissionData = {
      ...formData,
      last4Digits: formData.methodType === "Card" 
        ? formData.cardNumber.slice(-4) 
        : formData.last4Digits
    };

    console.log("Submitting payment method:", submissionData);

    setIsSaving(true);
    try {
      await paymentMethodsApi.createMethod(submissionData);
      toast.success("Đã thêm phương thức thanh toán.");
      setIsAdding(false);
      resetForm();
      loadMethods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm phương thức thanh toán.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deletingId !== id) {
      setDeletingId(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeletingId(null), 3000);
      return;
    }

    try {
      await paymentMethodsApi.deleteMethod(id);
      toast.success("Đã xóa phương thức thanh toán.");
      setDeletingId(null);
      loadMethods();
    } catch (err) {
      toast.error("Không thể xóa phương thức thanh toán.");
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (method) => {
    try {
      await paymentMethodsApi.updateMethod(method.id, { ...method, isDefault: true });
      toast.success("Đã thay đổi phương thức mặc định.");
      loadMethods();
    } catch (err) {
      toast.error("Không thể thay đổi phương thức mặc định.");
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
                  <div className="flex items-center justify-center transition-all">
                    {getProviderLogo(method.provider, method.methodType)}
                  </div>
                  <div>
                    <p className={`font-black uppercase tracking-tight text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {method.methodType === "Bank" ? method.provider : `${method.provider} •••• ${method.last4Digits}`}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {method.methodType === "Bank" ? `STK: ${method.last4Digits}` : `Hết hạn: ${method.expiryDate || "--/--"}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDelete(method.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${
                      deletingId === method.id 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {deletingId === method.id ? (
                      <>Xác nhận xóa</>
                    ) : (
                      <>
                        <Trash2 className="size-3.5" />
                        Xóa
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/10">
                <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{method.cardHolderName || "CHỦ THẺ"}</p>
                {method.isDefault ? (
                  <div className="flex items-center gap-1.5 text-xs font-black text-green-500 uppercase bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="size-3.5" />
                    Mặc định
                  </div>
                ) : (
                  <button
                    onClick={() => handleSetDefault(method)}
                    className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add New Button */}
          {!isAdding && (
            <button 
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
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
              <p className={`font-bold text-sm ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-900'}`}>Thêm mới</p>
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
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formData.methodType === "Card" ? "Thông tin thẻ mới" : "Thông tin tài khoản ngân hàng"}
              </h3>
            </div>

            <div className="flex p-1.5 rounded-2xl bg-[#1F649C] w-full max-w-md mb-10 shadow-lg shadow-blue-900/20">
              <button
                type="button"
                onClick={() => setFormData({...formData, methodType: "Card", provider: "Visa"})}
                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                  formData.methodType === "Card" 
                    ? 'bg-white text-[#1F649C] shadow-sm scale-[1.02]' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <CardIcon size={18} className={formData.methodType === "Card" ? "text-[#1F649C]" : "text-white/70"} />
                <span>Thẻ tín dụng/Ghi nợ</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, methodType: "Bank", provider: "MB Bank"})}
                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                  formData.methodType === "Bank" 
                    ? 'bg-white text-[#1F649C] shadow-sm scale-[1.02]' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 size={18} className={formData.methodType === "Bank" ? "text-[#1F649C]" : "text-white/70"} />
                <span>Tài khoản ngân hàng</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.methodType === "Card" ? (
                <>
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
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Số thẻ</label>
                    <input 
                      type="text" 
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\s/g, '')})}
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
                </>
              ) : (
                <>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ngân hàng</label>
                    <select 
                      value={formData.provider}
                      onChange={(e) => setFormData({...formData, provider: e.target.value})}
                      className={`w-full p-3 rounded-xl border font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="MB Bank">MB Bank</option>
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="Agribank">Agribank</option>
                      <option value="BIDV">BIDV</option>
                      <option value="Vietinbank">Vietinbank</option>
                      <option value="ACB">ACB</option>
                      <option value="Sacombank">Sacombank</option>
                      <option value="TPBank">TPBank</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Số tài khoản</label>
                    <input 
                      type="text" 
                      placeholder="Số tài khoản ngân hàng"
                      value={formData.last4Digits}
                      onChange={(e) => setFormData({...formData, last4Digits: e.target.value})}
                      className={`w-full p-3 rounded-xl border font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tên chủ tài khoản</label>
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
                </>
              )}
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
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                }}
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
