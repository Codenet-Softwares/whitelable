import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { resetAdminPassword_api } from "../Utils/service/apiService";
import { toast } from "react-toastify";

const ResetModal = ({ show, handleClose, userName }) => {
  const initialState = {
    newPassword: "",
    confirmPassword: "",
    adminPassword: ""
  };

  const [passwords, setPasswords] = useState(initialState);

  useEffect(() => {
    if (show) {
      setPasswords(initialState); // Reset passwords when modal opens
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
    if (
      passwords.newPassword === "" ||
      passwords.confirmPassword === "" ||
      passwords.adminPassword === ""
    ) {
      toast.error("Fields can't be empty");
      return;
    }
    if (passwords.newPassword === passwords.confirmPassword) {
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

        toast.error(error.response?.data?.message);
      }
    } else {
      toast.error("New Password and Confirm Password do not match");
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text w-100" id="basic-addon1">
                Admin Password&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="Type here...."
              aria-label="Admin Password"
              aria-describedby="basic-addon1"
              name="adminPassword"
              value={passwords.adminPassword}
              onChange={handleChange}
            />
          </div>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text w-100" id="basic-addon1">
                New Password&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="Type here...."
              aria-label="New Password"
              aria-describedby="basic-addon1"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
            />
          </div>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text w-100" id="basic-addon1">
                Confirm Password
              </span>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="Type here...."
              aria-label="Confirm Password"
              aria-describedby="basic-addon1"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
            />
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
