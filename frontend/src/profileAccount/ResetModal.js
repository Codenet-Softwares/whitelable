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
  const [errors, setErrors] = useState({}); // State to track validation errors

  useEffect(() => {
    if (show) {
      setPasswords(initialState);
      setErrors({}); // Clear errors when modal opens
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function resetPassword() {
    const validationErrors = validatePasswords(passwords); // Ensure validationErrors is declared first
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // Stop execution if there are validation errors
    }

    const data = {
      userName: userName,
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
        <div>
          <div className="mb-3">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Type here..."
              name="adminPassword"
              value={passwords.adminPassword}
              onChange={handleChange}
            />
            {errors.adminPassword && <p className="text-danger">{errors.adminPassword}</p>}
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Type here..."
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && <p className="text-danger">{errors.newPassword}</p>}
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Type here..."
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
          </div>
        </div>
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
