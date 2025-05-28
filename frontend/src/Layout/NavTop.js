import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useAppContext } from "../contextApi/context";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import strings from "../Utils/constant/stringConstant";
import { resetPasswordSuperAdmin } from "../Utils/service/apiService";

const NavTop = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [id]: "",
    }));
  };

  const navigate = useNavigate();
  const { store, dispatch } = useAppContext();

  useEffect(() => {
    let logoutPerformed = false;
    const handleUnauthorized = (error) => {
      if (!logoutPerformed && error.response && error.response.status === 423) {
        logoutPerformed = true;
        store.logout();
        toast.error("User Account Is Locked");
        navigate("/");
      }
    };

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        handleUnauthorized(error);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [store, navigate]);

  const handleLogout = () => {
    dispatch({
      type: strings.LOG_OUT,
      payload: { isLogin: false },
    });
    navigate("/");
    toast.info("Logout successfully");
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

 
  // For Reset Password Validation start
  const validateForm = () => {
    let validationErrors = {};
    const { oldPassword, newPassword, confirmPassword } = formValues;

    if (!oldPassword) validationErrors.oldPassword = "Old password is required";

    if (!newPassword) {
      validationErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      validationErrors.newPassword = "Password must be at least 6 characters";
    } else if (newPassword === oldPassword) {
      validationErrors.newPassword =
        "New password cannot be the same as old password";
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== newPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  // For Reset Password Validation End

  const handleResetPassword = async () => {
    const { oldPassword, newPassword } = formValues;
    if (!validateForm()) return;

    const payload = {
      userName: store?.admin?.adminName,
      oldPassword,
      newPassword,
    };

    try {
      const response = await resetPasswordSuperAdmin(payload);
      if (response.successCode === 200) {
        // alert("Password reset successfully!");
        closeModal();
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      // alert("Failed to reset password. Please try again.");
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setFormValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <section className="main_content dashboard_part large_header_bg">
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12">
            <div className="header_iner d-flex justify-content-between align-items-center flex-wrap">
              <div className="sidebar_icon d-lg-none">
                <i className="ti-menu"></i>
              </div>

              <h2
                className="WhiteLabel_heading text-uppercase text-center text-lg-start my-2"
                style={{
                  color: "#1E2761",
                  fontWeight: "800",
                  flex: "1 1 auto",
                }}
              >
                <span style={{ color: "#F5C93A" }}>
                  {store?.admin?.role}
                </span>{" "}
                Admin <span style={{ color: "#F5C93A" }}>Panel</span>
              </h2>

              <div className="header_right d-flex justify-content-between align-items-center flex-wrap">
                <div className="profile_info d-flex align-items-center">
                  <img
                    src="../../img/client_img.png"
                    alt="Profile"
                    className="profile_img"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    className="profile_info_iner ms-2 text-center text-lg-start"
                    style={{ flex: "1 1 auto" }}
                  >
                    <div className="profile_author_name">
                      <p className="mb-1 small">
                        {store?.admin?.role}
                      </p>
                      <h5 className="m-0">{store?.admin?.adminName.toUpperCase()}</h5>
                      <p className="m-0">ROLE: {store?.admin?.role.toUpperCase()}</p>
                    </div>
                    <div className="profile_info_details">
                      {store.admin.role === "superAdmin" && (
                        <a
                          style={{ cursor: "pointer" }}
                          onClick={() => openModal()}
                        >
                          <b className="text-primary">Reset Password</b>
                        </a>
                      )}

                      <a
                        style={{ cursor: "pointer" }}
                        onClick={handleLogout}
                        className="text-danger fw-bold"
                      >
                        Logout
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Layout />
      {isModalOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title fw-bold text-uppercase">Reset Password</h4>
                <button type="button" className="close border-0 bg-white fs-3" onClick={closeModal}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="oldPassword">Old Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="oldPassword"
                    className={`form-control ${errors.oldPassword ? "border-danger" : ""}`}
                    value={formValues.oldPassword}
                    onChange={handleChange}
                    required
                  />
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye" : "bi-eye-slash"
                    } position-absolute`}
                    style={{
                      right: "30px",
                      top: "55px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                  <p className="text-danger mb-0 fw-bold">
                    {errors.oldPassword || "\u00A0"}
                  </p>
                </div>
                <div className="form-group position-relative">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className={`form-control ${errors.newPassword ? "border-danger" : ""}`}
                    value={formValues.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <i
                    className={`bi ${
                      showNewPassword ? "bi-eye" : "bi-eye-slash"
                    } position-absolute`}
                    style={{
                      right: "15px",
                      top: "40px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                    }}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  ></i>
                  <p className="text-danger mb-0 fw-bold">
                    {errors.newPassword || "\u00A0"}
                  </p>
                </div>
                <div className="form-group position-relative">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? "border-danger" : ""}`}
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <i
                    className={`bi ${
                      showConfirmPassword ? "bi-eye" : "bi-eye-slash"
                    } position-absolute`}
                    style={{
                      right: "15px",
                      top: "40px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                    }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  ></i>
                  <p className="text-danger mb-0 fw-bold">
                    {errors.confirmPassword || "\u00A0"}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetPassword}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NavTop;
