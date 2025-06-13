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
  const [isReport, setIsReport] = useState(true); // New state for  My Report Section
  const [isImage, setIsImage] = useState(true);
  const [gameAnnouncements, setGameAnnouncements] = useState(true);
  const navigate = useNavigate();

  // Added toggle function for  My Report Section
  const handleReportToggle = () => {
    setIsReport(!isReport);
  };

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
  const handleImageToggle = () => {
    setIsImage(!isImage);
  };
  const handleGameAnnoucementToggle = () => {
    setGameAnnouncements(!gameAnnouncements);
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
            style={{ width: "75px", height: "60px" }}
          />
        </a>

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
                {permissionObj.allAdmin.includes(store.admin.role) && (
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

                {store.admin.permission.includes(strings.createAdmin) && (
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
              </ul>
            </li>
          )}
          {permissionObj.allAdmin.includes(store.admin.role) && (
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
          {store.admin.permission.includes(strings.accountStatement) && (
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
          {[
            strings.deleteAdmin,
            strings.restoreAdmin,
            strings.trashView,
          ].some(permission => store.admin.permission.includes(permission)) && (
              <>
                {isRequest ? (
                  <li onClick={handleRequestToggle}>
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
                  <li onClick={handleRequestToggle}>
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
                            <i className="fa-solid fa-circle"></i> Agent Delete
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </>
            )}

          {permissionObj.allAdmin.includes(store?.admin?.role) && (
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
          {permissionObj.allAdmin.includes(store.admin.role) && (
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
          {store.admin.permission.includes(strings.createAdmin) && (
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

          {permissionObj.allAdmin.includes(store?.admin?.role) && (
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
          {store.admin.permission.includes(strings.marketAnalysis) && (
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
          {/* Added this new section for My Report */}

          {permissionObj.allAdmin.includes(store?.admin?.role) && <>{isReport ? (
            <li className="" onClick={handleReportToggle}>
              <a className="has-arrow" href="#" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-chart-pie"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>
                </div>
                <div className="nav_title">
                  <span>My Report</span>
                </div>
              </a>
            </li>
          ) : (
            <li className="" onClick={handleReportToggle}>
              <a className="has-arrow" href="#" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-chart-pie"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>
                </div>
                <div className="nav_title">
                  <span>My Report</span>
                </div>
              </a>
              <ul>
                <li>
                  <Link to="event-profit-loss">
                    <span>
                      <i
                        class="fa-solid fa-chart-column"
                        style={{
                          color: "black",
                          fontSize: "20px",
                          marginLeft: "50px",
                        }}
                      ></i>
                      Event Profit/Loss
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="downline-profit-loss">
                    <span>
                      <i
                        class="fa-solid fa-chart-line"
                        style={{
                          color: "black",
                          fontSize: "20px",
                          marginLeft: "50px",
                        }}
                      ></i>
                      Downline Profit/Loss
                    </span>
                  </Link>
                </li>
              </ul>
            </li>
          )}</>}

          {store.admin.permission.includes(strings.myReport) && <>{isReport ? (
            <li className="" onClick={handleReportToggle}>
              <a className="has-arrow" href="#" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-chart-pie"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>
                </div>
                <div className="nav_title">
                  <span>My Report</span>
                </div>
              </a>
            </li>
          ) : (
            <li className="" onClick={handleReportToggle}>
              <a className="has-arrow" href="#" aria-expanded="false">
                <div className="nav_icon_small">
                  <i
                    class="fa-solid fa-chart-pie"
                    style={{ color: "black", fontSize: "20px" }}
                  ></i>
                </div>
                <div className="nav_title">
                  <span>My Report</span>
                </div>
              </a>
              <ul>
                <li>
                  <Link to="event-profit-loss">
                    <span>
                      <i
                        class="fa-solid fa-chart-column"
                        style={{
                          color: "black",
                          fontSize: "20px",
                          marginLeft: "50px",
                        }}
                      ></i>
                      Event Profit/Loss
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="downline-profit-loss">
                    <span>
                      <i
                        class="fa-solid fa-chart-line"
                        style={{
                          color: "black",
                          fontSize: "20px",
                          marginLeft: "50px",
                        }}
                      ></i>
                      Downline Profit/Loss
                    </span>
                  </Link>
                </li>
              </ul>
            </li>
          )}</>}


          {/* Added this new section for My Report */}
          {store.admin.role === strings.superAdmin &&
            (isImage ? (
              <li onClick={handleImageToggle}>
                <a className="has-arrow" href="#" aria-expanded="false">
                  <div className="nav_icon_small">
                    <i
                      className="fa-solid fa-chart-pie"
                      style={{ color: "black", fontSize: "20px" }}
                    ></i>
                  </div>
                  <div className="nav_title">
                    <span>Add Image</span>
                  </div>
                </a>
              </li>
            ) : (
              <li onClick={handleImageToggle}>
                <a className="has-arrow" href="#" aria-expanded="false">
                  <div className="nav_icon_small">
                    <i
                      className="fa-solid fa-chart-pie"
                      style={{ color: "black", fontSize: "20px" }}
                    ></i>
                  </div>
                  <div className="nav_title">
                    <span>Add Image</span>
                  </div>
                </a>
                <ul>
                  <li>
                    <Link to="outer-image">
                      <span>
                        <i
                          className="fa-solid fa-chart-column"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "50px",
                          }}
                        ></i>
                        Outer Slider Image
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="inner-image">
                      <span>
                        <i
                          className="fa-solid fa-chart-line"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "50px",
                          }}
                        ></i>
                        Inner Slider Image
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="GameImage-slider">
                      <span>
                        <i
                          className="fa-solid fa-chart-line"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "50px",
                          }}
                        ></i>
                        Game Image
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="game-GIF">
                      <span>
                        <i
                          className="fa-solid fa-chart-line"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "50px",
                          }}
                        ></i>
                        Game GIF
                      </span>
                    </Link>
                  </li>
                </ul>
              </li>
            ))}
          {store.admin.role === strings.superAdmin &&
            (gameAnnouncements ? (
              <li className="" onClick={handleGameAnnoucementToggle}>
                <a className="has-arrow" href="#" aria-expanded="false">
                  <div className="nav_icon_small">
                    <i
                      class="fa-solid fa-chart-pie"
                      style={{ color: "black", fontSize: "20px" }}
                    ></i>
                  </div>
                  <div className="nav_title">
                    <span>Game Announcement</span>
                  </div>
                </a>
              </li>
            ) : (
              <li className="" onClick={handleGameAnnoucementToggle}>
                <a className="has-arrow" href="#" aria-expanded="false">
                  <div className="nav_icon_small">
                    <i
                      class="fa-solid fa-chart-pie"
                      style={{ color: "black", fontSize: "20px" }}
                    ></i>
                  </div>
                  <div className="nav_title">
                    <span>Game Announcement</span>
                  </div>
                </a>
                <ul>
                 
                  <li>
                    <Link to="inner-announcement">
                      <span>
                        <i
                          class="fa-solid fa-chart-line"
                          style={{
                            color: "black",
                            fontSize: "20px",
                            marginLeft: "50px",
                          }}
                        ></i>
                        Inner Announcement
                      </span>
                    </Link>
                  </li>
                </ul>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navside;
