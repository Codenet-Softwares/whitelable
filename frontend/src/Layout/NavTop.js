import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useAppContext } from "../contextApi/context";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import strings from "../Utils/constant/stringConstant";

const NavTop = () => {
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

  return (
    <section className="main_content dashboard_part large_header_bg">
    <div className="container-fluid p-0">
  <div className="row">
    <div className="col-12">
      <div className="header_iner d-flex justify-content-between align-items-center flex-wrap">
        {/* Sidebar Toggle Icon for Mobile */}
        <div className="sidebar_icon d-lg-none">
          <i className="ti-menu"></i>
        </div>

        {/* WhiteLabel Admin Heading */}
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

        {/* Header Right Section */}
        <div className="header_right d-flex justify-content-between align-items-center flex-wrap">
          {/* Profile Info */}
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
    </section>
  );
};

export default NavTop;
