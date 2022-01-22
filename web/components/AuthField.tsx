import React from "react";
import classNames from "utils/classNames";

export default function AuthField({
  className,
  label,
  placeholder,
  name,
  required = false,
  type,
  handleChange,
  value,
  autoComplete,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder: string;
  className?: string;
  type: "text" | "email" | "password";
  handleChange: any;
  value: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={handleChange}
        autoComplete={autoComplete}
        className={classNames(
          className,
          "appearance-none bg-gray-800 rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-300 text-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
        )}
        placeholder={placeholder}
      />
    </div>
  );
}
