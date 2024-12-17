import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contextApi/context';
import { permissionObj } from '../Utils/constant/permission';
import strings from '../Utils/constant/stringConstant';

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
    navigate('/adminaccountstatement');
  };
  return (
    <nav className="sidebar">
      <div className="logo d-flex justify-content-between">
        <a className="large_logo" href="#">
          <img src="../../img/logo.png" alt="" />
        </a>
        <a className="small_logo" href="#">
          <img src="../../img/mini_logo.png" alt="" />
        </a>
        <div className="sidebar_close_icon d-lg-none">
          <i className="ti-close"></i>
        </div>
      </div>
      <ul id="sidebar_menu" class="metismenu">
        {isUser ? (
          <li className="" onClick={handleUserToggle}>
            <a className="has-arrow" href="#" aria-expanded="false">
              <div className="nav_icon_small">
                <img src="../../img/menu-icon/dashboard.svg" alt="" />
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
                <img src="../../img/menu-icon/dashboard.svg" alt="" />
              </div>
              <div className="nav_title">
                <span>User Management </span>
              </div>
            </a>
            <ul>
              {permissionObj.allAdmin.includes(
                store.admin.roles[0].role,
              ) && (
                  <li>
                    <Link to="/allAdminCreate">
                      <span>
                        <i class="fa-solid fa-circle"></i>Create Admin
                      </span>
                    </Link>
                  </li>
                )}

              {store.admin.roles[0].permission.includes(strings.createAdmin) && (
                <li>
                  <Link to="/allAdminCreate">
                    <span>
                      <i class="fa-solid fa-circle"></i>Create Admin
                    </span>
                  </Link>
                </li>
              )}

              <li>
                <Link to="/wallet">
                  <span>
                    <i class="fa-solid fa-circle"></i>Wallet
                  </span>
                </Link>
              </li>
              {/* <li>
                <a href="#">Light Sidebar</a>
              </li> */}
            </ul>
          </li>
        )}



        {permissionObj.allAdmin.includes(
          store.admin.roles[0].role,
        ) && (
            <li className="" onClick={takeMeToAdminAccount}>
              <a className="" href="#" aria-expanded="false">
                <div>
                  <img src="../../img/menu-icon/dashboard.svg" alt="" />
                </div>
                <div>
                  <span>Account Statement</span>
                </div>
              </a>
            </li>
          )}

        {store.admin.roles[0].permission.includes(strings.accountStatement) && (
          <li className="" onClick={takeMeToAdminAccount}>
            <a className="" href="#" aria-expanded="false">
              <div>
                <img src="../../img/menu-icon/dashboard.svg" alt="" />
              </div>
              <div>
                <span>Account Statement</span>
              </div>
            </a>
          </li>
        )}

        {store.admin.roles[0].permission.includes(strings.deleteAdmin) &&
          (
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
                          {' '}
                          <i class="fa-solid fa-circle"></i>Approve delete
                        </span>
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}

        {permissionObj.allAdmin.includes(
          store.admin.roles[0].role,
        ) && (
            <>
              {isRequest ? (
                <li className="" onClick={handleRequestToggle}>
                  <a className="has-arrow" href="#" aria-expanded="false">
                    <div className="nav_icon_small">
                      <img src="../../img/menu-icon/dashboard.svg" alt="" />
                    </div>
                    <div className="nav_title">
                      <span>Request </span>
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
                      <span>Request </span>
                    </div>
                  </a>
                  <ul>
                    <li>
                      <Link to="/agentDelete">Agent Delete</Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}

        {permissionObj.allAdmin.includes(
          store.admin.roles[0].role,
        ) && (
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
                    <li>
                      <Link to="/CreateSubAdmin">
                        <span>
                          {' '}
                          <i class="fa-solid fa-circle"></i>Create New
                        </span>
                      </Link>
                    </li>

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

        {store.admin.roles[0].permission.includes(strings.createAdmin)
          && (
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
                    <li>
                      <Link to="/CreateSubAdmin">
                        <span>
                          {' '}
                          <i class="fa-solid fa-circle"></i>Create New
                        </span>
                      </Link>
                    </li>

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
        <li >
          <Link to="/Market_analysis" aria-expanded="false">
            <div className="nav_icon_small">
              <img src="../../img/menu-icon/dashboard.svg" alt="" />
            </div>
            <div className="nav_title">
              <span>Market Analysis</span>
            </div>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navside;
