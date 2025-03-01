import React from "react";
import "../styles/InputField.css"; 
const InputField = ({ label, type = "text", placeholder, value, onChange, error, options }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}

      {type === "select" ? (
        <select className={`input-field ${error ? "input-error" : ""}`} value={value} onChange={onChange}>
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
          value={value}
          onChange={onChange}
        />
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default InputField;


// Example Usage
//  <div style={{ padding: "20px" }}>
//       <h2>Test Input & Dropdown</h2>
// {/* Dropdown Example */}
//       <InputField
//         label="Select Course"
//         type="select"
//         value={dropdownValue}
//         onChange={handleDropdownChange}
//         options={[
//           { value: "ai", label: "Artificial Intelligence" },
//           { value: "ml", label: "Machine Learning" },
//           { value: "cv", label: "Computer Vision" },
//         ]}
//       />
//       {/* Input Field Example */}
//       <InputField
//         label="Email Address"
//         type="email"
//         placeholder="Enter your email"
//         value={inputValue}
//         onChange={handleInputChange}
//       />

      
//     </div>
