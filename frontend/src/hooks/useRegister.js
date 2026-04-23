import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkRegisterEmailExists,
  registerWithEmail,
} from "../api/auth/authApi";
import { saveAuth } from "../utils/authStorage";

export const useRegister = () => {
  const navigate = useNavigate();
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
  const [generalMessage, setGeneralMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[name];

      if (name === "email") {
        delete nextErrors.email;
      }

      if (name === "password" || name === "confirmPassword") {
        delete nextErrors.confirmPassword;
      }

      return nextErrors;
    });

    setGeneralMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (errors.email === "Email đã tồn tại.") {
      newErrors.email = "Email đã tồn tại.";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms =
        "Bạn phải đồng ý với Điều khoản và Điều kiện để đăng ký.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGeneralMessage("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const emailCheck = await checkRegisterEmailExists(formData.email.trim());

      if (emailCheck?.exists) {
        setErrors((prev) => ({ ...prev, email: "Email đã tồn tại." }));
        return;
      }

      const response = await registerWithEmail({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        agreeTerms: formData.agreeTerms,
      });

      saveAuth(response);
      navigate("/user/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Email đã tồn tại.";

      if (message === "Email đã tồn tại.") {
        setErrors((prev) => ({ ...prev, email: "Email đã tồn tại." }));
      } else {
        setGeneralMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      setErrors((prev) => {
        if (!prev.email) {
          return prev;
        }

        const nextErrors = { ...prev };
        delete nextErrors.email;
        return nextErrors;
      });
      return undefined;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await checkRegisterEmailExists(trimmedEmail);

        setErrors((prev) => {
          const nextErrors = { ...prev };

          if (result?.exists) {
            nextErrors.email = "Email đã tồn tại.";
          } else if (nextErrors.email === "Email đã tồn tại.") {
            delete nextErrors.email;
          }

          return nextErrors;
        });
      } catch {
        // Khong chan dang ky neu buoc kiem tra email tam thoi loi.
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [formData.email]);

  return {
    formData,
    errors,
    generalMessage,
    isLoading,
    handleChange,
    handleSubmit,
  };
};
