import React, { useState } from "react";
// import './DemoNavside.css';

const DemoNavside = () => {
  const [isClosed, setIsClosed] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  const toggleSidebar = () => {
    setIsClosed(!isClosed); 
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`app-container ${isClosed ? "sidebar-closed" : ""}`}>
      
      <button className="toggle-button" onClick={toggleSidebar}>
        <i className={`bx ${isClosed ? "bx-menu" : "bx-x"}`}></i>
      </button>

      <div className={`sidebar ${isClosed ? "close" : ""}`}>
        <div className="logo-details">
          <i className="bx bx-code-alt"></i>
          <span className="logo_name">CodingLab</span>
        </div>

        <ul className="nav-links">
          <li>
            <a href="#">
              <i className="bx bx-grid-alt"></i>
              <span className="link_name">Dashboard</span>
            </a>
          </li>
          <li>
            <div className="iocn-link">
              <a href="#" onClick={toggleDropdown}>
                <i className="bx bx-collection"></i>
                <span className="link_name">Category</span>
              </a>
              <i
                className={`bx ${
                  isDropdownOpen ? "bx-chevron-up" : "bx-chevron-down"
                }`}
                onClick={toggleDropdown}
              ></i>
            </div>
            {isDropdownOpen && (
              <ul className="sub-menu">
                <li>
                  <a href="#">Subcategory 1</a>
                </li>
                <li>
                  <a href="#">Subcategory 2</a>
                </li>
                <li>
                  <a href="#">Subcategory 3</a>
                </li>
              </ul>
            )}
          </li>
          <li>
            <a href="#">
              <i className="bx bx-user"></i>
              <span className="link_name">Profile</span>
            </a>
          </li>
          <li>
            <a href="#">
              <i className="bx bx-cog"></i>
              <span className="link_name">Settings</span>
            </a>
          </li>
        </ul>

        <div className="profile-details">
          <div className="profile-content">
            <img
              src="https://gravatar.com/avatar/f57bddebd1edf91412d5d68702530099"
              alt="profileImg"
            />
          </div>
          <div className="name-job">
            <div className="profile_name">John Doe</div>
            <div className="job">Web Designer</div>
          </div>
          <i className="bx bx-log-out"></i>
        </div>
      </div>
    </div>
  );
};

export default DemoNavside;
