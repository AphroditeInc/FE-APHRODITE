"use client";

import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/button";
import Image from "next/image";
import { useState } from "react";
import apple from "../../../public/icons/apple.svg";
import facebook from "../../../public/icons/facebook.svg";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic
    console.log("Signup attempt:", formData);
  };

  return (
    <AuthCard
      title="Welcome to Aphrodite"
      description="By tapping ‘Create Account’ or ‘Sign in’, you agree to our Terms & Conditions."
      // backgroundImage="/images/slidersimage/firstimg.svg"
      // showSlider={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Button
          type="submit"
          className="w-full bg-transparent border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/auth/apple")}
        >
          <Image src={apple} alt="Apple" width={24} height={24} />
          <span className="text-white/60"> Sign up with Apple</span>
        </Button>

        <Button
          type="submit"
          className="w-full bg-transparent border border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/auth/facebook")}
        >
          <Image src={facebook} alt="Facebook" width={24} height={24} />
          <span className="text-white/60"> Sign up with Facebook</span>
        </Button>

        <div className="flex items-center gap-3">
          <hr className="flex-grow border-t border-white/10" />
          <span className="text-white/60">or</span>
          <hr className="flex-grow border-t border-white/10" />
        </div>

        {/* number input with country code */}

        <Button type="submit" className="w-full">
          Create Account
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
