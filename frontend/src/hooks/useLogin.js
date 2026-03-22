import { useState } from "react";

export const useLogin = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Thêm logic validate và gọi API ở đây
    console.log("Login Data:", formData);
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    errors,
    handleChange,
    handleSubmit,
  };
};
