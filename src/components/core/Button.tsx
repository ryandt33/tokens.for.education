import React, { ButtonHTMLAttributes } from "react";
import { ButtonVariant } from "../../resources/types";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  icon,
  fullWidth = true,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "flex items-center justify-center rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50";

  const variantClasses = {
    primary:
      "bg-fe-blue-500 text-white hover:bg-fe-blue-600 focus:ring-fe-blue-500 font-bold ",
    social:
      "bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-300 focus:ring-fe-blue-500",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass =
    disabled || isLoading ? "opacity-50 cursor-not-allowed" : "";

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${widthClass}
    ${disabledClass}
    ${variant === "primary" ? "p-3" : "p-2 h-12"}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
