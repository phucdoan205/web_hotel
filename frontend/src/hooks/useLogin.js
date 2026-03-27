import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../api/auth/authApi";
import { saveAuth } from "../utils/authStorage";

const resolveRedirectPath = (role) => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === "receptionist") {
    return "/receptionist/dashboard";
  }

  if (normalizedRole === "admin" || normalizedRole === "housekeeping") {
    return "/admin/dashboard";
  }

  return "/";
};

export const useLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const finishLogin = (authData) => {
    saveAuth(authData);
    navigate(resolveRedirectPath(authData.role));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await loginWithEmail({
        email: formData.email.trim(),
        password: formData.password,
      });

      finishLogin(response);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Cannot login with email and password.";

      setErrorMessage(typeof message === "string" ? message : "Cannot login with email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setErrorMessage("");
    setIsGoogleLoading(true);

    try {
      const response = await loginWithGoogle({
        googleCredential: credential,
      });

      finishLogin(response);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Cannot login with Google account.";

      setErrorMessage(typeof message === "string" ? message : "Cannot login with Google account.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    errorMessage,
    isLoading,
    isGoogleLoading,
    handleChange,
    handleSubmit,
    handleGoogleCredential,
  };
};
