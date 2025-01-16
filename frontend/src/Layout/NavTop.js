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
  };

  const navigate = useNavigate();
  const { store, dispatch } = useAppContext();
  // console.log("store=>>>", store);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setFormValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleResetPassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = formValues;

    if (newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match!");
      return;
    }

    if (oldPassword === newPassword) {
      alert("New Password cannot be the same as the Old Password!");
      return;
    }

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
                <span style={{ color: "#F5C93A" }}>{store?.admin?.roles[0]?.role}</span> Admin{" "}
                <span style={{ color: "#F5C93A" }}>Panel</span>
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
                      <p className="mb-1 small">{store?.admin?.roles[0]?.role}</p>
                      <h5 className="m-0">{store?.admin?.adminName}</h5>
                    </div>
                    <div className="profile_info_details">
                      {store.admin.roles[0].role === "superAdmin" && <a style={{ cursor: "pointer" }} onClick={() => openModal()}>
                        <b className="text-primary">Reset Password</b>
                      </a>}

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
                <h5 className="modal-title">Reset Password</h5>
                <button type="button" className="close" onClick={closeModal}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="oldPassword">Old Password</label>
                  <input
                    type="password"
                    id="oldPassword"
                    className="form-control"
                    value={formValues.oldPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    className="form-control"
                    value={formValues.newPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={handleResetPassword}>
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
