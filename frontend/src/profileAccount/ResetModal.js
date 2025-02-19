import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { resetAdminPassword_api } from "../Utils/service/apiService";
import { toast } from "react-toastify";
import { validatePasswords } from "../Utils/helper";


const ResetModal = ({ show, handleClose, userName }) => {
  const initialState = {
    newPassword: "",
    confirmPassword: "",
    adminPassword: "",
  };

  const [passwords, setPasswords] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [visibility, setVisibility] = useState({
    adminPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (show) {
      setPasswords(initialState);
      setErrors({});
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleVisibility = (field) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  async function resetPassword() {
    const validationErrors = validatePasswords(passwords);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const data = {
      userName,
      adminPassword: passwords.adminPassword,
      password: passwords.newPassword,
    };

    try {
      const response = await resetAdminPassword_api(data);
      toast.success(response.message);
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>CHANGE PASSWORD</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {["adminPassword", "newPassword", "confirmPassword"].map((field, index) => (
          <div className="mb-3" key={index}>
            <label className="form-label">
              {field === "adminPassword"
                ? "Admin Password"
                : field === "newPassword"
                ? "New Password"
                : "Confirm Password"}
            </label>
            <div className="input-group">
              <input
                type={visibility[field] ? "text" : "password"}
                className="form-control"
                placeholder="Type here..."
                name={field}
                value={passwords[field]}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => toggleVisibility(field)}
              >
                <i className={visibility[field] ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
            </div>
            {errors[field] && <p className="text-danger">{errors[field]}</p>}
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Back
        </Button>
        <Button variant="primary" onClick={resetPassword}>
          Change
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetModal;
