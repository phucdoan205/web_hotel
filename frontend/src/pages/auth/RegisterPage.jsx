import React from "react";
import RegisterForm from "../../components/auth/RegisterForm";
import RegisterHero from "../../components/auth/RegisterHero";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex">
      <RegisterForm />
      <RegisterHero />
    </div>
  );
};

export default RegisterPage;
