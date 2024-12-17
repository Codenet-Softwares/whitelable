import React, { useState } from 'react';

export const ReusableInput = ({
  placeholder,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  showEyeIcon = false, // Optional prop to determine if the eye icon should be displayed
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  // If showEyeIcon is true, toggle type between "password" and "text"
  const inputType = showEyeIcon && isPasswordVisible ? "text" : type;

  return (
    <div className="form-group mb-3 position-relative">
      <input
        type={inputType}
        name={name}
        className={`form-control ${error ? "is-invalid" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      
      {showEyeIcon && (
        <div
          className={`bi ${inputType === "password" ? "bi-eye-slash" : "bi-eye"} position-absolute end-0 me-5`}
          onClick={togglePasswordVisibility}
          style={{
            cursor: "pointer",
            top: "50%", 
            transform: "translateY(-100%)", 
            right: "15px", 
          }}
        ></div>
      )}

      <div
        className="text-danger d-flex align-items-center mt-1"
        style={{ minHeight: "20px", fontSize: "0.85rem" }}
      >
        {error && (
          <>
            <i className="bi bi-info-circle me-1"></i>
            <span>{error}</span>
          </>
        )}
      </div>
    </div>
  );
};
