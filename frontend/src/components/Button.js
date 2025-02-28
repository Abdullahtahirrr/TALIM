import React from "react";
import "../styles/Button.css";

const Button = ({ children, onClick, type = "button", variant = "dark" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button ${variant === "light" ? "button-light" : "button-dark"}`}
    >
      {children}
    </button>
  );
};

export default Button;
