import { useState } from "react";

export const useRegister = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    let newErrors = {};
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    // Giả lập API
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    console.log("Register Data:", formData);
  };

  return { formData, errors, isLoading, handleChange, handleSubmit };
};
