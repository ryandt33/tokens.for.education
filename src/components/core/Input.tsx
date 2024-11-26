import React, { useState, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(event.target.value !== "");
    props.onBlur?.(event);
  };

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setHasValue(event.target.value !== "");
  //   props.onChange?.(event);
  // };

  const inputClasses = `
    block w-full px-3 py-2 border rounded-md text-sm
    transition-all duration-300 ease-in-out
    ${
      isFocused
        ? "border-fe-blue-500 ring-1 ring-fe-blue-500"
        : "border-gray-300"
    }
    ${error ? "border-red-500" : ""}
    ${className}
  `.trim();

  const labelClasses = `
    absolute left-3 transition-all duration-300 ease-in-out
    ${
      isFocused || hasValue
        ? "text-xs -top-2 bg-white px-1 text-fe-blue-500"
        : "text-sm top-2 text-gray-700"
    }
    ${error ? "text-red-500" : ""}
  `.trim();

  return (
    <div className="relative">
      <label htmlFor={props.id} className={labelClasses}>
        {label}
      </label>
      <input
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // onChange={handleChange}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
