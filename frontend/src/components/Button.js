import React from "react";
import "../styles/Button.css";

const Button = ({ 
  children, 
  variant = "dark", 
  size = "medium", 
  onClick, 
  type = "button",
  disabled = false,
  fullWidth = false,
  className = ""
}) => {
  // Only allow "light" or "dark" variants
  const validVariant = ["light", "dark"].includes(variant) ? variant : "dark";
  
  const buttonClasses = [
    "btn",
    `btn-${validVariant}`,
    `btn-${size}`,
    fullWidth ? "btn-full-width" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;