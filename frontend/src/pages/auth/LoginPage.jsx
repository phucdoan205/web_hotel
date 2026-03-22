import React from "react";
import AuthHero from "../../components/auth/AuthHero";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      <AuthHero />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
