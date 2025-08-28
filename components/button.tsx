import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset" | null;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  //   type = "button",
  className = "",
}) => {
  const baseClasses =
    "font-medium rounded-[40px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2";

  const variantClasses = {
    primary: disabled
      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
      : "bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-xl",
    secondary: disabled
      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
      : "bg-gray-600 hover:bg-gray-700 text-white",
    outline: disabled
      ? "border border-gray-600 text-gray-400 cursor-not-allowed"
      : "border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <button onClick={onClick} disabled={disabled} className={combinedClasses}>
      {children}
    </button>
  );
};

export default Button;
