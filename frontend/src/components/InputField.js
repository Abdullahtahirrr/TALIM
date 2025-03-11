import React from "react";
import "../styles/InputField.css"; 

const InputField = ({ label, type = "text", name, placeholder, value, onChange, error, options }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}

      {type === "select" ? (
        <select 
          className={`input-field ${error ? "input-error" : ""}`} 
          name={name}
          value={value} 
          onChange={onChange}
        >
          <option value="" disabled>Select an option</option>
          {options && options.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={`input-field ${error ? "input-error" : ""}`}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
        />
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default InputField;