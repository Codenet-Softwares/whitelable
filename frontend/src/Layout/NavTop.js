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
      <div className="container-fluid g-0">
        <div className="row">
          <div className="col-lg-12 p-0 ">
            <div className="header_iner d-flex justify-content-between align-items-center">
              <div className="sidebar_icon d-lg-none">
                <i className="ti-menu"></i>
              </div>
              <div className="line_icon open_miniSide d-none d-lg-block" style={{cursor : "pointer"}} onClick={() => navigate(-1)}>
                <img src="../../img/line_img.png" alt="" />
              </div>
              <div className="header_right d-flex justify-content-between align-items-center">
                <div className="profile_info">
                  <img src="../../img/client_img.png" alt="#" />
                  <div className="profile_info_iner">
                    <div className="profile_author_name">
                      <p>{store.admin.roles[0].role} </p>
                      <h5>{store.admin.adminName}</h5>
                    </div>
                    <div className="profile_info_details">
                      <a style={{ cursor: "pointer" }} onClick={handleLogout}>
                        <b className="text-danger">Logout</b>
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
