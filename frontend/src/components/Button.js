import React from "react";

const Button = ({ children, onClick, type = "button", className = "", variant = "dark" }) => {
  const baseStyles = "text-white px-6 py-2 rounded-2xl shadow-md transition duration-300";
  const darkStyles = "bg-purple-800 hover:bg-purple-900";
  const lightStyles = "bg-purple-300 text-purple-900 hover:bg-purple-400";

  const buttonStyles = variant === "light" ? lightStyles : darkStyles;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${buttonStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
