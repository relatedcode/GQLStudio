import React, { forwardRef } from "react";

function TextField(
  {
    className,
    label,
    placeholder,
    name,
    required = false,
    type = "text",
    handleChange,
    value,
    autoComplete,
    disabled = false,
    infos = "",
    optional = false,
  }: {
    label?: string;
    name: string;
    required?: boolean;
    placeholder?: string;
    className?: string;
    type?: "text" | "email" | "password";
    handleChange?: any;
    value: string;
    autoComplete?: string;
    disabled?: boolean;
    infos?: string;
    optional?: boolean;
  },
  ref
) {
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-200 mb-1"
          >
            {label}
          </label>
          {optional && <span className="text-sm text-gray-300">Optional</span>}
        </div>
      )}
      <input
        type={type}
        name={name}
        id={name}
        ref={ref}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="focus:ring-green-500 bg-transparent text-white placeholder-gray-300 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-500 rounded-md"
      />
      {infos && <p className="mt-2 text-sm text-gray-500">{infos}</p>}
    </div>
  );
}

export default forwardRef(TextField);
