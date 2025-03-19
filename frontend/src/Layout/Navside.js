import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contextApi/context";
import { permissionObj } from "../Utils/constant/permission";
import strings from "../Utils/constant/stringConstant";

const Navside = () => {
  const { store } = useAppContext();
  const [isUser, setIsUser] = useState(true);
  const [isRequest, setIsRequest] = useState(true);
  const [userRole, setUserRole] = useState(true);
  const navigate = useNavigate();
  const handleUserToggle = () => {
    setIsUser(!isUser);
  };

  const handleRequestToggle = () => {
    setIsRequest(!isRequest);
  };

  const handleUserRoleToggle = () => {
    setUserRole(!userRole);
  };
  const takeMeToAdminAccount = () => {
    navigate("/adminaccountstatement");
  };
  return (
    <nav className="sidebar" style={{ background: "#1E2761" }}>
      <div className="logo d-flex justify-content-between">
        <a
          className="large_logo mt-4"
          href="/welcome"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#84B9DF",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            margin: "auto",
          }}
        >
          <img
            src="../../img/sidebarAdmin_icon.png"
            alt=""
            style={{ width: "50px", height: "40px" }}
          />
        </a>

        {/* <a className="small_logo" href="#">
          <img src="../../img/mini_logo.png" alt="" />
        </a>
        <div className="sidebar_close_icon d-lg-none">
          <i className="ti-close"></i>
        </div> */}
      </div>
      <div className="mt-5">
        <ul id="sidebar_menu" class="metismenu">
          {isUser ? (
            <li className="" onClick={handleUserToggle}>
              <a className="has-arrow" href="#" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-user-cog"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>
                </div>
                <div className="nav_title">
                  <span>User Management </span>
                </div>
              </a>
            </li>
          ) : (
            <li className="" onClick={handleUserToggle}>
              <a className="has-arrow" href="#" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-user-cog"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>
                </div>
                <div className="nav_title">
                  <span>User Management </span>
                </div>
              </a>
              <ul>
                {permissionObj.allAdmin.includes(store.admin.roles[0].role) && (
                  <li>
                    <Link to="/allAdminCreate">
                      <span>
                        <i
                          class="fa-solid fa-shield"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "50px",
                          }}
                        ></i>
                        Create Admin
                      </span>
                    </Link>
                  </li>
                )}

                {store.admin.roles[0].permission.includes(
                  strings.createAdmin
                ) && (
                  <li>
                    <Link to="/allAdminCreate" className="d-flex">
                      <span>
                        <i
                          class="fa-solid fa-circle"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "50px",
                          }}
                        ></i>
                        Create Admin
                      </span>
                    </Link>
                  </li>
                )}

                <li>
                  <Link to="/wallet">
                    <span>
                      <i
                        class="fa-solid fa-wallet"
                        style={{
                          color: "black",
                          fontSize: "20px",
                          marginLeft: "50px",
                        }}
                      ></i>
                      Wallet
                    </span>
                  </Link>
                </li>
                {/* <li>
                <a href="#">Light Sidebar</a>
              </li> */}
              </ul>
            </li>
          )}
          {permissionObj.allAdmin.includes(store.admin.roles[0].role) && (
            <li className="" onClick={takeMeToAdminAccount}>
              <a className="" href="#" aria-expanded="false">
                <div>
                  <i
                    class="fa-solid fa-file-invoice"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>{" "}
                </div>
                <div>
                  <span>Account Statement</span>
                </div>
              </a>
            </li>
          )}
          {store.admin.roles[0].permission.includes(
            strings.accountStatement
          ) && (
            <li className="" onClick={takeMeToAdminAccount}>
              <a className="" href="#" aria-expanded="false">
                <div>
                  <i
                    class="fa-solid fa-file-invoice"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>{" "}
                </div>
                <div>
                  <span>Account Statement</span>
                </div>
              </a>
            </li>
          )}
          {store.admin.roles[0].permission.includes(strings.deleteAdmin) && (
            <>
              {isRequest ? (
                <li className="" onClick={handleRequestToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div className="nav_icon_small">
                      <img src="../../img/menu-icon/dashboard.svg" alt="" />
                    </div>
                    <div className="nav_title">
                      <span>Request</span>
                    </div>
                  </a>
                </li>
              ) : (
                <li className="" onClick={handleRequestToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div>
                      <img src="../../img/menu-icon/dashboard.svg" alt="" />
                    </div>
                    <div>
                      <span>Request</span>
                    </div>
                  </a>
                  <ul>
                    <li>
                      <Link to="/agentDelete">
                        <span>
                          {" "}
                          <i class="fa-solid fa-circle"></i>Approve delete
                        </span>
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}
          {permissionObj.allAdmin.includes(store?.admin?.roles[0]?.role) && (
            <>
              {isRequest ? (
                <li className="" onClick={handleRequestToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div className="nav_icon_small">
                      <i
                        class="fa-solid fa-circle"
                        style={{ color: "black", fontSize: "20px" }}
                      ></i>
                    </div>
                    <div className="nav_title">
                      <span>Request </span>
                    </div>
                  </a>
                </li>
              ) : (
                <li className="" onClick={handleRequestToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div className="nav_icon_small">
                      <i
                        class="fa-solid fa-circle"
                        style={{ color: "black", fontSize: "20px" }}
                      ></i>
                    </div>
                    <div>
                      <span>Request </span>
                    </div>
                  </a>
                  <ul>
                    <li>
                      <Link to="/agentDelete" className="">
                        <i
                          class="fa-solid fa-trash text-dark"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "30px",
                          }}
                        ></i>
                        Agent Delete
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}
          {permissionObj.allAdmin.includes(store.admin.roles[0].role) && (
            <>
              {userRole ? (
                <li className="" onClick={handleUserRoleToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div className="nav_icon_small">
                      <i
                        class="fa-solid fa-user-plus"
                        style={{ color: "black", fontSize: "20px" }}
                      ></i>
                    </div>
                    <div className="nav_title">
                      <span>User Role</span>
                    </div>
                  </a>
                </li>
              ) : (
                <li className="" onClick={handleUserRoleToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div>
                      <i
                        class="fa-solid fa-user-plus"
                        style={{ color: "black", fontSize: "20px" }}
                      ></i>
                    </div>
                    <div>
                      <span>User Role</span>
                    </div>
                  </a>
                  <ul className="d-flex flex-column ml-0">
                    {!["suspended"].includes(store?.admin?.status) && (
                      <li>
                        <Link to="/CreateSubAdmin">
                          <span>
                            {" "}
                            <i
                              class="fa-solid fa-plus"
                              style={{
                                color: "black",
                                fontSize: "20px",
                                marginLeft: "50px",
                              }}
                            ></i>
                            Create New
                          </span>
                        </Link>
                      </li>
                    )}

                    <li>
                      <Link to="/ViewAllSubAdmin">
                        <span>
                          <i
                            class="fa-solid fa-eye"
                            style={{
                              color: "black",
                              fontSize: "20px",
                              marginLeft: "50px",
                            }}
                          ></i>
                          View Existing
                        </span>
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}
          {store.admin.roles[0].permission.includes(strings.createAdmin) && (
            <>
              {userRole ? (
                <li className="" onClick={handleUserRoleToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div className="nav_icon_small">
                      <img src="../../img/menu-icon/dashboard.svg" alt="" />
                    </div>
                    <div className="nav_title">
                      <span>User Role</span>
                    </div>
                  </a>
                </li>
              ) : (
                <li className="" onClick={handleUserRoleToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div>
                      <img src="../../img/menu-icon/dashboard.svg" alt="" />
                    </div>
                    <div>
                      <span>User Role</span>
                    </div>
                  </a>
                  <ul className="d-flex flex-column ml-0">
                    {!["suspended"].includes(store?.admin?.status) && (
                      <li>
                        <Link to="/CreateSubAdmin">
                          <span>
                            {" "}
                            <i class="fa-solid fa-circle"></i>Create New
                          </span>
                        </Link>
                      </li>
                    )}

                    <li>
                      <Link to="/ViewAllSubAdmin">
                        <span>
                          <i class="fa-solid fa-circle"></i>View Existing
                        </span>
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}

          {permissionObj.allAdmin.includes(store.admin.roles[0].role) && (
            <li>
              <Link to="/Market_analysis" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-chart-line"
                    style={{ color: "black", fontSize: "20px" }}
                  >
                    {" "}
                  </i>
                </div>
                <div className="nav_title">
                  <span>Market Analysis</span>
                </div>
              </Link>
            </li>
          )}
          {store.admin.roles[0].permission.includes(strings.marketAnalysis) && (
            <li>
              <Link to="/Market_analysis" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-chart-line"
                    style={{ color: "black", fontSize: "20px" }}
                  >
                    {" "}
                  </i>
                </div>
                <div className="nav_title">
                  <span>Market Analysis</span>
                </div>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navside;
