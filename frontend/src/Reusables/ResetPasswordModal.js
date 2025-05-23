import React, { useState } from "react";

const ResetPasswordModal = ({ show, handleClose, onSubmit, userName }) => {
  const [formValues, setFormValues] = useState({
    adminPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    adminPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const { adminPassword, password, confirmPassword } = formValues;
    let formErrors = {
      password: "",
      confirmPassword: "",
      adminPassword: "",
    };

    if (!adminPassword) {
      formErrors.adminPassword = "Admin Password Is Required!";
    }
    if (!password) {
      formErrors.password = "New Password Is Required!";
    }
    if (!confirmPassword) {
      formErrors.confirmPassword = "Confirm Password Is Required!";
    }
    if (password && confirmPassword && password !== confirmPassword) {
      formErrors.confirmPassword =
        "New Password and Confirm Password do not match!";
    }

    if (
      formErrors.password ||
      formErrors.confirmPassword ||
      formErrors.adminPassword
    ) {
      setErrors(formErrors);
      return;
    }

    onSubmit(formValues);
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      tabIndex="-1"
      style={{ backgroundColor: show ? "rgba(0,0,0,0.5)" : "transparent" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title text-white">Reset Password for {userName}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  value={formValues.password}
                  onChange={handleChange}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i
                    className={`bi ${
                      showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="adminPassword" className="form-label">
                Admin Password
              </label>
              <div className="input-group">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  id="adminPassword"
                  className={`form-control ${
                    errors.adminPassword ? "is-invalid" : ""
                  }`}
                  value={formValues.adminPassword}
                  onChange={handleChange}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                >
                  <i
                    className={`bi ${
                      showAdminPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
                {errors.adminPassword && (
                  <div className="invalid-feedback">{errors.adminPassword}</div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;